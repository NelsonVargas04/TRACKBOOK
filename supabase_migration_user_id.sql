-- ============================================================
-- MIGRATION — Aislar datos por usuario (user_id + RLS por owner)
-- Ejecutar en Supabase > SQL Editor (una sola vez)
--
-- IMPORTANTE: antes de correr, reemplazar :owner_id por el UUID
-- del usuario al que se asignarán los datos existentes (backfill).
-- Para encontrarlo:
--   select id, email from auth.users where email = 'var.nelson15@gmail.com';
-- ============================================================

-- 0) PROFILES (la app ya la usa pero no estaba en el schema)
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  role       text,
  created_at timestamptz default now() not null
);
alter table profiles enable row level security;

drop policy if exists "profiles_select_own" on profiles;
drop policy if exists "profiles_upsert_own" on profiles;
drop policy if exists "profiles_update_own" on profiles;
drop policy if exists "profiles_delete_own"  on profiles;

create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);
create policy "profiles_upsert_own" on profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete_own" on profiles
  for delete using (auth.uid() = id);

-- ============================================================
-- 1) AGREGAR user_id A LAS 4 TABLAS (nullable de momento)
-- ============================================================
alter table applications     add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table activity_entries add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table cvs              add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table cover_letters    add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- ============================================================
-- 2) BACKFILL — asignar datos existentes al owner
--    >>> REEMPLAZAR el UUID de abajo antes de ejecutar <<<
-- ============================================================
do $$
declare
  owner_id uuid := 'PEGAR_AQUI_TU_UUID';
begin
  if owner_id is null or owner_id::text = 'PEGAR_AQUI_TU_UUID' then
    raise exception 'Reemplaza owner_id por el UUID real antes de correr la migración';
  end if;

  update applications     set user_id = owner_id where user_id is null;
  update activity_entries set user_id = owner_id where user_id is null;
  update cvs              set user_id = owner_id where user_id is null;
  update cover_letters    set user_id = owner_id where user_id is null;
end $$;

-- ============================================================
-- 3) NOT NULL + DEFAULT auth.uid()
-- ============================================================
alter table applications     alter column user_id set not null;
alter table activity_entries alter column user_id set not null;
alter table cvs              alter column user_id set not null;
alter table cover_letters    alter column user_id set not null;

alter table applications     alter column user_id set default auth.uid();
alter table activity_entries alter column user_id set default auth.uid();
alter table cvs              alter column user_id set default auth.uid();
alter table cover_letters    alter column user_id set default auth.uid();

-- ============================================================
-- 4) ÍNDICES para queries por user_id
-- ============================================================
create index if not exists applications_user_id_idx     on applications(user_id);
create index if not exists activity_entries_user_id_idx on activity_entries(user_id);
create index if not exists cvs_user_id_idx              on cvs(user_id);
create index if not exists cover_letters_user_id_idx    on cover_letters(user_id);

-- ============================================================
-- 5) UNIQUE constraints por usuario (no globales)
--    cv_code / cl_code deben ser únicos por usuario, no globalmente
-- ============================================================
alter table cvs           drop constraint if exists cvs_cv_code_key;
alter table cover_letters drop constraint if exists cover_letters_cl_code_key;

create unique index if not exists cvs_user_cv_code_uniq           on cvs(user_id, cv_code);
create unique index if not exists cover_letters_user_cl_code_uniq on cover_letters(user_id, cl_code);

-- ============================================================
-- 6) RLS — reemplazar policies "allow all" por owner-only
-- ============================================================
drop policy if exists "allow all" on applications;
drop policy if exists "allow all" on activity_entries;
drop policy if exists "allow all" on cvs;
drop policy if exists "allow all" on cover_letters;

-- Applications
create policy "applications_select_own" on applications
  for select using (auth.uid() = user_id);
create policy "applications_insert_own" on applications
  for insert with check (auth.uid() = user_id);
create policy "applications_update_own" on applications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "applications_delete_own" on applications
  for delete using (auth.uid() = user_id);

-- Activity entries
create policy "activity_select_own" on activity_entries
  for select using (auth.uid() = user_id);
create policy "activity_insert_own" on activity_entries
  for insert with check (auth.uid() = user_id);
create policy "activity_update_own" on activity_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "activity_delete_own" on activity_entries
  for delete using (auth.uid() = user_id);

-- CVs
create policy "cvs_select_own" on cvs
  for select using (auth.uid() = user_id);
create policy "cvs_insert_own" on cvs
  for insert with check (auth.uid() = user_id);
create policy "cvs_update_own" on cvs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cvs_delete_own" on cvs
  for delete using (auth.uid() = user_id);

-- Cover letters
create policy "cl_select_own" on cover_letters
  for select using (auth.uid() = user_id);
create policy "cl_insert_own" on cover_letters
  for insert with check (auth.uid() = user_id);
create policy "cl_update_own" on cover_letters
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cl_delete_own" on cover_letters
  for delete using (auth.uid() = user_id);

-- ============================================================
-- 7) STORAGE — bucket "documents": cada usuario solo en su carpeta
--    Las rutas siguen el patrón {user.id}/cvs/... (ya usado en código)
-- ============================================================
drop policy if exists "documents_select_own" on storage.objects;
drop policy if exists "documents_insert_own" on storage.objects;
drop policy if exists "documents_update_own" on storage.objects;
drop policy if exists "documents_delete_own" on storage.objects;

create policy "documents_select_own" on storage.objects
  for select using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "documents_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "documents_update_own" on storage.objects
  for update using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "documents_delete_own" on storage.objects
  for delete using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
