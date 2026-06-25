export type QuestionType = "multiple_choice" | "true_false" | "image" | "text";
export type QuizStatus = "draft" | "published";
export type SessionStatus = "waiting" | "running" | "paused" | "revealing" | "finished";

export type Quiz = {
  id: string;
  title: string;
  description: string;
  status: QuizStatus;
  created_at: string;
  updated_at: string;
};

export type Question = {
  id: string;
  quiz_id: string;
  prompt: string;
  type: QuestionType;
  options: string[];
  correct_answer: string;
  timer_seconds: number;
  points: number;
  image_url?: string | null;
  position: number;
};

export type Team = {
  id: string;
  session_id: string;
  name: string;
  members: number;
  score: number;
  connected: boolean;
  joined_at: string;
};

export type LiveSession = {
  id: string;
  quiz_id: string;
  code: string;
  status: SessionStatus;
  current_question_index: number;
  started_at?: string | null;
  question_started_at?: string | null;
  reveal_started_at?: string | null;
  created_at: string;
};

export type Answer = {
  id: string;
  session_id: string;
  team_id: string;
  question_id: string;
  answer: string;
  is_correct: boolean;
  points_awarded: number;
  response_ms: number;
  created_at: string;
};

export type SessionSnapshot = {
  session: LiveSession;
  quiz: Quiz;
  questions: Question[];
  teams: Team[];
  answers: Answer[];
  leaderboard: Team[];
  currentQuestion?: Question;
  stats: {
    answersReceived: number;
    averageResponseMs: number;
    correctPercent: number;
  };
};
