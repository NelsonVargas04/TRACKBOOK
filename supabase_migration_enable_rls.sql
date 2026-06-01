-- ============================================================
-- HUNTBOARD — Migración CRÍTICA: habilitar RLS en todas las tablas
-- Pegar en Supabase > SQL Editor > New Query y EJECUTAR
--
-- Síntoma: al exportar/leer, aparecían datos de TODOS los usuarios.
-- Causa: Row Level Security (RLS) estaba apagado en la base. Sin RLS,
-- cualquier usuario autenticado puede leer/escribir filas de otros
-- usuarios vía la API REST, sin importar los filtros del frontend.
--
-- Esta migración es IDEMPOTENTE: se puede correr varias veces sin error.
-- Activa RLS y (re)crea las políticas "cada usuario solo ve lo suyo".
-- ============================================================

-- 1) Activar RLS en todas las tablas
alter table profiles         enable row level security;
alter table applications     enable row level security;
alter table activity_entries enable row level security;
alter table cvs              enable row level security;
alter table cover_letters    enable row level security;

-- 2) Profiles
drop policy if exists "profiles_select_own" on profiles;
drop policy if exists "profiles_upsert_own" on profiles;
drop policy if exists "profiles_update_own" on profiles;
drop policy if exists "profiles_delete_own" on profiles;
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_upsert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete_own" on profiles for delete using (auth.uid() = id);

-- 3) Applications
drop policy if exists "applications_select_own" on applications;
drop policy if exists "applications_insert_own" on applications;
drop policy if exists "applications_update_own" on applications;
drop policy if exists "applications_delete_own" on applications;
create policy "applications_select_own" on applications for select using (auth.uid() = user_id);
create policy "applications_insert_own" on applications for insert with check (auth.uid() = user_id);
create policy "applications_update_own" on applications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "applications_delete_own" on applications for delete using (auth.uid() = user_id);

-- 4) Activity entries
drop policy if exists "activity_select_own" on activity_entries;
drop policy if exists "activity_insert_own" on activity_entries;
drop policy if exists "activity_update_own" on activity_entries;
drop policy if exists "activity_delete_own" on activity_entries;
create policy "activity_select_own" on activity_entries for select using (auth.uid() = user_id);
create policy "activity_insert_own" on activity_entries for insert with check (auth.uid() = user_id);
create policy "activity_update_own" on activity_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "activity_delete_own" on activity_entries for delete using (auth.uid() = user_id);

-- 5) CVs
drop policy if exists "cvs_select_own" on cvs;
drop policy if exists "cvs_insert_own" on cvs;
drop policy if exists "cvs_update_own" on cvs;
drop policy if exists "cvs_delete_own" on cvs;
create policy "cvs_select_own" on cvs for select using (auth.uid() = user_id);
create policy "cvs_insert_own" on cvs for insert with check (auth.uid() = user_id);
create policy "cvs_update_own" on cvs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cvs_delete_own" on cvs for delete using (auth.uid() = user_id);

-- 6) Cover letters
drop policy if exists "cl_select_own" on cover_letters;
drop policy if exists "cl_insert_own" on cover_letters;
drop policy if exists "cl_update_own" on cover_letters;
drop policy if exists "cl_delete_own" on cover_letters;
create policy "cl_select_own" on cover_letters for select using (auth.uid() = user_id);
create policy "cl_insert_own" on cover_letters for insert with check (auth.uid() = user_id);
create policy "cl_update_own" on cover_letters for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cl_delete_own" on cover_letters for delete using (auth.uid() = user_id);

-- 7) Storage: cada usuario solo en su carpeta {user.id}/...
drop policy if exists "documents_select_own" on storage.objects;
drop policy if exists "documents_insert_own" on storage.objects;
drop policy if exists "documents_update_own" on storage.objects;
drop policy if exists "documents_delete_own" on storage.objects;
create policy "documents_select_own" on storage.objects
  for select using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "documents_insert_own" on storage.objects
  for insert with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "documents_update_own" on storage.objects
  for update using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "documents_delete_own" on storage.objects
  for delete using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

-- 8) Verificación: ver el estado de RLS por tabla (debe decir rowsecurity = true)
-- select tablename, rowsecurity from pg_tables
--   where schemaname = 'public'
--     and tablename in ('profiles','applications','activity_entries','cvs','cover_letters');
