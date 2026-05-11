# Trackbook

**Your job hunt logbook.** Trackbook is a web app to keep track of every job offer you apply to: where you applied, what stage each process is in, who replied, who ghosted you, and how well your overall search is going.

Job hunting means dozens of applications running in parallel, different CVs, different cover letters, emails getting lost, and interviews overlapping. Trackbook centralizes all of that in one place and gives you real numbers on your process: response rate, conversion funnel by stage, and ghosting analytics.

![Trackbook dashboard](./public/dashboard.png)

## What you can do

- **Log applications** with company, role, work mode, salary, source, rating and notes
- **Board or list view** — Kanban view by status (Applied, Screening, Interview, Offer, Rejected) or filterable list
- **Analytics dashboard** with key metrics: total applications, response rate, conversion funnel, ghosting analytics and recent activity
- **Manage CVs and cover letters** in one place, ready to reuse
- **Export reports** as CSV or PDF to keep your history outside the app
- **Multi-language** (English / Spanish) and light/dark themes

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- React Router 7
- Supabase (magic link auth + PostgreSQL database)
- Recharts (charts)
- Lucide (icons)

## Setup

```bash
npm install
```

Create a `.env.local` file in the root with your Supabase credentials:

```
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run preview  # preview the build
npm run lint     # eslint
```

## Database

The full Supabase schema is in [`supabase_schema.sql`](./supabase_schema.sql). Paste it into `Supabase > SQL Editor > New Query` to create the tables.

The magic link email template is in [`supabase-email-template-magic-link.html`](./supabase-email-template-magic-link.html).
