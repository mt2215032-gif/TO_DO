-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query)
-- for the project you're pointing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY at.

create table if not exists tasks (
  id bigint generated always as identity primary key,
  text text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable RLS with no policies: this blocks the table from the public
-- anon/public API key entirely. The backend uses the service_role key,
-- which always bypasses RLS, so the app keeps working normally.
alter table tasks enable row level security;

-- Optional: seed the same three starter tasks the previous in-memory
-- version shipped with.
insert into tasks (text, completed)
values
  ('Welcome to your To-Do app', false),
  ('Click the checkbox to complete a task', false),
  ('Try editing or deleting this task', true);
