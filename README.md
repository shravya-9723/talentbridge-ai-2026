# TalentBridge AI

TalentBridge AI is a full-stack Next.js application for resume vs job-description skill-gap analysis, adaptive assessment, and guided upskilling plans.

## Features

- Light glassmorphism UI with soft gradient background
- Upload support for `PDF`, `DOCX`, `TXT`, `JPG`, `PNG`, `JPEG`
- Textarea fallback for resume and job description
- Automatic file parsing via `/api/parse`
- Skill extraction and matching (`matched`, `missing`, `weak`)
- Assessment chat with per-question progress and saved answers
- Evaluation API with weighted final scoring
- Results dashboard with:
  - skill score progress bars
  - missing and weak skill gap lists
  - 7-14 day learning plan
  - curated resources

## Navigation Flow

`Input Page -> Skill Match -> Assessment Chat -> Results Dashboard`

## Tech Stack

- Next.js (App Router, TypeScript)
- Tailwind CSS
- Node.js Route Handlers
- Groq SDK (`groq-sdk`)
- Zod
- `pdf-parse` (PDF parsing)
- `mammoth` (DOCX parsing)

## API Endpoints

- `POST /api/parse`
- `POST /api/analyze-skills`
- `POST /api/generate-questions`
- `POST /api/evaluate`
- `POST /api/generate-learning-plan`

Every endpoint returns structured JSON:

```json
{ "success": true, "data": {} }
```

or

```json
{ "success": false, "error": "message", "details": "optional" }
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

3. Start dev server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Deployment

Ready for Vercel deployment:

1. Push repository to GitHub
2. Import project into Vercel
3. Add env vars (`GROQ_API_KEY`, optional `GROQ_MODEL`)
4. Deploy
