# Sharaf Educational Platform (شارف التعليمية)

## Overview

Sharaf (شارف) is a comprehensive Arabic educational platform designed for all Saudi students from elementary through high school and beyond. The platform covers all educational stages including Elementary (الابتدائية), Middle School (المتوسطة), High School (الثانوية), Academic Paths (المسارات), and Aptitude Tests (القدرات والتحصيلي). It provides interactive courses, video lessons, quizzes, and progress tracking with a modern Shahbandr.com-inspired design featuring stage-specific color themes.

## User Preferences

- Preferred communication style: Simple, everyday language
- Design inspiration: Shahbandr.com / Dave.com aesthetic
- Color palette: Stage-specific colors (sky blue for elementary, emerald for middle, violet for high, amber for paths, rose for qudurat)
- Typography: Tajawal font for Arabic text
- Layout: RTL (Right-to-Left) with full Arabic support

## Educational Stages

1. **Elementary (الابتدائية)** - Grades 1-6, Sky blue theme
2. **Middle School (المتوسطة)** - Grades 1-3, Emerald theme  
3. **High School (الثانوية)** - Grades 1-3, Violet theme
4. **Academic Paths (المسارات)** - Specialized tracks, Amber theme
5. **Aptitude Tests (القدرات والتحصيلي)** - Qudurat & Tahsili, Rose theme

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for smooth transitions and interactions
- **RTL Support**: Full right-to-left layout with Arabic (Tajawal font) as primary language

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints with Zod validation schemas defined in `shared/routes.ts`
- **Build System**: Vite for development with HMR, esbuild for production bundling
- **Development Mode**: Vite middleware serves the React app with hot reload
- **Production Mode**: Static file serving from built assets

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Drizzle Kit manages schema migrations in `./migrations`
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple

### Authentication
- **Provider**: Replit Auth (OpenID Connect)
- **Session Management**: Express sessions stored in PostgreSQL
- **User Storage**: Users table with profile information synced from Replit

### Project Structure
```
├── client/           # React frontend application
│   └── src/
│       ├── components/   # UI components (shadcn/ui + custom)
│       │   ├── home/     # Landing page sections (Hero, SearchBar, StageSelector, Features, Stats, CTA)
│       │   ├── layout/   # Navbar, Footer
│       │   └── ui/       # shadcn/ui components
│       ├── data/         # Shared lesson and subject data
│       │   └── lessons.ts  # Unified lesson data source for all subjects
│       ├── hooks/        # Custom React hooks (use-auth, use-lesson-progress, use-toast)
│       ├── pages/        # Page components (Home, Dashboard, Lesson, Stage, Courses)
│       └── lib/          # Utilities and query client
├── server/           # Express backend
│   ├── replit_integrations/  # Replit Auth integration
│   └── routes.ts     # API route definitions
├── shared/           # Shared code between client and server
│   ├── schema.ts     # Drizzle database schema
│   └── routes.ts     # API route contracts with Zod
└── migrations/       # Database migrations
```

### Lesson Progress System
- **Shared Data Source**: `client/src/data/lessons.ts` contains all lesson data for every subject
- **Progress Context**: `useLessonProgress` hook provides shared state across Dashboard and Lesson pages
- **Persistence**: Progress saved to localStorage with key `sama_lesson_progress`
- **Dynamic Tracking**: Dashboard progress bars calculated from actual lesson counts, not hard-coded values

## Key Pages

1. **Home (/)**: Landing page with Hero, SearchBar, StageSelector, Features, Stats, and CTA sections
2. **Stage (/stage/:stageId)**: Stage-specific page showing grades and subjects
3. **Courses (/courses/:gradeLevel)**: Legacy grade-specific course listing
4. **Dashboard (/dashboard)**: Student dashboard with:
   - Sidebar navigation (الرئيسية، دروسي، جدول المذاكرة، الإنجازات، الإعدادات)
   - Stage selection modal for first-time users
   - Subject cards with progress bars
   - Lessons archive with videos and PDFs
   - Achievements badges
   - Fast client-side routing between sections
5. **Lesson (/lesson/:subjectId/:lessonId)**: Individual lesson view with:
   - Video player for lesson content
   - Lesson sidebar with navigation to other lessons in the subject
   - Attachments section (PDFs, worksheets)
   - Mark complete button with progress tracking
   - Previous/Next lesson navigation

## Design System

### Color Palette by Stage
- Elementary: Sky blue (`from-sky-400 to-blue-500`)
- Middle School: Emerald (`from-emerald-400 to-teal-500`)
- High School: Violet (`from-violet-400 to-purple-500`)
- Paths: Amber (`from-amber-400 to-orange-500`)
- Qudurat: Rose (`from-rose-400 to-pink-500`)

### Typography
- Font: Tajawal (Google Fonts)
- Headings: font-black (900)
- Body: Regular weight

### Spacing & Corners
- Large rounded corners (rounded-2xl, rounded-3xl)
- Generous padding and whitespace
- Consistent spacing scale

## Database Schema

### Educational Stages Table
- `id`, `slug`, `name_ar`, `name_en`, `description`, `icon_name`, `color_scheme`, `order`

### Grade Levels Table
- `id`, `stage_id`, `slug`, `name_ar`, `name_en`, `order`

### Subjects Table
- `id`, `slug`, `name_ar`, `name_en`, `icon_name`, `color_scheme`

### Courses Table
- `id`, `title`, `description`, `stage_slug`, `grade_level`, `subject_slug`, `image_url`, `lessons_count`, `duration`

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication
- **Replit Auth**: OAuth/OIDC provider for user authentication
- **Required Environment Variables**: `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET`, `DATABASE_URL`

### Third-Party Services
- **Google Fonts**: Tajawal font family for Arabic typography

### Key NPM Packages
- `@tanstack/react-query`: Server state management
- `drizzle-orm` + `drizzle-kit`: Database ORM and migrations
- `framer-motion`: Animation library
- `wouter`: Lightweight React router
- `zod`: Schema validation for API contracts
- `passport` + `openid-client`: Authentication middleware
- Full shadcn/ui component library with Radix UI primitives
