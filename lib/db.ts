import { neon } from "@neondatabase/serverless";
import { generateJoinCode } from "@/lib/utils";
import type { Answer, LiveSession, Question, Quiz, SessionSnapshot, Team } from "@/lib/types";

const databaseUrl = process.env.DATABASE_URL || "postgresql://user:pass@localhost/db";

export const sql = neon(databaseUrl);

let initPromise: Promise<void> | null = null;

export async function ensureSchema() {
  if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required in production.");
  }
  if (!initPromise) {
    initPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS admins (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS quizzes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'draft',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS questions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
          prompt TEXT NOT NULL,
          type TEXT NOT NULL,
          options JSONB NOT NULL DEFAULT '[]',
          correct_answer TEXT NOT NULL,
          timer_seconds INTEGER NOT NULL DEFAULT 20,
          points INTEGER NOT NULL DEFAULT 1000,
          image_url TEXT,
          position INTEGER NOT NULL DEFAULT 0
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
          code TEXT NOT NULL UNIQUE,
          status TEXT NOT NULL DEFAULT 'waiting',
          current_question_index INTEGER NOT NULL DEFAULT 0,
          started_at TIMESTAMPTZ,
          question_started_at TIMESTAMPTZ,
          reveal_started_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS teams (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          members INTEGER NOT NULL DEFAULT 1,
          score INTEGER NOT NULL DEFAULT 0,
          connected BOOLEAN NOT NULL DEFAULT true,
          joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE(session_id, name)
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS answers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
          team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
          question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
          answer TEXT NOT NULL,
          is_correct BOOLEAN NOT NULL,
          points_awarded INTEGER NOT NULL DEFAULT 0,
          response_ms INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE(session_id, team_id, question_id)
        )`;
      await sql`CREATE INDEX IF NOT EXISTS idx_sessions_code ON sessions(code)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_questions_quiz_position ON questions(quiz_id, position)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_answers_session_question ON answers(session_id, question_id)`;
    })();
  }
  return initPromise;
}

export async function listQuizzes() {
  await ensureSchema();
  return (await sql`SELECT * FROM quizzes ORDER BY updated_at DESC`) as unknown as Quiz[];
}

export async function getQuiz(id: string) {
  await ensureSchema();
  const [quiz] = (await sql`SELECT * FROM quizzes WHERE id = ${id}`) as unknown as Quiz[];
  const questions = (await sql`SELECT * FROM questions WHERE quiz_id = ${id} ORDER BY position ASC`) as unknown as Question[];
  return quiz ? { quiz, questions: normalizeQuestions(questions) } : null;
}

export async function upsertQuiz(input: { id?: string; title: string; description: string; status: string; questions: Partial<Question>[] }) {
  await ensureSchema();
  const [quiz] = (input.id
    ? await sql`UPDATE quizzes SET title=${input.title}, description=${input.description}, status=${input.status}, updated_at=now() WHERE id=${input.id} RETURNING *`
    : await sql`INSERT INTO quizzes(title, description, status) VALUES(${input.title}, ${input.description}, ${input.status}) RETURNING *`) as unknown as Quiz[];
  await sql`DELETE FROM questions WHERE quiz_id=${quiz.id}`;
  for (const [index, question] of input.questions.entries()) {
    await sql`
      INSERT INTO questions(quiz_id, prompt, type, options, correct_answer, timer_seconds, points, image_url, position)
      VALUES(${quiz.id}, ${question.prompt || ""}, ${question.type || "multiple_choice"}, ${JSON.stringify(question.options || [])}::jsonb,
      ${question.correct_answer || ""}, ${question.timer_seconds || 20}, ${question.points || 1000}, ${question.image_url || null}, ${index})`;
  }
  return getQuiz(quiz.id);
}

export async function deleteQuiz(id: string) {
  await ensureSchema();
  await sql`DELETE FROM quizzes WHERE id=${id}`;
}

export async function duplicateQuiz(id: string) {
  const original = await getQuiz(id);
  if (!original) throw new Error("Quiz not found");
  return upsertQuiz({
    title: `${original.quiz.title} Copy`,
    description: original.quiz.description,
    status: "draft",
    questions: original.questions
  });
}

export async function createSession(quizId: string) {
  await ensureSchema();
  let code = generateJoinCode();
  for (let i = 0; i < 6; i++) {
    const existing = await sql`SELECT id FROM sessions WHERE code=${code}`;
    if (existing.length === 0) break;
    code = generateJoinCode();
  }
  const [session] = (await sql`INSERT INTO sessions(quiz_id, code) VALUES(${quizId}, ${code}) RETURNING *`) as unknown as LiveSession[];
  return session;
}

export async function getSnapshot(code: string): Promise<SessionSnapshot | null> {
  await ensureSchema();
  const [session] = (await sql`SELECT * FROM sessions WHERE code=${code.toUpperCase()}`) as unknown as LiveSession[];
  if (!session) return null;
  const [quiz] = (await sql`SELECT * FROM quizzes WHERE id=${session.quiz_id}`) as unknown as Quiz[];
  const questions = normalizeQuestions((await sql`SELECT * FROM questions WHERE quiz_id=${session.quiz_id} ORDER BY position ASC`) as unknown as Question[]);
  const teams = (await sql`SELECT * FROM teams WHERE session_id=${session.id} ORDER BY score DESC, joined_at ASC`) as unknown as Team[];
  const answers = (await sql`SELECT * FROM answers WHERE session_id=${session.id} ORDER BY created_at ASC`) as unknown as Answer[];
  const currentQuestion = questions[session.current_question_index];
  const currentAnswers = currentQuestion ? answers.filter((answer) => answer.question_id === currentQuestion.id) : [];
  const averageResponseMs = currentAnswers.length
    ? Math.round(currentAnswers.reduce((sum, answer) => sum + answer.response_ms, 0) / currentAnswers.length)
    : 0;
  const correctPercent = currentAnswers.length
    ? Math.round((currentAnswers.filter((answer) => answer.is_correct).length / currentAnswers.length) * 100)
    : 0;
  console.log(
    questions.map((q) => ({
      prompt: q.prompt,
      type: q.type,
      options: q.options,
      correct: q.correct_answer,
    }))
    );
  return {
    session,
    quiz,
    questions,
    teams,
    answers,
    leaderboard: [...teams].sort((a, b) => b.score - a.score),
    currentQuestion,
    stats: { answersReceived: currentAnswers.length, averageResponseMs, correctPercent }
  };
}

export async function joinSession(code: string, name: string, members: number) {
  const snapshot = await getSnapshot(code);
  if (!snapshot) throw new Error("Session not found");
  if (snapshot.session.status !== "waiting") throw new Error("This quiz has already started");
  const [team] = (await sql`
    INSERT INTO teams(session_id, name, members)
    VALUES(${snapshot.session.id}, ${name.trim()}, ${members})
    ON CONFLICT(session_id, name) DO UPDATE SET connected=true, members=EXCLUDED.members
    RETURNING *`) as unknown as Team[];
  return team;
}

export async function startSession(code: string) {
  await ensureSchema();
  const [session] = (await sql`
    UPDATE sessions SET status='running', started_at=COALESCE(started_at, now()), question_started_at=now(), current_question_index=0
    WHERE code=${code.toUpperCase()} RETURNING *`) as unknown as LiveSession[];
  return session;
}

export async function setSessionStatus(code: string, status: "paused" | "running" | "revealing" | "finished") {
  await ensureSchema();
  const [session] = (await sql`
    UPDATE sessions SET status=${status}, reveal_started_at=CASE WHEN ${status}='revealing' THEN now() ELSE reveal_started_at END
    WHERE code=${code.toUpperCase()} RETURNING *`) as unknown as LiveSession[];
  return session;
}

export async function advanceSession(code: string) {
  const snapshot = await getSnapshot(code);
  if (!snapshot) throw new Error("Session not found");
  const next = snapshot.session.current_question_index + 1;
  const finished = next >= snapshot.questions.length;
  const [session] = (await sql`
    UPDATE sessions
    SET status=${finished ? "finished" : "running"}, current_question_index=${finished ? snapshot.session.current_question_index : next}, question_started_at=now()
    WHERE id=${snapshot.session.id} RETURNING *`) as unknown as LiveSession[];
  return session;
}

export async function restartSession(code: string) {
  const snapshot = await getSnapshot(code);
  if (!snapshot) throw new Error("Session not found");
  await sql`DELETE FROM answers WHERE session_id=${snapshot.session.id}`;
  await sql`UPDATE teams SET score=0 WHERE session_id=${snapshot.session.id}`;
  const [session] = (await sql`
    UPDATE sessions SET status='waiting', current_question_index=0, started_at=null, question_started_at=null, reveal_started_at=null
    WHERE id=${snapshot.session.id} RETURNING *`) as unknown as LiveSession[];
  return session;
}

export async function submitAnswer(code: string, teamId: string, answer: string) {
  const snapshot = await getSnapshot(code);
  if (!snapshot?.currentQuestion) throw new Error("Question not active");
  if (snapshot.session.status !== "running") throw new Error("Question is not accepting answers");
  if (!answer.trim()){ throw new Error("Answer cannot be empty");}
  const question = snapshot.currentQuestion;
  const startedAt = snapshot.session.question_started_at ? new Date(snapshot.session.question_started_at).getTime() : Date.now();
  const responseMs = Math.max(0, Date.now() - startedAt);
  const normalize = (text: string) => text.trim().replace(/\s+/g," ").toLowerCase();
  const isCorrect = normalize(answer) === normalize(question.correct_answer);
  const timeFactor = Math.max(0.25, 1 - responseMs / (question.timer_seconds * 1000));
  const points = isCorrect ? Math.round(question.points * timeFactor) : 0;
  const [saved] = (await sql`
    INSERT INTO answers(session_id, team_id, question_id, answer, is_correct, points_awarded, response_ms)
    VALUES(${snapshot.session.id}, ${teamId}, ${question.id}, ${answer}, ${isCorrect}, ${points}, ${responseMs})
    ON CONFLICT(session_id, team_id, question_id) DO NOTHING
    RETURNING *`) as unknown as Answer[];
  if (!saved) throw new Error("Answer already submitted");
  await sql`UPDATE teams SET score=score + ${points} WHERE id=${teamId}`;
  const fresh = await getSnapshot(code);
  const team = fresh?.leaderboard.find((item) => item.id === teamId);
  const rank = fresh ? fresh.leaderboard.findIndex((item) => item.id === teamId) + 1 : 0;
  return { answer: saved, team, rank };
}

function normalizeQuestions(rows: Question[]) {
  return rows.map((row) => ({
    ...row,
    options: Array.isArray(row.options) ? row.options : JSON.parse(String(row.options || "[]"))
  }));
}
