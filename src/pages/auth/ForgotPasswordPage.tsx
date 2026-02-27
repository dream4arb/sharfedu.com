import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiUrl } from "@/lib/api-base";
import { usePageSeo } from "@/hooks/use-page-seo";
import { Loader2, Mail, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  usePageSeo({
    title: "استعادة كلمة المرور",
    description: "استعد كلمة المرور الخاصة بحسابك على منصة شارف التعليمية.",
    keywords: "استعادة كلمة المرور, نسيت كلمة المرور, شارف",
  });
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSuccessMessage("");
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "حدث خطأ.");
        setLoading(false);
        return;
      }
      setSuccess(true);
      setSuccessMessage((data.message as string) || "تم إنشاء الرمز.");
    } catch {
      setError("خطأ في الاتصال.");
    }
    setLoading(false);
  };

  const emailSent = successMessage.includes("إرسال") && !successMessage.includes("SMTP");

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
          <h1 className="text-2xl font-bold text-slate-800 mb-2">استعادة كلمة المرور</h1>
          <p className="text-slate-500 text-sm mb-6">أدخل بريدك وسنرسل لك رمزاً للتحقق (صالح 15 دقيقة)</p>
          {success ? (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border text-sm ${
                  emailSent
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-amber-50 border-amber-200 text-amber-800"
                }`}
              >
                {successMessage}
                {emailSent
                  ? " أدخل الرمز وكلمة المرور الجديدة في الصفحة التالية."
                  : " لتفعيل إرسال الرمز إلى البريد، أضف إعدادات SMTP في ملف .env (راجع docs/تفعيل_SMTP.md)."}
              </div>
              <Link href="/reset-password">
                <Button className="w-full h-11 gap-2">
                  إدخال الرمز وكلمة المرور الجديدة
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
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
              <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "إرسال الرمز"}
              </Button>
            </form>
          )}
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
