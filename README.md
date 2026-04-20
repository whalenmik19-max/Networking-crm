# Networking CRM

A beginner-friendly personal networking CRM built with Next.js and TypeScript for students and early-career professionals.

## What this app does

Version 1 includes:

- A dashboard that highlights upcoming follow-ups
- A contacts page with all saved relationships
- A form for adding a new contact
- A contact detail page for reviewing notes
- The main fields you asked for: name, company, role, where we met, notes, next follow-up date, and tags

This version stores contact data in the browser with `localStorage`, which keeps the project simple for learning and easy to run without a database.

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
