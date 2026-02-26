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

### Runtime Mode
This project runs as a **pre-compiled production build**. The compiled server (`dist/index.cjs`) serves both the API and the frontend static assets.

### Startup
- **Entry point**: `bash start.sh` which sets DATABASE_URL and runs `node dist/index.cjs`
- **Port**: 5000
- **Static files**: Served from `server/public/` (symlinked to `dist/public/`)

### Frontend
- **Framework**: React 18 with TypeScript (pre-compiled)
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animations**: Framer Motion

### Backend
- **Framework**: Express.js (compiled into `dist/index.cjs`)
- **Database**: SQLite via LibSQL (`file:sqlite.db`)
- **Authentication**: Google OAuth + local auth via Passport.js
- **Session Storage**: In-memory via memorystore

### Project Structure
```
├── start.sh              # Startup script (sets env, runs server)
├── dist/
│   ├── index.cjs         # Compiled server (Express + API)
│   └── public/           # Compiled frontend assets
├── server/
│   └── public -> dist/public  # Symlink for static serving
├── sqlite.db             # SQLite database
├── attached_assets/      # Uploaded files (PDFs, images)
├── package.json          # Dependencies
└── index.html            # Dev entry (not used in production)
```

### Environment Variables (Secrets)
- `SESSION_SECRET` - Session encryption key
- `GEMINI_API_KEY` - Google Gemini AI API key
- `YOUTUBE_API_KEY` - YouTube Data API v3 key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_CALLBACK_URL` - Google OAuth callback URL
- `SMTP_PASS` - SMTP email password

### Environment Variables (Config)
- `NODE_ENV` - production
- `PORT` - 5000
- `BASE_URL` - https://sharfedu.com
- `ADMIN_EMAIL` - Admin email address
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `MAIL_FROM` - Email config

## Key Pages

1. **Home (/)**: Landing page with Hero, SearchBar, StageSelector, Features, Stats, CTA
2. **Stage (/stage/:stageId)**: Stage-specific page with grades and subjects
3. **Dashboard (/dashboard)**: Student dashboard with progress tracking
4. **Lesson (/lesson/:subjectId/:lessonId)**: Video lessons with attachments

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
