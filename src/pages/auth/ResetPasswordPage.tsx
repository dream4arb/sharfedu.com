import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiUrl } from "@/lib/api-base";
import { Loader2, Mail, Lock, Hash } from "lucide-react";

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("كلمة المرور وتأكيدها غير متطابقتين.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "فشل تغيير كلمة المرور.");
        setLoading(false);
        return;
      }
      setLocation("/login");
    } catch {
      setError("خطأ في الاتصال.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-xl">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-white">ش</span>
            منصة شارف التعليمية
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">تعيين كلمة مرور جديدة</h1>
          <p className="text-slate-500 text-sm mb-6">أدخل البريد والرمز الذي وصلك وكلمة المرور الجديدة</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">الرمز (6 أرقام)</Label>
              <div className="relative">
                <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="pr-10 font-mono text-lg tracking-widest"
                  required
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">كلمة المرور الجديدة (6 أحرف على الأقل)</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ كلمة المرور والدخول"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href="/login" className="font-semibold text-primary hover:underline">
              العودة لتسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
