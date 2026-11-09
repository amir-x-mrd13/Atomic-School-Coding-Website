-- این دستورات را در Supabase > SQL Editor اجرا کن.
-- فقط ستون‌های لازم را اضافه می‌کند و هیچ داده‌ای را پاک یا بازنویسی نمی‌کند.
alter table public.tasks
  add column if not exists aparat_url text;

alter table public.submissions
  add column if not exists aparat_url text;

alter table public.submissions
  add column if not exists grade numeric(5,2);

-- پس از اجرا، در صورت باقی ماندن خطای schema cache چند لحظه صبر کن و صفحه را تازه‌سازی کن.
