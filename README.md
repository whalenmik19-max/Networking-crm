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

This version uses Supabase Auth for sign up and log in, while still storing contact data in the browser with `localStorage` so the project stays simple to learn from.

## Before you deploy

This app currently uses:

- Supabase Auth for user accounts and login sessions
- browser `localStorage` for:
- contacts
- reminders

That means:

- each person will only see the contacts saved in their own browser on that device
- data does not sync across devices
- this is good for a demo or student project
- this is not a full production-ready multi-user data backend yet

If you want shared, synced contacts later, the next step would be storing contacts in Supabase tables instead of only in the browser.

## Getting started

1. Open a terminal in this project:

   ```bash
   cd /Users/mikaelawhalen/Documents/Codex/networking-crm
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local environment file:

   ```bash
   cp .env.example .env.local
   ```

4. Add your Supabase values to `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

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

- `components/auth-provider.tsx`
  A React context that uses Supabase Auth for sign up, log in, log out, and session loading.

- `components/contacts-provider.tsx`
  A React context that stores contacts in memory and syncs them to `localStorage`, using the logged-in user's ID to keep each person's contact list separate.

- `app/feedback/page.tsx`
  A submit-only feedback form that writes feedback into Supabase for admin review.

- `lib/sample-contacts.ts`
  Starter data so the app is not empty on first load.

- `lib/supabase/client.ts`
  The shared browser Supabase client used by the auth provider.

- `lib/contact-utils.ts`
  Small helper functions for formatting dates and sorting follow-ups.

- `lib/types.ts`
  Shared TypeScript types for contacts.

## Beginner notes

- This project uses the Next.js App Router, so each `page.tsx` file becomes a route.
- The app now uses Supabase Auth, but contact records are still stored locally in the browser.
- A strong version 2 step would be moving contacts, interactions, and reminders into Supabase tables.
