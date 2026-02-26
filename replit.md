# Sharaf Educational Platform (شارف التعليمية)

## Overview

Sharaf (شارف) is a comprehensive Arabic educational platform designed for all Saudi students from elementary through high school and beyond. The platform covers all educational stages including Elementary (الابتدائية), Middle School (المتوسطة), High School (الثانوية), Academic Paths (المسارات), and Aptitude Tests (القدرات والتحصيلي). It provides interactive courses, video lessons, quizzes, and progress tracking with a modern design featuring stage-specific color themes.

## User Preferences

- Preferred communication style: Simple, everyday language
- Design inspiration: Shahbandr.com / Dave.com aesthetic
- Color palette: Stage-specific colors (sky blue for elementary, emerald for middle, violet for high, amber for paths, rose for qudurat)
- Typography: Tajawal font for Arabic text
- Layout: RTL (Right-to-Left) with full Arabic support

## System Architecture

### Build & Development
This project has full source code and can be built from source. Edit source files, then rebuild.

- **Build command**: `npx tsx script/build.ts` (builds both frontend and server)
- **Frontend only**: `npx vite build` (outputs to `server/public/`)
- **Dev mode**: `npm run dev` (runs tsx with hot reload)

### Startup (Production)
- **Entry point**: `bash start.sh` which sets DATABASE_URL and runs `node dist/index.cjs`
- **Port**: 5000
- **Static files**: Served from `server/public/`

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS v3 with shadcn/ui components
- **Animations**: Framer Motion
- **Path aliases**: `@/` → `src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`

### Backend
- **Framework**: Express.js
- **Database**: SQLite via LibSQL (`file:sqlite.db`)
- **Authentication**: Google OAuth + local auth (bcrypt) via Passport.js
- **Session Storage**: In-memory via memorystore
- **AI**: Google Gemini API for chat/tutoring
- **Email**: Nodemailer with SMTP

### Project Structure
```
├── start.sh              # Startup script (sets env, runs server)
├── index.html            # Vite entry point
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── postcss.config.js     # PostCSS configuration
├── package.json          # Dependencies and scripts
├── src/                  # Frontend source code
│   ├── App.tsx           # Main app with routing
│   ├── main.tsx          # Entry point
│   ├── index.css         # Global styles and CSS variables
│   ├── components/       # UI components
│   │   ├── home/         # Landing page sections
│   │   ├── layout/       # Navbar, Footer
│   │   ├── ui/           # shadcn/ui components
│   │   └── ...           # Feature components
│   ├── pages/            # Page components
│   │   ├── Home.tsx      # Landing page
│   │   ├── Dashboard.tsx # Student dashboard
│   │   ├── Stage.tsx     # Stage view
│   │   ├── Subject.tsx   # Subject view
│   │   ├── Lesson.tsx    # Lesson view
│   │   ├── Profile.tsx   # User profile
│   │   ├── AdminDashboard.tsx # Admin panel
│   │   ├── auth/         # Auth pages (Login, Register, etc.)
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities (queryClient, api-base, utils)
│   ├── data/             # Static data files
│   └── assets/           # Images
├── server/               # Backend source code
│   ├── index.ts          # Express server entry
│   ├── routes.ts         # Main API routes
│   ├── db.ts             # Database connection (LibSQL/SQLite)
│   ├── storage.ts        # Data access layer
│   ├── static.ts         # Static file serving
│   ├── vite.ts           # Vite dev server integration
│   ├── auth/             # Authentication (authRoutes, sessionStore)
│   ├── admin/            # Admin CMS routes
│   ├── routes/           # Additional API route modules
│   ├── middleware/        # Auth middleware
│   ├── lib/              # Server utilities (sendMail)
│   └── data/             # Server data files
├── shared/               # Shared between client & server
│   ├── schema.ts         # Drizzle ORM database schema
│   ├── routes.ts         # API contracts with Zod
│   └── models/           # Shared model definitions
├── script/               # Build scripts
│   └── build.ts          # Build script (esbuild + vite)
├── dist/                 # Build output
│   ├── index.cjs         # Compiled server
│   └── public/           # Compiled frontend
└── sqlite.db             # SQLite database
```

### Environment Variables (Secrets - need to be set)
- `SESSION_SECRET` - Session encryption key (SET)
- `GEMINI_API_KEY` - Google Gemini AI API key (NOT SET)
- `YOUTUBE_API_KEY` - YouTube Data API v3 key (NOT SET)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (NOT SET)
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret (NOT SET)
- `GOOGLE_CALLBACK_URL` - Google OAuth callback URL (NOT SET)
- `SMTP_PASS` - SMTP email password (NOT SET)

### Environment Variables (Config - set via env vars)
- `NODE_ENV` - production
- `PORT` - 5000
- `BASE_URL` - https://sharfedu.com
- `ADMIN_EMAIL` - Admin email address
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `MAIL_FROM` - Email config

## Key Pages

1. **Home (/)**: Landing page with Hero, SearchBar, StageSelector, Features, Stats, CTA
2. **Stage (/stage/:stageId)**: Stage-specific page with grades and subjects
3. **Subject (/subject/:stageSlug/:gradeSlug/:subjectSlug)**: Subject lessons list
4. **Dashboard (/dashboard)**: Student dashboard with progress tracking (protected)
5. **Lesson (/lesson/:subjectId/:lessonId)**: Video lessons with attachments
6. **Profile (/profile)**: User profile (protected)
7. **Admin (/admin)**: Admin CMS dashboard (protected, admin only)
8. **Auth**: /login, /register, /forgot-password, /reset-password

## Design System

### Color Palette by Stage
- Elementary: Sky blue (`from-sky-400 to-blue-500`)
- Middle School: Emerald (`from-emerald-400 to-teal-500`)
- High School: Violet (`from-violet-400 to-purple-500`)
- Paths: Amber (`from-amber-400 to-orange-500`)
- Qudurat: Rose (`from-rose-400 to-pink-500`)

### Typography
- Font: Tajawal (Google Fonts)
- RTL layout with Arabic as primary language

### API Base
- On Replit: API calls go directly to `/api/...`
- On Cloudways: Uses `VITE_API_BASE=/api-proxy.php` for PHP proxy
- Controlled by `src/lib/api-base.ts`
