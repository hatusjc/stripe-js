-- LifeOS Supabase Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable Row Level Security
alter database postgres set "app.jwt_secret" to 'your-jwt-secret';

-- Users profile (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null,
  onboarding_complete boolean default false,
  life_score jsonb default '{"total":50}',
  partner_id uuid references public.profiles(id),
  shared_areas text[] default array['financas','familia','projetos','objetivos'],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Transactions
create table if not exists public.transactions (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  type text check (type in ('receita','despesa')) not null,
  category text not null,
  description text not null,
  amount numeric(12,2) not null,
  date date not null,
  recurring boolean default false,
  tags text[],
  photo text,            -- base64 or storage URL
  notes text,
  shared boolean default false,
  from_notification boolean default false,
  created_at timestamptz default now()
);

-- Projects
create table if not exists public.projects (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  status text default 'planning',
  priority text default 'medium',
  area text,
  due_date date,
  progress integer default 0,
  tasks jsonb default '[]',
  shared boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Goals
create table if not exists public.goals (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  area text not null,
  status text default 'active',
  due_date date,
  progress integer default 0,
  key_results jsonb default '[]',
  shared boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Couple notifications
create table if not exists public.couple_notifications (
  id text primary key,
  from_user_id uuid references public.profiles(id),
  to_user_id uuid references public.profiles(id),
  area text not null,
  action text check (action in ('add','edit','delete')) not null,
  entity_type text not null,
  entity_title text not null,
  details text,
  read boolean default false,
  created_at timestamptz default now()
);

-- Weekly check-ins
create table if not exists public.checkins (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  week_start date not null,
  week_label text not null,
  answers jsonb not null,
  life_score_snapshot integer,
  highlights text,
  challenges text,
  intention text,
  completed_at timestamptz default now()
);

-- Budgets
create table if not exists public.budgets (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  category text not null,
  monthly_limit numeric(12,2) not null,
  color text,
  icon text,
  created_at timestamptz default now()
);

-- Row Level Security Policies
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.projects enable row level security;
alter table public.goals enable row level security;
alter table public.couple_notifications enable row level security;
alter table public.checkins enable row level security;
alter table public.budgets enable row level security;

-- Profiles: own row only
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id);

-- Transactions: own + partner shared
create policy "transactions_own" on public.transactions
  for all using (auth.uid() = user_id);

-- Projects: own rows
create policy "projects_own" on public.projects
  for all using (auth.uid() = user_id);

-- Goals: own rows
create policy "goals_own" on public.goals
  for all using (auth.uid() = user_id);

-- Couple notifications: sender or receiver
create policy "couple_notifs_access" on public.couple_notifications
  for all using (auth.uid() = from_user_id or auth.uid() = to_user_id);

-- Check-ins: own rows
create policy "checkins_own" on public.checkins
  for all using (auth.uid() = user_id);

-- Budgets: own rows
create policy "budgets_own" on public.budgets
  for all using (auth.uid() = user_id);
