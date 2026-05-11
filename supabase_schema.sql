-- ============================================================
-- TRACKBOOK — Schema
-- Pegar en Supabase > SQL Editor > New Query
-- ============================================================

-- Applications
create table if not exists applications (
  id               bigint generated always as identity primary key,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz,
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
  application_id   bigint not null references applications(id) on delete cascade,
  label            text not null,
  note             text,
  date             date not null default current_date
);

-- Si la tabla ya existía sin la columna date, ejecuta:
-- alter table activity_entries add column if not exists date date not null default current_date;

-- CVs
create table if not exists cvs (
  id          bigint generated always as identity primary key,
  created_at  timestamptz default now() not null,
  cv_code     text not null unique,
  name        text not null,
  size        text not null,
  url         text,
  is_primary  boolean not null default false
);

-- Cover Letters
create table if not exists cover_letters (
  id          bigint generated always as identity primary key,
  created_at  timestamptz default now() not null,
  cl_code     text not null unique,
  name        text not null,
  content     text not null default '',
  preview     text not null default '',
  is_primary  boolean not null default false
);

-- Storage bucket para archivos PDF
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict do nothing;

-- RLS (Row Level Security) — por ahora abierto, después agregamos auth
alter table applications    enable row level security;
alter table activity_entries enable row level security;
alter table cvs             enable row level security;
alter table cover_letters   enable row level security;

create policy "allow all" on applications     for all using (true) with check (true);
create policy "allow all" on activity_entries for all using (true) with check (true);
create policy "allow all" on cvs              for all using (true) with check (true);
create policy "allow all" on cover_letters    for all using (true) with check (true);
