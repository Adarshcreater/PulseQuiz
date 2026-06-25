# PulseQuiz

PulseQuiz is a production-ready Kahoot-style realtime quiz platform built with Next.js 15, React 19, TypeScript, Tailwind CSS, Neon PostgreSQL, and Pusher.

## Interfaces

- `/admin` - password-protected quiz management, analytics, live controls, imports, exports, duplication, draft and publish flow.
- `/projector/[code]` - projector-safe display. It shows join details, questions, options, timers, answer reveal, and final winners only. It never shows scores or player names during gameplay.
- `/play` and `/play/[code]` - mobile-first player flow for joining, answering once, and seeing only the player's own result, score, and rank.

## Features

- Admin password login with signed HTTP-only session cookie.
- Automatic Neon PostgreSQL table creation on first run.
- Quizzes, questions, sessions, teams, answers, and admins tables.
- Multiple choice, true/false, image, and text questions.
- Pusher realtime events for joins, answers, question changes, reveals, pauses, restarts, and completion.
- QR code join flow on the projector screen.
- Random six-character join codes.
- Live admin analytics: connected teams, submissions, response time, correctness, leaderboard, and per-option stats.
- Pause, resume, reveal, advance, restart, CSV export, and PDF export endpoint.
- Modern dark glass UI with responsive layouts, motion, toasts, loading and offline states.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill in:

```bash
DATABASE_URL="your Neon pooled connection string"
ADMIN_PASSWORD="your admin password"
SESSION_SECRET="a long random string"
PUSHER_APP_ID="..."
PUSHER_KEY="..."
NEXT_PUBLIC_PUSHER_KEY="..."
PUSHER_SECRET="..."
PUSHER_CLUSTER="..."
NEXT_PUBLIC_PUSHER_CLUSTER="..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Run the app:

```bash
npm run dev
```

5. Open `http://localhost:3000/admin`, log in, create the demo quiz, start it, then open the projector and player links.

## Database

No Prisma, Drizzle, or Supabase is used. The app uses `@neondatabase/serverless` directly. Tables are created automatically by `lib/db.ts`:

- `quizzes`
- `questions`
- `sessions`
- `teams`
- `answers`
- `admins`

The schema is idempotent and runs on first database access in a serverless-friendly cached promise.

## Realtime

All live updates are published to `quiz-[CODE]` Pusher channels. Clients subscribe to the channel and update local snapshots immediately. If Pusher client keys are missing during local development, the client falls back to a slow refresh path so screens remain usable while configuration is being completed.

## Vercel Deployment

1. Create a Neon project and copy the pooled PostgreSQL connection string.
2. Create a Pusher Channels app and copy app id, key, secret, and cluster.
3. Import this project into Vercel.
4. Add all variables from `.env.example`.
5. Deploy.

## Testing Checklist

- Admin login rejects a wrong password and accepts `ADMIN_PASSWORD`.
- Create Demo Quiz creates a published quiz.
- Start opens a session with a unique join code.
- Projector waiting screen shows QR code and connected team count.
- Player joins with code, team name, and members.
- Starting the quiz updates projector and player screens without refresh.
- Player can submit only once per question.
- Player result shows correct/incorrect, points, total score, and rank.
- Admin dashboard shows live submissions and leaderboard.
- Projector does not show leaderboard during gameplay.
- Reveal highlights only the correct answer on the projector.
- Final question completion shows top three teams, winner, confetti, and final leaderboard.
- CSV and PDF result exports download from the live admin screen.

## Sample Data

Use `data/sample-quiz.json` with Import JSON, or click Create Demo Quiz in the admin dashboard.
