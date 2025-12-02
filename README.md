# Fitness Tracker AI

A mobile-optimized fitness tracking web app with AI-powered natural language workout logging. Built with Next.js 14, Tailwind CSS, Supabase, and Claude AI.

## Features

- **Natural Language Workout Logging** - Tell the AI what you did: "3 sets of 8 bench press at 135 lbs"
- **Workout Templates** - Quick start with Back Day, Chest Day, Leg Day, or Custom
- **Track Sets, Reps, Weight** - Full exercise logging with editable fields
- **Dark Theme** - Easy on the eyes, perfect for the gym
- **Mobile-First Design** - Optimized for phone use at the gym
- **Google OAuth** - Simple sign-in, secure data

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: NextAuth.js with Google OAuth
- **AI**: Anthropic Claude (Haiku model)
- **Deployment**: Vercel-ready

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd fitness-tracker-ai
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Copy your project URL and anon key from Settings > API

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable the Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy the Client ID and Client Secret

### 4. Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key

### 5. Configure Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-string

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

Generate a NextAuth secret:
```bash
openssl rand -base64 32
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## AI Chat Commands

The AI understands natural language. Try commands like:

- "I did 3 sets of 8 reps at 135 lbs for bench press"
- "Add face pulls, 3x12 at 50 lbs"
- "Change rows to 4 sets"
- "Remove dumbbell curls"
- "I skipped leg press today"
- "Add a note: felt strong today, increase weight next time"

## Deployment to Vercel

1. Push your code to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add all environment variables
4. Update Google OAuth redirect URI to your production URL:
   - `https://your-app.vercel.app/api/auth/callback/google`

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # NextAuth config
│   │   │   ├── chat/                # AI chat endpoint
│   │   │   └── workouts/            # Workout CRUD endpoints
│   │   ├── dashboard/               # Main workout list
│   │   ├── workout/[id]/            # Workout detail page
│   │   ├── layout.tsx
│   │   └── page.tsx                 # Landing page
│   ├── components/
│   │   ├── ChatBar.tsx              # AI chat interface
│   │   ├── ExerciseTable.tsx        # Exercise list
│   │   ├── NewWorkoutModal.tsx      # Template picker
│   │   ├── Providers.tsx            # Auth context
│   │   ├── WorkoutCard.tsx          # Workout list item
│   │   └── WorkoutHeader.tsx        # Workout detail header
│   ├── lib/
│   │   ├── supabase.ts              # DB client
│   │   └── templates.ts             # Workout templates
│   └── types/
│       ├── database.ts              # Type definitions
│       └── next-auth.d.ts           # Auth types
├── supabase/
│   └── schema.sql                   # Database schema
└── .env.example                     # Environment template
```

## License

MIT
