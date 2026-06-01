-- ============================================================
-- HUNTBOARD — Migración TODO-EN-UNO
-- Pegar en Supabase > SQL Editor > New Query y EJECUTAR
--
-- Junta las migraciones pendientes. Es IDEMPOTENTE: se puede
-- correr varias veces sin error.
--
--   PARTE 0 — Backfill de user_id en filas huérfanas (IMPORTANTE)
--   PARTE 1 — Habilitar RLS (seguridad: cada usuario solo ve lo suyo)
--   PARTE 2 — Arreglar constraints de status/source en applications
--   PARTE 3 — cv_code / cl_code únicos POR USUARIO (no global)
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- PARTE 0 — BACKFILL de user_id  (CORRER ANTES DE ACTIVAR RLS)
-- ════════════════════════════════════════════════════════════
-- Las filas viejas tienen user_id = NULL. Si activás RLS sin
-- asignarles dueño, DESAPARECEN de tu vista (RLS hace
-- auth.uid() = user_id, y NULL no matchea). Acá se asignan al
-- usuario original.
--
-- 👇 REEMPLAZÁ por tu user_id si hace falta (Authentication > Users).
update applications     set user_id = '3e994b34-1bfb-4636-8d75-81de7c39d7ca' where user_id is null;
update cvs              set user_id = '3e994b34-1bfb-4636-8d75-81de7c39d7ca' where user_id is null;
update cover_letters    set user_id = '3e994b34-1bfb-4636-8d75-81de7c39d7ca' where user_id is null;
update activity_entries set user_id = '3e994b34-1bfb-4636-8d75-81de7c39d7ca' where user_id is null;


-- ════════════════════════════════════════════════════════════
-- PARTE 1 — HABILITAR RLS (Row Level Security)
-- ════════════════════════════════════════════════════════════
-- Sin RLS, cualquier usuario autenticado puede leer/escribir filas
-- de otros usuarios vía la API REST, sin importar los filtros del
-- frontend. Esto lo cierra a nivel base de datos.

alter table profiles         enable row level security;
alter table applications     enable row level security;
alter table activity_entries enable row level security;
alter table cvs              enable row level security;
alter table cover_letters    enable row level security;

-- Profiles
drop policy if exists "profiles_select_own" on profiles;
drop policy if exists "profiles_upsert_own" on profiles;
drop policy if exists "profiles_update_own" on profiles;
drop policy if exists "profiles_delete_own" on profiles;
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_upsert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete_own" on profiles for delete using (auth.uid() = id);

-- Applications
drop policy if exists "applications_select_own" on applications;
drop policy if exists "applications_insert_own" on applications;
drop policy if exists "applications_update_own" on applications;
drop policy if exists "applications_delete_own" on applications;
create policy "applications_select_own" on applications for select using (auth.uid() = user_id);
create policy "applications_insert_own" on applications for insert with check (auth.uid() = user_id);
create policy "applications_update_own" on applications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "applications_delete_own" on applications for delete using (auth.uid() = user_id);

-- Activity entries
drop policy if exists "activity_select_own" on activity_entries;
drop policy if exists "activity_insert_own" on activity_entries;
drop policy if exists "activity_update_own" on activity_entries;
drop policy if exists "activity_delete_own" on activity_entries;
create policy "activity_select_own" on activity_entries for select using (auth.uid() = user_id);
create policy "activity_insert_own" on activity_entries for insert with check (auth.uid() = user_id);
create policy "activity_update_own" on activity_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "activity_delete_own" on activity_entries for delete using (auth.uid() = user_id);

-- CVs
drop policy if exists "cvs_select_own" on cvs;
drop policy if exists "cvs_insert_own" on cvs;
drop policy if exists "cvs_update_own" on cvs;
drop policy if exists "cvs_delete_own" on cvs;
create policy "cvs_select_own" on cvs for select using (auth.uid() = user_id);
create policy "cvs_insert_own" on cvs for insert with check (auth.uid() = user_id);
create policy "cvs_update_own" on cvs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cvs_delete_own" on cvs for delete using (auth.uid() = user_id);

-- Cover letters
drop policy if exists "cl_select_own" on cover_letters;
drop policy if exists "cl_insert_own" on cover_letters;
drop policy if exists "cl_update_own" on cover_letters;
drop policy if exists "cl_delete_own" on cover_letters;
create policy "cl_select_own" on cover_letters for select using (auth.uid() = user_id);
create policy "cl_insert_own" on cover_letters for insert with check (auth.uid() = user_id);
create policy "cl_update_own" on cover_letters for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cl_delete_own" on cover_letters for delete using (auth.uid() = user_id);

-- Storage: cada usuario solo en su carpeta {user.id}/...
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


-- ════════════════════════════════════════════════════════════
-- PARTE 2 — CONSTRAINTS DE status / source EN applications
-- ════════════════════════════════════════════════════════════
-- status permitía solo 5 valores; la app usa 7 (faltaban
-- 'En Proceso' y 'Ghosteado'). source permitía solo 7; la app
-- ofrece ~30 plataformas + fuentes personalizadas.
-- Sin esto, importar/crear con esos valores falla con
-- "violates check constraint".

alter table applications drop constraint if exists applications_status_check;
alter table applications add constraint applications_status_check
  check (status in ('Aplicada','En Proceso','Screening','Entrevista','Oferta','Ghosteado','Rechazada'));

alter table applications drop constraint if exists applications_source_check;


-- ════════════════════════════════════════════════════════════
-- PARTE 3 — cv_code / cl_code ÚNICOS POR USUARIO
-- ════════════════════════════════════════════════════════════
-- Tenían UNIQUE global; como el código se genera por contador
-- (CV-000001 para el primer CV de cada usuario), el primer CV de
-- un usuario nuevo chocaba con el de otro. Debe ser único por usuario.

alter table cvs drop constraint if exists cvs_cv_code_key;
alter table cvs drop constraint if exists cvs_user_id_cv_code_key;
alter table cvs add constraint cvs_user_id_cv_code_key unique (user_id, cv_code);

alter table cover_letters drop constraint if exists cover_letters_cl_code_key;
alter table cover_letters drop constraint if exists cover_letters_user_id_cl_code_key;
alter table cover_letters add constraint cover_letters_user_id_cl_code_key unique (user_id, cl_code);


-- ════════════════════════════════════════════════════════════
-- VERIFICACIÓN (opcional) — RLS activo en todas las tablas
-- ════════════════════════════════════════════════════════════
-- Descomentá y ejecutá para confirmar (debe dar rowsecurity = true en todas):
-- select tablename, rowsecurity from pg_tables
--   where schemaname = 'public'
--     and tablename in ('profiles','applications','activity_entries','cvs','cover_letters');
