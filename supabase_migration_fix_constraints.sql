-- ============================================================
-- HUNTBOARD — Migración: arreglar constraints de applications
-- Pegar en Supabase > SQL Editor > New Query
--
-- Soluciona el desfase entre el esquema y la app:
--   • status permitía solo 5 valores, la app usa 7
--     (faltaban 'En Proceso' y 'Ghosteado')
--   • source permitía solo 7 valores, la app ofrece ~30
--     plataformas + fuentes personalizadas del usuario
--
-- Sin esto, crear/mover una postulación a 'Ghosteado',
-- 'En Proceso' o con un origen como 'HackerRank' falla con
-- error de violación de CHECK constraint.
-- ============================================================

-- 1) Ampliar el CHECK de status a los 7 estados reales
alter table applications drop constraint if exists applications_status_check;
alter table applications add constraint applications_status_check
  check (status in ('Aplicada','En Proceso','Screening','Entrevista','Oferta','Ghosteado','Rechazada'));

-- 2) Quitar el CHECK de source (pasa a ser texto libre)
alter table applications drop constraint if exists applications_source_check;
