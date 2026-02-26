import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Baby, BookOpen, GraduationCap, Route, Target, LayoutDashboard, User, LogOut, Shield } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

const stages = [
  { id: "elementary", name: "الابتدائية", icon: Baby, color: "text-sky-500" },
  { id: "middle", name: "المتوسطة", icon: BookOpen, color: "text-emerald-500" },
  { id: "high", name: "الثانوية", icon: GraduationCap, color: "text-violet-500" },
  { id: "paths", name: "المسارات", icon: Route, color: "text-amber-500" },
  { id: "qudurat", name: "القدرات والتحصيلي", icon: Target, color: "text-rose-500" },
];

function displayName(user: { firstName?: string | null; lastName?: string | null; email?: string }) {
  const first = (user.firstName ?? "").trim();
  const last = (user.lastName ?? "").trim();
  if (first && last) return `${first} ${last}`;
  if (first) return first;
  return "طالب";
}

export function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [stagesOpen, setStagesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [location] = useLocation();
  const stagesRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stagesRef.current && !stagesRef.current.contains(event.target as Node)) {
        setStagesOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "#features", label: "المميزات" },
    { href: "#contact", label: "تواصل معنا" },
  ];

  return (
    <nav className={`fixed top-0 right-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled ? "bg-white/95 dark:bg-card/95 backdrop-blur-lg shadow-sm" : "bg-transparent"
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" data-testid="link-logo">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/35 transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-black text-xl">ش</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-foreground leading-none">
                شارف
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  location === link.href || (link.href.startsWith('#') && location.includes(link.href))
                    ? "text-primary bg-primary/10" 
                    : "text-foreground/70 hover:text-foreground"
                }`}
                data-testid={`link-nav-${link.href.replace('#', '').replace('/', 'home')}`}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="relative" ref={stagesRef}>
              <button
                onClick={() => setStagesOpen(!stagesOpen)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1 ${
                  location.startsWith('/stage') 
                    ? "text-primary bg-primary/10" 
                    : "text-foreground/70"
                }`}
                data-testid="button-stages-dropdown"
              >
                المراحل الدراسية
                <ChevronDown className={`w-4 h-4 transition-transform ${stagesOpen ? "rotate-180" : ""}`} />
              </button>
              
              <AnimatePresence>
                {stagesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-card rounded-xl shadow-xl border border-border/50 overflow-hidden z-50"
                  >
                    <div className="p-2">
                      {stages.map((stage) => {
                        const Icon = stage.icon;
                        return (
                          <Link
                            key={stage.id}
                            href={`/stage/${stage.id}`}
                            onClick={() => setStagesOpen(false)}
                            data-testid={`nav-stage-${stage.id}`}
                          >
                            <div className="flex items-center gap-3 p-3 rounded-lg transition-colors hover-elevate cursor-pointer">
                              <Icon className={`w-5 h-5 ${stage.color}`} />
                              <span className="font-semibold text-foreground">{stage.name}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {!isLoading && (user ? (
              <>
              {user.role === "admin" && (
                <Link href="/admin" data-testid="link-admin">
                  <Button variant="outline" className="font-semibold rounded-full gap-2">
                    <Shield className="w-4 h-4" />
                    إدارة المنصة
                  </Button>
                </Link>
              )}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-full border border-border/60 bg-card/50 hover:bg-accent/50 transition-colors"
                  data-testid="button-user-menu"
                >
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-border/50"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <span className="font-semibold text-foreground max-w-[120px] truncate">
                    {displayName(user)}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-card rounded-xl shadow-xl border border-border/50 overflow-hidden z-50"
                    >
                      <div className="p-1.5">
                        <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} data-testid="link-dashboard">
                          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                            <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">لوحة التحكم</span>
                          </div>
                        </Link>
                        <Link href="/profile" onClick={() => setUserMenuOpen(false)} data-testid="link-profile">
                          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">بياناتي الشخصية</span>
                          </div>
                        </Link>
                        {user.role === "admin" && (
                          <Link href="/admin" onClick={() => setUserMenuOpen(false)} data-testid="link-admin-menu">
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                              <Shield className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">إدارة المنصة</span>
                            </div>
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            logout();
                            window.location.href = "/";
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-right"
                          data-testid="button-logout"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="font-medium">تسجيل الخروج</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              </>
            ) : (
              <>
                <Link href="/login" data-testid="link-login">
                  <Button variant="ghost" className="font-semibold rounded-full">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link href="/register" data-testid="link-register">
                  <Button className="font-bold rounded-full shadow-lg shadow-primary/25">
                    إنشاء حساب
                  </Button>
                </Link>
                <Link href="/stage/middle" data-testid="link-start">
                  <Button variant="outline" className="font-semibold rounded-full">
                    ابدأ الآن
                  </Button>
                </Link>
              </>
            ))}
          </div>

          <button 
            className="lg:hidden p-2.5 rounded-xl bg-accent/50 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="button-mobile-menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-card border-t border-border/50"
          >
            <div className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  onClick={() => setIsOpen(false)} 
                  className="px-4 py-3 rounded-xl font-semibold transition-colors"
                  data-testid={`mobile-link-${link.href.replace('#', '').replace('/', 'home')}`}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="px-4 py-2 text-sm font-bold text-muted-foreground">المراحل الدراسية</div>
              {stages.map((stage) => {
                const Icon = stage.icon;
                return (
                  <Link
                    key={stage.id}
                    href={`/stage/${stage.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                    data-testid={`mobile-stage-${stage.id}`}
                  >
                    <Icon className={`w-5 h-5 ${stage.color}`} />
                    <span className="font-semibold">{stage.name}</span>
                  </Link>
                );
              })}
              
              <div className="h-px bg-border/50 my-3" />
              {user ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/30">
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-border/50"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <span className="font-semibold text-foreground">{displayName(user)}</span>
                  </div>
                  <Link href="/dashboard" className="w-full" onClick={() => setIsOpen(false)} data-testid="mobile-link-dashboard">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-colors">
                      <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">لوحة التحكم</span>
                    </div>
                  </Link>
                  <Link href="/profile" className="w-full" onClick={() => setIsOpen(false)} data-testid="mobile-link-profile">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-colors">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">بياناتي الشخصية</span>
                    </div>
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin" className="w-full" onClick={() => setIsOpen(false)} data-testid="mobile-link-admin">
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-colors">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">إدارة المنصة</span>
                      </div>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                      window.location.href = "/";
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-right"
                    data-testid="mobile-button-logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">تسجيل الخروج</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="w-full" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl" data-testid="mobile-link-login">
                      تسجيل الدخول
                    </Button>
                  </Link>
                  <Link href="/register" className="w-full" onClick={() => setIsOpen(false)}>
                    <Button className="w-full rounded-xl" data-testid="mobile-link-register">
                      إنشاء حساب
                    </Button>
                  </Link>
                  <Link href="/stage/middle" className="w-full" onClick={() => setIsOpen(false)}>
                    <Button className="w-full rounded-xl" data-testid="mobile-link-start">
                      ابدأ الآن مجاناً
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
