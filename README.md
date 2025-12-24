SyncCycle
Couple Productivity Suite with BPD Support

SyncCycle is a specialized productivity suite designed for couples, featuring integrated support for Borderline Personality Disorder (BPD) through evidence-based coping strategies and collaborative tracking.
🚀 Tech Stack

    Framework: Next.js 15+ (App Router)

    Frontend: React 19, TypeScript, Tailwind CSS

    Backend-as-a-Service: Supabase (Auth, Postgres, Realtime)

    State Management: Zustand & TanStack Query v5

    Icons: Lucide React & Tabler Icons

    Deployment: Vercel

✨ Features
Core Modules

    Duo-Dashboard: A centralized hub for shared productivity tools.

    BPD Tracker: Dedicated tools for tracking mood and managing episodes with evidence-based coping skills.

    Finance Management: Collaborative budget tracking with an envelope-style system.

    SMART Goals: Shared and personal goal tracking with streak management.

    Relationship Retros: Weekly guided retrospectives to improve communication.

📂 Project Structure

├── app/              # Next.js App Router (Pages, Layouts, API)
├── components/       # Shared React components (Sidebar, UI elements)
├── hooks/            # Custom React Query & Logic hooks
├── lib/              # Third-party client initializations (Supabase)
├── stores/           # Global state management (Zustand)
├── public/           # Static assets (favicons, images)
└── supabase/         # Database migrations and local CLI config

🛠️ Getting Started
1. Prerequisites

    Node.js 20+

    npm

    Supabase CLI (for local development)

2. Environment Setup

Create a .env.local file in the root directory:

NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

3. Installation

# Install dependencies
npm install

# Start the development server
npm run dev
 Coding partner

    Query successful

Here is a rewritten README.md tailored to your new Next.js App Router architecture. This version reflects the removal of legacy components like Express and Vite, focusing on your modernized full-stack setup with Supabase and Vercel.
SyncCycle
Couple Productivity Suite with BPD Support

SyncCycle is a specialized productivity suite designed for couples, featuring integrated support for Borderline Personality Disorder (BPD) through evidence-based coping strategies and collaborative tracking.
🚀 Tech Stack

    Framework: Next.js 15+ (App Router)

    Frontend: React 19, TypeScript, Tailwind CSS

    Backend-as-a-Service: Supabase (Auth, Postgres, Realtime)

    State Management: Zustand & TanStack Query v5

    Icons: Lucide React & Tabler Icons

    Deployment: Vercel

✨ Features
Core Modules

    Duo-Dashboard: A centralized hub for shared productivity tools.

    BPD Tracker: Dedicated tools for tracking mood and managing episodes with evidence-based coping skills.

    Finance Management: Collaborative budget tracking with an envelope-style system.

    SMART Goals: Shared and personal goal tracking with streak management.

    Relationship Retros: Weekly guided retrospectives to improve communication.

📂 Project Structure
Plaintext

├── app/              # Next.js App Router (Pages, Layouts, API)
├── components/       # Shared React components (Sidebar, UI elements)
├── hooks/            # Custom React Query & Logic hooks
├── lib/              # Third-party client initializations (Supabase)
├── stores/           # Global state management (Zustand)
├── public/           # Static assets (favicons, images)
└── supabase/         # Database migrations and local CLI config

🛠️ Getting Started
1. Prerequisites

    Node.js 20+

    npm

    Supabase CLI (for local development)

2. Environment Setup

Create a .env.local file in the root directory:
Bash

NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

3. Installation
Bash

# Install dependencies
npm install

# Start the development server
npm run dev

📜 Scripts

    npm run dev: Starts the Next.js development server.

    npm run build: Compiles the application for production.

    npm run lint: Runs ESLint to ensure code quality.

⚖️ License

Distributed under the MIT License. See LICENSE for more information.

📊 Database Schema
1. profiles

Stores user-specific metadata and links to Supabase Auth.

    id: uuid (Primary Key, references auth.users.id)

    username: text (Display name)

    avatar_url: text (Link to bucket storage)

    partner_id: uuid (Link to another profile for couple syncing)

2. coping_skills

The library of evidence-based strategies used in the BPD Tracker.

    id: uuid (Primary Key)

    name: text

    category: text (e.g., "Distress Tolerance", "Mindfulness")

    description: text

3. finance_transactions

Used for the budget envelope system.

    id: uuid

    user_id: uuid (Owner)

    amount: numeric

    category: text

    date: timestamp

4. goals

Tracks SMART goals and progress.

    id: uuid

    title: text

    target_date: date

    is_completed: boolean