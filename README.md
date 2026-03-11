# AI Quiz Generator

A full-stack web application that automatically generates multiple-choice quizzes from educational documents (PDF, PPTX) using the OpenAI API.

## Features

- **Document Upload:** Teachers upload PDF or PowerPoint documents.
- **AI Question Generation:** Extracts text and generates 5-20 multiple choice questions using OpenAI.
- **Student Interface:** Students can take generated quizzes online and get their answers auto-graded.
- **Teacher Dashboard:** View created quizzes, student results and export scores in CSV format.

## Technology Stack

- **Frontend:** Next.js (React), Tailwind CSS, Lucide React
- **Backend:** Node.js, Express, Multer
- **Database:** Supabase (PostgreSQL)
- **AI Engine:** OpenAI API (`gpt-4o-mini`)
- **File Parsing:** `pdf-parse`, `officeparser`

## Prerequisites

- Node.js installed (v18+)
- An OpenAI API Key
- A Supabase account and project with the required database tables

## Setup Instructions

### 1. Database Setup (Supabase)

1. Create a new Supabase project.
2. In the SQL Editor, run the schema provided in `backend/init.sql` to create the `users`, `quizzes`, `questions`, and `submissions` tables.
3. Get your `SUPABASE_URL` and `SUPABASE_KEY` from Project Settings > API.

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder containing:

```env
PORT=8000
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

Start the backend:
```bash
node index.js
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start the Next.js development server:
```bash
npm run dev
```

The application will be accessible at:
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:8000`

## Production Deployment

- **Frontend:** Deploy on Vercel by linking the `frontend` folder directly.
- **Backend:** Deploy on Render or Railway, mapping the required environment variables.
- **Database:** Hosted on Supabase automatically.

## Notes

If Supabase credentials are not provided in the backend `.env` file, the backend will process PDF and prompt OpenAI but will not save the data persistently (useful for local UI testing).
