-- در Supabase Dashboard > SQL Editor اجرا شود.
create extension if not exists pgcrypto;
create table if not exists public.lessons (
 id uuid primary key default gen_random_uuid(), title text not null,
 description text not null default '', filename text not null default 'lesson.txt',
 code text not null default '', image_url text not null default '', created_at timestamptz not null default now()
);
create table if not exists public.tasks (
 id uuid primary key default gen_random_uuid(), title text not null,
 description text not null default '', created_at timestamptz not null default now()
);
create table if not exists public.submissions (
 id uuid primary key default gen_random_uuid(), task_id uuid references public.tasks(id) on delete set null,
 task_title text not null default '', student_name text not null, code text not null,
 submitted_at timestamptz not null default now(), status text not null default 'pending'
 check(status in ('pending','approved','revision')), note text not null default ''
);
alter table public.lessons enable row level security;
alter table public.tasks enable row level security;
alter table public.submissions enable row level security;
-- سیاست‌های عمومی برای نمونه اولیه؛ برای داده واقعی دانش‌آموزان باید محدودسازی دسترسی اضافه شود.
drop policy if exists "public lessons access" on public.lessons;
create policy "public lessons access" on public.lessons for all to anon, authenticated using (true) with check (true);
drop policy if exists "public tasks access" on public.tasks;
create policy "public tasks access" on public.tasks for all to anon, authenticated using (true) with check (true);
drop policy if exists "public submissions access" on public.submissions;
create policy "public submissions access" on public.submissions for all to anon, authenticated using (true) with check (true);
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.lessons, public.tasks, public.submissions to anon, authenticated;
