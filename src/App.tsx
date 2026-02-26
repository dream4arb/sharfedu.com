import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LessonProgressProvider } from "@/hooks/use-lesson-progress";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Courses from "@/pages/Courses";
import Stage from "@/pages/Stage";
import Subject from "@/pages/Subject";
import Lesson from "@/pages/Lesson";
import PdfViewer from "@/pages/PdfViewer";
import PdfExtractor from "@/pages/PdfExtractor";
import AdminDashboard from "@/pages/AdminDashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import NotFound from "@/pages/not-found";
import { SeoHead } from "@/components/SeoHead";
import { useAuth } from "@/hooks/use-auth";

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

function Router() {
  return (
    <>
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
          <ErrorBoundary>
            <ProtectedAdmin />
          </ErrorBoundary>
        </Route>
        {/* DISABLED: Smart Teacher feature temporarily disabled */}
        {/* <Route path="/chat" component={ChatPage} /> */}
        <Route path="/courses/:gradeLevel" component={Courses} />
        <Route path="/stage/:stageId" component={Stage} />
        <Route path="/lesson/:stage/:subject/:lessonId?" component={Lesson} />
        <Route path="/pdf-viewer" component={PdfViewer} />
        <Route component={NotFound} />
      </Switch>
    </>
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
