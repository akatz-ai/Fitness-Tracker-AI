-- Fitness Tracker AI Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Workouts table
create table if not exists public.workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,
  name text not null,
  tag text not null default 'Lifting',
  date date not null default current_date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Exercises table
create table if not exists public.exercises (
  id uuid default uuid_generate_v4() primary key,
  workout_id uuid not null references public.workouts(id) on delete cascade,
  name text not null,
  sets integer default 3,
  reps integer default 8,
  weight integer,
  unit text not null default 'lbs' check (unit in ('lbs', 'kg', 'min', 'sec', 'miles', 'km', 'cal', 'bodyweight')),
  "order" integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for better query performance
create index if not exists workouts_user_id_idx on public.workouts(user_id);
create index if not exists workouts_date_idx on public.workouts(date desc);
create index if not exists exercises_workout_id_idx on public.exercises(workout_id);
create index if not exists exercises_order_idx on public.exercises("order");

-- Enable Row Level Security
alter table public.workouts enable row level security;
alter table public.exercises enable row level security;

-- RLS Policies for workouts
-- Users can only see their own workouts
create policy "Users can view own workouts" on public.workouts
  for select using (true);

create policy "Users can insert own workouts" on public.workouts
  for insert with check (true);

create policy "Users can update own workouts" on public.workouts
  for update using (true);

create policy "Users can delete own workouts" on public.workouts
  for delete using (true);

-- RLS Policies for exercises
-- Exercises inherit permissions from their parent workout
create policy "Users can view exercises" on public.exercises
  for select using (true);

create policy "Users can insert exercises" on public.exercises
  for insert with check (true);

create policy "Users can update exercises" on public.exercises
  for update using (true);

create policy "Users can delete exercises" on public.exercises
  for delete using (true);

-- Note: The above RLS policies are permissive for simplicity.
-- In production, you'd want to enforce user_id checking:
--
-- For workouts:
-- create policy "Users can view own workouts" on public.workouts
--   for select using (auth.uid()::text = user_id);
--
-- For exercises (checking parent workout ownership):
-- create policy "Users can view own exercises" on public.exercises
--   for select using (
--     exists (
--       select 1 from public.workouts
--       where workouts.id = exercises.workout_id
--       and workouts.user_id = auth.uid()::text
--     )
--   );
