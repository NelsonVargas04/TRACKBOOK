# Trackbook

Una app personal para registrar, organizar y analizar postulaciones laborales. Tablero con vistas en board y lista, dashboard analítico (embudo de conversión, ghosting, actividad reciente), gestor de CVs y cover letters.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- React Router 7
- Supabase (auth + base de datos)
- Recharts (gráficos)
- Lucide (íconos)

## Setup

```bash
npm install
```

Crear un archivo `.env.local` en la raíz con las credenciales de Supabase:

```
VITE_SUPABASE_URL=tu-url
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## Scripts

```bash
npm run dev      # servidor de desarrollo
npm run build    # build de producción
npm run preview  # previsualizar build
npm run lint     # eslint
```

## Base de datos

El schema de Supabase está en `supabase_schema.sql`. Pegarlo en `Supabase > SQL Editor > New Query` para crear las tablas.

El template de email para magic link está en `supabase-email-template-magic-link.html`.
