import { useEffect, lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LessonProgressProvider } from "@/hooks/use-lesson-progress";
import Home from "@/pages/Home";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SeoHead } from "@/components/SeoHead";
import { useAuth } from "@/hooks/use-auth";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Profile = lazy(() => import("@/pages/Profile"));
const Courses = lazy(() => import("@/pages/Courses"));
const Stage = lazy(() => import("@/pages/Stage"));
const Lesson = lazy(() => import("@/pages/Lesson"));
const PdfViewer = lazy(() => import("@/pages/PdfViewer"));
const PdfExtractor = lazy(() => import("@/pages/PdfExtractor"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const NotFound = lazy(() => import("@/pages/not-found"));

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function ProtectedDashboard() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (!isLoading && !user) setLocation("/login");
  }, [isLoading, user, setLocation]);
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return null;
  return <Dashboard />;
}

function ProtectedProfile() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (!isLoading && !user) setLocation("/login");
  }, [isLoading, user, setLocation]);
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return null;
  return <Profile />;
}

function ProtectedAdmin() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setLocation("/login");
      return;
    }
    if (user.role !== "admin") {
      setLocation("/dashboard");
    }
  }, [isLoading, user, setLocation]);
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!user || user.role !== "admin") return null;
  return <AdminDashboard />;
}

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
  </div>
);

function Router() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <SeoHead />
        <ScrollToTop />
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/forgot-password" component={ForgotPasswordPage} />
          <Route path="/reset-password" component={ResetPasswordPage} />
          <Route path="/dashboard" component={ProtectedDashboard} />
          <Route path="/complete-profile" component={ProtectedDashboard} />
          <Route path="/profile" component={ProtectedProfile} />
          <Route path="/admin/pdf-extractor" component={PdfExtractor} />
          <Route path="/admin">
            <ProtectedAdmin />
          </Route>
          <Route path="/courses/:gradeLevel" component={Courses} />
          <Route path="/stage/:stageId" component={Stage} />
          <Route path="/lesson/:stage/:subject/:lessonId?" component={Lesson} />
          <Route path="/pdf-viewer" component={PdfViewer} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LessonProgressProvider>
          <Toaster />
          <Router />
        </LessonProgressProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
