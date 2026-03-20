-- SIMU.AI MVP - Schema inicial
-- Execute no projeto Supabase para ativar persistencia real.

create extension if not exists "pgcrypto";

create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  target_exam text,
  grade_level text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists quizzes (
  id text primary key,
  title text not null,
  exam_board text not null,
  year int not null,
  description text not null,
  duration_minutes int not null check (duration_minutes > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists error_tags (
  id text primary key,
  label text not null,
  description text not null
);

create table if not exists questions (
  id text primary key,
  quiz_id text not null references quizzes(id) on delete cascade,
  position int not null,
  statement text not null,
  subject text not null,
  topic text not null,
  type text not null check (type in ('objective', 'essay')),
  options jsonb,
  correct_option_id text,
  explanation text not null,
  default_error_tag_id text not null references error_tags(id),
  created_at timestamptz not null default timezone('utc', now()),
  unique (quiz_id, position)
);

create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id text not null references quizzes(id) on delete cascade,
  status text not null check (status in ('in_progress', 'completed')),
  started_at timestamptz not null default timezone('utc', now()),
  finished_at timestamptz,
  total_time_seconds int not null default 0
);

create table if not exists attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references attempts(id) on delete cascade,
  question_id text not null references questions(id) on delete cascade,
  selected_option_id text,
  essay_text text,
  marked_for_review boolean not null default false,
  time_spent_seconds int not null default 0,
  is_correct boolean,
  error_tag_id text references error_tags(id),
  manual_review_required boolean not null default false,
  unique (attempt_id, question_id)
);

create table if not exists drafts (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references attempts(id) on delete cascade,
  question_id text not null references questions(id) on delete cascade,
  image_data_url text not null,
  updated_at timestamptz not null default timezone('utc', now()),
  unique (attempt_id, question_id)
);

create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references attempts(id) on delete cascade,
  title text not null,
  description text not null,
  priority text not null check (priority in ('alta', 'media', 'baixa')),
  subject text,
  topic text,
  related_error_tag_id text references error_tags(id),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists performance_summaries (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null unique references attempts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id text not null references quizzes(id) on delete cascade,
  score int not null,
  objective_questions int not null,
  correct_answers int not null,
  wrong_answers int not null,
  unanswered int not null,
  manual_review_count int not null,
  accuracy numeric(5,4) not null,
  total_time_seconds int not null,
  average_time_per_question numeric(10,2) not null,
  most_time_consuming_question_ids jsonb not null,
  critical_question_ids jsonb not null,
  subject_breakdown jsonb not null,
  topic_weaknesses jsonb not null,
  error_patterns jsonb not null,
  feedback_by_question jsonb not null,
  insights jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_questions_quiz on questions(quiz_id);
create index if not exists idx_attempts_user on attempts(user_id);
create index if not exists idx_attempt_answers_attempt on attempt_answers(attempt_id);
create index if not exists idx_drafts_attempt on drafts(attempt_id);
create index if not exists idx_performance_user on performance_summaries(user_id);

alter table user_profiles enable row level security;
alter table attempts enable row level security;
alter table attempt_answers enable row level security;
alter table drafts enable row level security;
alter table recommendations enable row level security;
alter table performance_summaries enable row level security;

drop policy if exists "Profiles are self readable" on user_profiles;
create policy "Profiles are self readable" on user_profiles
for select using (auth.uid() = id);

drop policy if exists "Profiles are self writable" on user_profiles;
create policy "Profiles are self writable" on user_profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Attempts are owner only" on attempts;
create policy "Attempts are owner only" on attempts
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Answers follow attempt ownership" on attempt_answers;
create policy "Answers follow attempt ownership" on attempt_answers
for all using (
  exists (
    select 1 from attempts
    where attempts.id = attempt_answers.attempt_id
      and attempts.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from attempts
    where attempts.id = attempt_answers.attempt_id
      and attempts.user_id = auth.uid()
  )
);

drop policy if exists "Drafts follow attempt ownership" on drafts;
create policy "Drafts follow attempt ownership" on drafts
for all using (
  exists (
    select 1 from attempts
    where attempts.id = drafts.attempt_id
      and attempts.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from attempts
    where attempts.id = drafts.attempt_id
      and attempts.user_id = auth.uid()
  )
);

drop policy if exists "Recommendations follow attempt ownership" on recommendations;
create policy "Recommendations follow attempt ownership" on recommendations
for all using (
  exists (
    select 1 from attempts
    where attempts.id = recommendations.attempt_id
      and attempts.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from attempts
    where attempts.id = recommendations.attempt_id
      and attempts.user_id = auth.uid()
  )
);

drop policy if exists "Summaries are owner only" on performance_summaries;
create policy "Summaries are owner only" on performance_summaries
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('drafts', 'drafts', true)
on conflict (id) do nothing;

drop policy if exists "Draft bucket read" on storage.objects;
create policy "Draft bucket read" on storage.objects
for select using (bucket_id = 'drafts');

drop policy if exists "Draft bucket write own folder" on storage.objects;
create policy "Draft bucket write own folder" on storage.objects
for all using (
  bucket_id = 'drafts' and (storage.foldername(name))[1] = auth.uid()::text
) with check (
  bucket_id = 'drafts' and (storage.foldername(name))[1] = auth.uid()::text
);
