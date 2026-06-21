-- markdowntopdf.sh — optional persistence schema
--
-- Run this in the Supabase SQL editor (or via `supabase db push`) to enable
-- signed-in users to save and reload their Markdown documents. The core
-- editor works without any of this; it only adds cloud sync + accounts.

create extension if not exists "uuid-ossp";

create table if not exists public.documents (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null default 'Untitled',
  content     text not null default '',
  page_size   text not null default 'A4',
  margin      text not null default '20mm',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists documents_user_id_idx
  on public.documents (user_id, updated_at desc);

-- Keep updated_at fresh on every write.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

-- Row Level Security: a user can only see and modify their own documents.
alter table public.documents enable row level security;

drop policy if exists "Users can read own documents" on public.documents;
create policy "Users can read own documents"
  on public.documents for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own documents" on public.documents;
create policy "Users can insert own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own documents" on public.documents;
create policy "Users can update own documents"
  on public.documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own documents" on public.documents;
create policy "Users can delete own documents"
  on public.documents for delete
  using (auth.uid() = user_id);
