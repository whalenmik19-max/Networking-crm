# Networking CRM

A beginner-friendly personal networking CRM built with Next.js and TypeScript for students and early-career professionals.

## What this app does

Version 1 includes:

- A dashboard that highlights upcoming follow-ups
- A contacts page with all saved relationships
- A form for adding a new contact
- A contact detail page for reviewing notes
- Sign up, log in, and log out
- Per-user contact storage in the browser
- Interaction history and conversation prep on each contact page
- The main fields you asked for: name, company, role, school, where we met, notes, next follow-up date, relationship type, and tags

This version stores contact data in the browser with `localStorage`, which keeps the project simple for learning and easy to run without a database.

## Before you deploy

This app currently uses browser `localStorage` for:

- user accounts
- login sessions
- contacts
- reminders

That means:

- each person will only see the data saved in their own browser
- data does not sync across devices
- this is good for a demo or student project
- this is not a production-ready multi-user backend yet

If you want shared accounts and real synced data later, the next step would be adding a backend such as Supabase, Firebase, or Postgres.

## Getting started

1. Open a terminal in this project:

   ```bash
   cd /Users/mikaelawhalen/Documents/Codex/networking-crm
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploying to Vercel

The easiest way to get a public link is to deploy with Vercel.

1. Push this project to GitHub.

2. Go to [Vercel](https://vercel.com/) and sign in.

3. Click **Add New...** then **Project**.

4. Import your GitHub repository.

5. Keep the default Next.js settings.

6. Click **Deploy**.

After deployment, Vercel will give you a public URL you can share.

## Important deployment note

Because this app uses `localStorage`, people visiting the deployed app will not share the same data.

Examples:

- if you add a contact in your browser, someone else will not see it in their browser
- if you log in on your laptop, that same account data will not automatically appear on your phone unless it was created there too

For a demo, this is completely fine. For a real product, you would move auth and contacts into a database-backed system.

## Available scripts

- `npm run dev` starts the local development server
- `npm run build` creates a production build
- `npm run start` runs the production server
- `npm run lint` runs Next.js linting

## File structure

```text
networking-crm/
├── app/
│   ├── contacts/
│   │   ├── [id]/page.tsx
│   │   ├── new/page.tsx
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx
├── components/
│   ├── app-shell.tsx
│   ├── contact-form.tsx
│   ├── contacts-provider.tsx
│   ├── empty-state.tsx
│   └── section-card.tsx
├── lib/
│   ├── contact-utils.ts
│   ├── sample-contacts.ts
│   └── types.ts
├── .gitignore
├── next-env.d.ts
├── next.config.ts
├── package.json
├── README.md
└── tsconfig.json
```

## How the files work

- `app/layout.tsx`
  Wraps the whole app with the global layout, fonts, styles, and the contacts provider.

- `app/page.tsx`
  The dashboard page. It shows summary cards and upcoming follow-ups.

- `app/contacts/page.tsx`
  The contacts list page. It displays all contacts in a simple table-style layout.

- `app/contacts/new/page.tsx`
  The add contact page. It renders the reusable form component.

- `app/contacts/[id]/page.tsx`
  The individual contact detail page. It looks up one contact by ID and shows notes and metadata.

- `components/app-shell.tsx`
  The top-level navigation and page shell used across the app.

- `components/contact-form.tsx`
  The form logic for creating new contacts and redirecting to the new detail page.

- `components/contacts-provider.tsx`
  A React context that stores contacts in memory and syncs them to `localStorage`.

- `lib/sample-contacts.ts`
  Starter data so the app is not empty on first load.

- `lib/contact-utils.ts`
  Small helper functions for formatting dates and sorting follow-ups.

- `lib/types.ts`
  Shared TypeScript types for contacts.

## Beginner notes

- This project uses the Next.js App Router, so each `page.tsx` file becomes a route.
- The app is intentionally database-free for version 1.
- If you want a version 2 later, a good next step would be editing contacts and saving them to a real backend like Supabase, Postgres, or Firebase.
