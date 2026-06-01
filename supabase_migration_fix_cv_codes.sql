-- ============================================================
-- HUNTBOARD — Migración: cv_code / cl_code únicos POR USUARIO
-- Pegar en Supabase > SQL Editor > New Query
--
-- Bug: la base se creó con un UNIQUE global sobre cv_code
-- (constraint cvs_cv_code_key) y cl_code (cover_letters_cl_code_key).
-- Como el código se genera por contador ("CV-000001" para el primer
-- CV de cada usuario), el primer CV de un usuario nuevo choca con el
-- de otro usuario:
--   duplicate key value violates unique constraint "cvs_cv_code_key"
--
-- Fix: el código debe ser único POR USUARIO, no global.
-- ============================================================

-- CVs
alter table cvs drop constraint if exists cvs_cv_code_key;
alter table cvs drop constraint if exists cvs_user_id_cv_code_key;
alter table cvs add constraint cvs_user_id_cv_code_key unique (user_id, cv_code);

-- Cover letters
alter table cover_letters drop constraint if exists cover_letters_cl_code_key;
alter table cover_letters drop constraint if exists cover_letters_user_id_cl_code_key;
alter table cover_letters add constraint cover_letters_user_id_cl_code_key unique (user_id, cl_code);
