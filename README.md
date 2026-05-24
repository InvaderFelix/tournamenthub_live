-- MATCHES
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  team1_name text not null,
  team2_name text not null,
  status text not null default 'pending',
  started_at timestamptz,
  created_at timestamptz default now()
);

alter table public.matches enable row level security;

create policy "read matches"
on public.matches
for select
using (true);

create policy "insert matches"
on public.matches
for insert
with check (true);


-- PLAYERS IN MATCH
create table public.match_participants (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  team text not null check (team in ('team1', 'team2')),
  player_name text not null,
  jersey_number int not null,
  created_at timestamptz default now()
);

alter table public.match_participants enable row level security;

create policy "read participants"
on public.match_participants
for select
using (true);

create policy "insert participants"
on public.match_participants
for insert
with check (true);


-- GOAL EVENTS (source of truth)
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  team text not null check (team in ('team1', 'team2')),
  participant_id uuid references public.match_participants(id) on delete set null,
  player_name text not null,
  player_number int not null,
  minute int not null,
  created_at timestamptz default now()
);

alter table public.goals enable row level security;

create policy "read goals"
on public.goals
for select
using (true);

create policy "insert goals"
on public.goals
for insert
with check (true);

create policy "delete goals"
on public.goals
for delete
using (true);



# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Supabase Live Score MVP

This project now includes a React MVP for showing live U11-13 soccer game scores using the Supabase `matches` and `goals` schema.

### Setup

1. Create a `.env` file in the project root with the following values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_MATCH_ID=replace-with-match-id
```

2. Use the following Supabase schema:
   - `matches`: one row per match, with `team1_name`, `team2_name`, `status`, and `started_at`
   - `goals`: one row per scoring event, with `match_id`, `team`, `player_name`, `player_number`, and `minute`

3. Start the dev server:

```bash
npm install
npm run dev
```

### How it works

- `src/supabaseClient.js` initializes Supabase using Vite environment variables.
- `src/App.jsx` loads the selected match from `matches` and the related goal events from `goals`.
- It subscribes to realtime changes on both `matches` and `goals` so the UI updates live.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
