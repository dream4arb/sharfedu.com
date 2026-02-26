# 🚀 دليل الإعداد الكامل على Replit

## 📋 الخطوة 1: إنشاء المشروع على Replit

1. **سجل الدخول إلى Replit:**
   - اذهب إلى [replit.com](https://replit.com)
   - سجل الدخول بحسابك

2. **أنشئ Repl جديد:**
   - اضغط على زر "Create Repl" أو "+"
   - اختر "Node.js" من القائمة
   - اسم المشروع: `smart-learn-hub`
   - اختر "Public" أو "Private" حسب رغبتك
   - اضغط "Create Repl"

---

## 📦 الخطوة 2: رفع الملفات

### **الطريقة الأولى: رفع مجلد كامل**

1. **اضغط على أيقونة الملفات (Files)**
2. **اضغط على "Upload folder"**
3. **اختر المجلد الرئيسي للمشروع**

### **الطريقة الثانية: رفع ملفات يدوياً**

قم بإنشاء البنية التالية:

```
smart-learn-hub/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── .env
├── .gitignore
├── client/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       └── ...
├── server/
│   ├── index.ts
│   ├── routes.ts
│   └── ...
└── attached_assets/
    ├── html/
    ├── json/
    └── lessons/
```

---

## ⚙️ الخطوة 3: إعداد ملف package.json الرئيسي

أنشئ ملف `package.json` في الجذر:

```json
{
  "name": "smart-learn-hub",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "cross-env NODE_ENV=development tsx server/index.ts",
    "build": "tsx script/build.ts",
    "start": "cross-env NODE_ENV=production node dist/index.cjs",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "@radix-ui/react-accordion": "^1.2.4",
    "@radix-ui/react-alert-dialog": "^1.1.7",
    "@radix-ui/react-dialog": "^1.1.7",
    "@radix-ui/react-dropdown-menu": "^2.1.7",
    "@radix-ui/react-tabs": "^1.1.4",
    "@radix-ui/react-toast": "^1.2.7",
    "@tanstack/react-query": "^5.60.5",
    "bcrypt": "^5.1.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "dotenv": "^17.2.3",
    "drizzle-orm": "^0.39.3",
    "express": "^5.0.1",
    "express-session": "^1.19.0",
    "framer-motion": "^11.18.2",
    "lucide-react": "^0.453.0",
    "memorystore": "^1.6.7",
    "next-themes": "^0.4.6",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.55.0",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "wouter": "^3.3.5",
    "ws": "^8.18.0",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.15",
    "@tailwindcss/vite": "^4.1.18",
    "@types/express": "^5.0.0",
    "@types/node": "20.19.27",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.7.0",
    "autoprefixer": "^10.4.20",
    "cross-env": "^7.0.3",
    "drizzle-kit": "^0.31.8",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.20.5",
    "typescript": "5.6.3",
    "vite": "^7.3.0"
  }
}
```

---

## 🔐 الخطوة 4: إعداد ملف .env

أنشئ ملف `.env` في الجذر:

```env
NODE_ENV=development
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=your_random_secret_key_here_min_32_chars
```

**ملاحظات مهمة:**
- احصل على `GEMINI_API_KEY` من [Google AI Studio](https://makersuite.google.com/app/apikey)
- أنشئ `SESSION_SECRET` عشوائياً (32 حرف على الأقل)
- **لا ترفع ملف .env إلى GitHub!**

---

## 📝 الخطوة 5: إعداد ملفات التكوين

### **1. tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"],
      "@assets/*": ["./attached_assets/*"]
    }
  },
  "include": ["client/src", "server", "shared"],
  "exclude": ["node_modules", "dist"]
}
```

### **2. vite.config.ts:**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```

### **3. tailwind.config.ts:**

```typescript
import type { Config } from "tailwindcss";

export default {
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... باقي الألوان
      },
    },
  },
  plugins: [],
} satisfies Config;
```

---

## 🗄️ الخطوة 6: إعداد قاعدة البيانات

### **1. إنشاء ملف `server/db.ts`:**

```typescript
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@shared/schema";

const client = createClient({
  url: "file:sqlite.db",
});

export const db = drizzle(client, { schema });
```

### **2. إنشاء ملف `shared/schema.ts`:**

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const lessonProgress = sqliteTable("lesson_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  lessonId: text("lesson_id").notNull(),
  stage: text("stage").notNull(),
  subject: text("subject").notNull(),
  completedTabs: text("completed_tabs").notNull(),
  progress: integer("progress").notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});
```

### **3. تشغيل migration:**

```bash
npm run db:push
```

---

## 🖥️ الخطوة 7: إنشاء الخادم

### **ملف `server/index.ts`:**

```typescript
import "dotenv/config";
import express from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// تسجيل المسارات
registerRoutes(httpServer, app);

// خدمة الملفات الثابتة
serveStatic(app);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

---

## 🎨 الخطوة 8: إنشاء واجهة المستخدم

### **1. ملف `client/src/main.tsx`:**

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### **2. ملف `client/src/App.tsx`:**

```typescript
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Home from "./pages/Home";
import Lesson from "./pages/Lesson";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/lesson/:stage/:subject/:lessonId?" component={Lesson} />
      </Switch>
    </QueryClientProvider>
  );
}

export default App;
```

---

## 🚀 الخطوة 9: تشغيل المشروع

### **في Replit:**

1. **افتح Terminal:**
   - اضغط على أيقونة Terminal في الشريط الجانبي

2. **ثبت التبعيات:**
   ```bash
   npm install
   ```

3. **شغل المشروع:**
   ```bash
   npm run dev
   ```

4. **افتح المتصفح:**
   - Replit سيفتح نافذة متصفح تلقائياً
   - أو افتح الرابط الذي يظهر في Terminal

---

## ✅ الخطوة 10: التحقق من العمل

### **تحقق من:**

1. ✅ الصفحة الرئيسية تظهر
2. ✅ يمكن التنقل بين الصفحات
3. ✅ صفحة الدرس تعمل
4. ✅ التبويبات الأربعة تعمل:
   - تبويب الدرس (PDF)
   - تبويب الفيديو
   - تبويب التعليم
   - تبويب الأسئلة
5. ✅ الشريط الجانبي يعمل
6. ✅ تتبع التقدم يعمل

---

## 🐛 حل المشاكل الشائعة

### **المشكلة 1: خطأ في التبعيات**
```bash
# احذف node_modules و package-lock.json
rm -rf node_modules package-lock.json

# أعد التثبيت
npm install
```

### **المشكلة 2: خطأ في المنفذ**
- تأكد من أن المنفذ 5000 متاح
- أو غيّر PORT في ملف .env

### **المشكلة 3: خطأ في قاعدة البيانات**
```bash
# احذف قاعدة البيانات القديمة
rm sqlite.db

# أعد إنشاءها
npm run db:push
```

### **المشكلة 4: خطأ في المسارات**
- تأكد من أن المسارات في `vite.config.ts` صحيحة
- تأكد من أن alias في `tsconfig.json` صحيحة

---

## 📚 موارد إضافية

- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Wouter Documentation](https://github.com/molefrog/wouter)

---

## 🎉 تهانينا!

إذا وصلت إلى هنا، فأنت جاهز للبدء في البرمجة! 🚀

**نصيحة:** ابدأ بإنشاء الصفحة الرئيسية أولاً، ثم انتقل تدريجياً إلى الصفحات الأخرى.

**حظاً موفقاً! 💪**
