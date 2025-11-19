# DojoFlow - Franchise CRM

DojoFlow is a multi-tenant CRM solution for Code Ninjas franchises, built with the T3 Stack adapted for Supabase.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (SSR)
- **State:** React Query + Zustand
- **Forms:** React Hook Form + Zod
- **Drag & Drop:** @dnd-kit

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Database Setup:**
   Run the migration in `supabase/migrations/20240101000000_initial_schema.sql` in your Supabase SQL Editor.

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

## Key Features

- **Multi-Tenancy:** Row Level Security (RLS) ensures data isolation between franchises.
- **Pipeline:** Kanban board with drag-and-drop status updates and "Staleness" alerts.
- **Lead Intake:** Validated forms for capturing Guardian and Student details with age-specific program logic.
- **Tours:** Calendar view for managing tour schedules.

## Project Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/components`: Reusable UI components and feature-specific components (leads, tours).
- `src/lib`: Utilities, schemas, store, and Supabase clients.
- `supabase`: SQL migrations.

