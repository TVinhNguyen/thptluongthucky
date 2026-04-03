# AGENTS.md - THPT Lương Thúc Kỳ School Management System

## Project Overview

Monorepo with **Django 5.2** backend (REST API) + **React 18/Vite** frontend. PostgreSQL database, Docker-based development. School management system for THPT Lương Thúc Kỳ.

## Build / Lint / Test Commands

### Backend (Django)

```bash
# Run all commands via Docker
docker compose exec -T backend python manage.py <command>

# Common management commands
docker compose exec -T backend python manage.py makemigrations
docker compose exec -T backend python manage.py migrate
docker compose exec -T backend python manage.py createsuperuser
docker compose exec -T backend python manage.py check
docker compose exec -T backend python manage.py test           # Run tests
docker compose exec -T backend python manage.py test core       # Run single app tests
docker compose exec -T backend python manage.py shell           # Interactive shell

# Start development server
docker compose up -d
```

### Frontend (React + Vite)

```bash
cd frontend

npm run dev              # Development server (port 8080)
npm run build            # Production build
npm run build:dev        # Development build
npm run lint             # ESLint check
npm run preview          # Preview production build
```

### Docker

```bash
docker compose build              # Build all images
docker compose up -d              # Start all services
docker compose down               # Stop all services
docker compose down -v            # Stop + remove volumes (full reset)
docker compose logs -f backend    # Follow backend logs
docker compose logs -f frontend   # Follow frontend logs
docker compose restart            # Restart all services
```

### Database

```bash
docker compose exec -T db createdb -U postgres school_db    # Create database
docker compose exec backend python manage.py changepassword admin  # Change admin password
```

## Code Style Guidelines

### Frontend (TypeScript + React)

**Imports:**
- Use path alias `@/*` for src imports (e.g., `@/components/ui/button`, `@/hooks/useApi`)
- Group imports: React/hooks first, then components, then utilities, then external libs
- Use named imports for React hooks: `import { useState, useMemo } from "react"`

**Formatting:**
- 2-space indentation
- Double quotes for strings
- Semicolons required
- Max line length: follow ESLint config
- Run `npm run lint` before committing

**TypeScript:**
- Strict mode is **disabled** (`strict: false`, `strictNullChecks: false`)
- Use TypeScript interfaces for props and API response types
- Type function parameters and return values
- Use `type` for unions/intersections, `interface` for object shapes

**Naming Conventions:**
- Components: PascalCase (`Navigation`, `NewsCard`)
- Hooks: camelCase with `use` prefix (`useApi`, `useTimetable`)
- Variables/functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: PascalCase for components, camelCase for utilities

**Component Patterns:**
- Functional components with hooks (no class components)
- Use `export default` for main components
- Lazy load route components: `const Page = lazy(() => import("./pages/Page"))`
- Use shadcn/ui components from `@/components/ui/*`
- Use `cn()` from `@/lib/utils` for conditional class merging

**State Management:**
- React Query (`@tanstack/react-query`) for server state
- `useState` for local component state
- Custom hooks for reusable logic (`useApi`, `useTimetable`)

**Styling:**
- Tailwind CSS exclusively
- Use CSS variables for colors: `bg-primary`, `text-muted-foreground`
- Primary color: `#1d3e8b` (school blue)
- Responsive design with Tailwind breakpoints

**Error Handling:**
- Use try/catch for async operations
- Display errors via toast notifications (`sonner`)
- API errors: return appropriate HTTP status codes

### Backend (Django + Python)

**Imports:**
- Standard library first, then third-party, then local apps
- Use relative imports within apps: `from .models import Post`

**Models:**
- Vietnamese `verbose_name` for all fields
- Auto-generate slugs using `slugify_vietnamese()` in `save()` method
- Use `Meta.ordering` for default ordering
- Add `indexes` for frequently queried fields

**Views:**
- Use ViewSets for REST API endpoints
- Add caching with `@method_decorator(cache_page(settings.CACHE_TTL_SECONDS))`
- Use `@action` decorator for custom endpoints
- Pagination via `PageNumberPagination` (default page_size: 10)

**Naming Conventions:**
- Models: PascalCase (`Category`, `TimetableEntry`)
- Functions/variables: snake_case
- Constants: UPPER_SNAKE_CASE
- URL slugs: kebab-case (Vietnamese slugified)

**Error Handling:**
- Use DRF serializers with `is_valid(raise_exception=True)`
- Return proper HTTP status codes
- Log errors with `logging.getLogger(__name__)`

## Architecture

```
thptluongthucky/
├── backend/
│   ├── config/          # Django settings, URLs, WSGI
│   └── core/            # Main app: models, views, serializers, utils
├── frontend/
│   └── src/
│       ├── components/  # Reusable UI (shadcn/ui + custom)
│       ├── pages/       # Route components
│       ├── hooks/       # Custom React hooks
│       └── lib/         # Utilities (api.ts, utils.ts)
├── docker-compose.yml   # Development
└── docker-compose.prod.yml  # Production
```

## Key Patterns

- **API**: DRF ViewSets with filtering, search, and ordering
- **Caching**: Redis (with LocMemCache fallback), configurable via `CACHE_TTL_SECONDS`
- **Media**: Cloudinary for file/image storage
- **Admin**: Django Unfold for modern admin interface
- **SEO**: Dynamic sitemap, prerender endpoints for bot crawlers
- **Rich Text**: CKEditor 5 for content fields

## Environment Variables

See `.env.example` for required variables. Key vars:
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `CACHE_TTL_SECONDS`, `REDIS_URL`
