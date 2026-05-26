-- ============================================================
-- HUNTBOARD — Schema (setup limpio)
-- Pegar en Supabase > SQL Editor > New Query
--
-- Si ya tienes datos, NO uses este archivo:
-- usa supabase_migration_user_id.sql para migrar sin pérdida.
-- ============================================================

-- Profiles
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  role       text,
  created_at timestamptz default now() not null
);

-- CVs
create table if not exists cvs (
  id          bigint generated always as identity primary key,
  created_at  timestamptz default now() not null,
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  cv_code     text not null,
  name        text not null,
  size        text not null,
  url         text,
  is_primary  boolean not null default false,
  unique (user_id, cv_code)
);

-- Cover Letters
create table if not exists cover_letters (
  id          bigint generated always as identity primary key,
  created_at  timestamptz default now() not null,
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  cl_code     text not null,
  name        text not null,
  content     text not null default '',
  preview     text not null default '',
  is_primary  boolean not null default false,
  unique (user_id, cl_code)
);

-- Applications
create table if not exists applications (
  id               bigint generated always as identity primary key,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz,
  user_id          uuid not null default auth.uid() references auth.users(id) on delete cascade,
  role             text not null,
  company          text not null,
  status           text not null default 'Aplicada'
                     check (status in ('Aplicada','Screening','Entrevista','Oferta','Rechazada')),
  stars            smallint not null default 0 check (stars between 0 and 5),
  type             text not null default 'Remoto',
  salary           text,
  note             text,
  contact          text,
  tag              text,
  url              text,
  source           text check (source in ('LinkedIn','Indeed','GetOnBoard','Glassdoor','Referido','Empresa','Otro')),
  cv_id            bigint references cvs(id) on delete set null,
  cover_letter_id  bigint references cover_letters(id) on delete set null
);

-- Activity entries (timeline por postulación)
create table if not exists activity_entries (
  id               bigint generated always as identity primary key,
  created_at       timestamptz default now() not null,
  user_id          uuid not null default auth.uid() references auth.users(id) on delete cascade,
  application_id   bigint not null references applications(id) on delete cascade,
  label            text not null,
  note             text,
  date             date not null default current_date
);

-- Índices
create index if not exists applications_user_id_idx     on applications(user_id);
create index if not exists activity_entries_user_id_idx on activity_entries(user_id);
create index if not exists cvs_user_id_idx              on cvs(user_id);
create index if not exists cover_letters_user_id_idx    on cover_letters(user_id);

-- Storage bucket para archivos PDF
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict do nothing;

-- RLS (Row Level Security) — cada usuario solo ve sus datos
alter table profiles         enable row level security;
alter table applications     enable row level security;
alter table activity_entries enable row level security;
alter table cvs              enable row level security;
alter table cover_letters    enable row level security;

-- Profiles
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_upsert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete_own" on profiles for delete using (auth.uid() = id);

-- Applications
create policy "applications_select_own" on applications for select using (auth.uid() = user_id);
create policy "applications_insert_own" on applications for insert with check (auth.uid() = user_id);
create policy "applications_update_own" on applications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "applications_delete_own" on applications for delete using (auth.uid() = user_id);

-- Activity entries
create policy "activity_select_own" on activity_entries for select using (auth.uid() = user_id);
create policy "activity_insert_own" on activity_entries for insert with check (auth.uid() = user_id);
create policy "activity_update_own" on activity_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "activity_delete_own" on activity_entries for delete using (auth.uid() = user_id);

-- CVs
create policy "cvs_select_own" on cvs for select using (auth.uid() = user_id);
create policy "cvs_insert_own" on cvs for insert with check (auth.uid() = user_id);
create policy "cvs_update_own" on cvs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cvs_delete_own" on cvs for delete using (auth.uid() = user_id);

-- Cover letters
create policy "cl_select_own" on cover_letters for select using (auth.uid() = user_id);
create policy "cl_insert_own" on cover_letters for insert with check (auth.uid() = user_id);
create policy "cl_update_own" on cover_letters for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cl_delete_own" on cover_letters for delete using (auth.uid() = user_id);

-- Storage: cada usuario solo en su carpeta {user.id}/...
create policy "documents_select_own" on storage.objects
  for select using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "documents_insert_own" on storage.objects
  for insert with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "documents_update_own" on storage.objects
  for update using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "documents_delete_own" on storage.objects
  for delete using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
