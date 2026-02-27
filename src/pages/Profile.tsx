import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { usePageSeo } from "@/hooks/use-page-seo";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { getApiUrl } from "@/lib/api-base";
import { Loader2, User, Lock, ArrowRight, BookOpen, Baby, GraduationCap, Route, Target } from "lucide-react";

const stages = [
  { id: "elementary", name: "الابتدائية", icon: Baby },
  { id: "middle", name: "المتوسطة", icon: BookOpen },
  { id: "high", name: "الثانوية", icon: GraduationCap },
  { id: "paths", name: "المسارات", icon: Route },
  { id: "qudurat", name: "القدرات والتحصيلي", icon: Target },
];

export default function Profile() {
  usePageSeo({
    title: "الملف الشخصي",
    description: "إدارة ملفك الشخصي وإعدادات حسابك على منصة شارف التعليمية.",
    keywords: "الملف الشخصي, إعدادات الحساب, شارف",
  });
  const { user, logout, refetch: refetchUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const u = user as { stageSlug?: string; gradeId?: string; email?: string; firstName?: string; lastName?: string; profileImageUrl?: string } | undefined;
  const selectedStage = u?.stageSlug || null;
  const currentStage = stages.find((s) => s.id === selectedStage);

  const [personalEmail, setPersonalEmail] = useState("");
  const [personalFirstName, setPersonalFirstName] = useState("طالب");
  const [personalLastName, setPersonalLastName] = useState("");
  const [personalAvatarUrl, setPersonalAvatarUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [personalSaving, setPersonalSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.email) setPersonalEmail(String(user.email ?? "").trim());
    setPersonalFirstName(String(user.firstName ?? "").trim() || "طالب");
    setPersonalLastName(String(user.lastName ?? "").trim());
    setPersonalAvatarUrl(String(user.profileImageUrl ?? "").trim());
  }, [user]);

  return (
    <div className="min-h-screen bg-accent/30" dir="rtl">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6" data-testid="link-back-dashboard">
          <ArrowRight className="w-4 h-4" />
          العودة إلى لوحة التحكم
        </Link>

        <h1 className="text-2xl font-black mb-6">بياناتي الشخصية</h1>

        <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border/50 p-6 space-y-6 font-['Tajawal']">
          {/* المرحلة الدراسية */}
          <div className="flex items-center justify-between py-4 border-b border-border/50">
            <div>
              <div className="font-semibold">المرحلة الدراسية</div>
              <div className="text-sm text-muted-foreground">{currentStage?.name || "لم يتم التحديد"}</div>
            </div>
            <Link href="/complete-profile">
              <Button variant="outline" data-testid="button-settings-change-stage">تغيير</Button>
            </Link>
          </div>

          {/* الإشعارات */}
          <div className="flex items-center justify-between py-4 border-b border-border/50">
            <div>
              <div className="font-semibold">الإشعارات</div>
              <div className="text-sm text-muted-foreground">تلقي إشعارات الدروس الجديدة</div>
            </div>
            <Button variant="outline" data-testid="button-settings-notifications" onClick={() => toast({ title: "قريباً", description: "سيتم تفعيل الإشعارات في نسخة لاحقة" })}>
              تفعيل
            </Button>
          </div>

          {/* بياناتي الشخصية - النموذج */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              تعديل البيانات
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-muted overflow-hidden border-2 border-border flex items-center justify-center shrink-0">
                {personalAvatarUrl ? (
                  <img src={personalAvatarUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">{(personalFirstName || "ط").charAt(0)}</span>
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor="profile-avatar">رابط الصورة الرمزية</Label>
                <Input
                  id="profile-avatar"
                  type="url"
                  value={personalAvatarUrl}
                  onChange={(e) => setPersonalAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 font-tajawal"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profile-firstname">الاسم (الافتراضي: طالب)</Label>
                <Input
                  id="profile-firstname"
                  type="text"
                  value={personalFirstName}
                  onChange={(e) => setPersonalFirstName(e.target.value)}
                  placeholder="طالب"
                  className="mt-2 font-tajawal"
                />
              </div>
              <div>
                <Label htmlFor="profile-lastname">اسم العائلة</Label>
                <Input
                  id="profile-lastname"
                  type="text"
                  value={personalLastName}
                  onChange={(e) => setPersonalLastName(e.target.value)}
                  placeholder="اختياري"
                  className="mt-2 font-tajawal"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="profile-email">البريد الإلكتروني</Label>
              <Input
                id="profile-email"
                type="email"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
                placeholder="example@email.com"
                className="mt-2 font-tajawal"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                تغيير كلمة المرور
              </Label>
              <Input
                type="password"
                placeholder="كلمة المرور الحالية (للتغيير فقط)"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="font-tajawal"
              />
              <Input
                type="password"
                placeholder="كلمة المرور الجديدة (6 أحرف على الأقل)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="font-tajawal"
              />
              <Input
                type="password"
                placeholder="تأكيد كلمة المرور الجديدة"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="font-tajawal"
              />
            </div>
            <Button
              className="w-full"
              disabled={personalSaving}
              onClick={async () => {
                const emailChanged = personalEmail.trim() && personalEmail.trim() !== String(u?.email ?? "").trim();
                const wantPassword = newPassword.trim().length >= 6;
                const nameOrAvatarChanged =
                  personalFirstName.trim() !== (String(u?.firstName ?? "").trim() || "طالب") ||
                  personalLastName.trim() !== String(u?.lastName ?? "").trim() ||
                  personalAvatarUrl.trim() !== String(u?.profileImageUrl ?? "").trim();
                if (wantPassword && newPassword !== confirmPassword) {
                  toast({ title: "كلمة المرور الجديدة وتأكيدها غير متطابقتين", variant: "destructive" });
                  return;
                }
                if (wantPassword && !currentPassword.trim()) {
                  toast({ title: "أدخل كلمة المرور الحالية لتغيير كلمة المرور", variant: "destructive" });
                  return;
                }
                if (!emailChanged && !wantPassword && !nameOrAvatarChanged) {
                  toast({ title: "لم يتم تغيير أي بيانات", variant: "destructive" });
                  return;
                }
                setPersonalSaving(true);
                try {
                  const body: { email?: string; currentPassword?: string; newPassword?: string; firstName?: string; lastName?: string; profileImageUrl?: string } = {};
                  if (emailChanged) body.email = personalEmail.trim();
                  if (wantPassword) { body.currentPassword = currentPassword; body.newPassword = newPassword.trim(); }
                  if (nameOrAvatarChanged) {
                    body.firstName = personalFirstName.trim() || "طالب";
                    body.lastName = personalLastName.trim() || undefined;
                    body.profileImageUrl = personalAvatarUrl.trim() || undefined;
                  }
                  const url = getApiUrl("/api/auth/account");
                  const res = await fetch(url, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(body),
                  });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    const msg = data?.message || (res.status === 401 ? "انتهت الجلسة. سجّل الدخول مرة أخرى." : "فشل تحديث الحساب.");
                    throw new Error(msg);
                  }
                  if (data.user) queryClient.setQueryData(["/api/auth/user"], data.user);
                  toast({ title: "تم حفظ التعديلات بنجاح" });
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : "فشل الحفظ";
                  toast({ title: "خطأ", description: msg, variant: "destructive" });
                } finally {
                  setPersonalSaving(false);
                }
              }}
              data-testid="button-save-personal"
            >
              {personalSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
              حفظ التعديلات
            </Button>
          </div>

          {/* تسجيل الخروج */}
          <div className="flex items-center justify-between py-4 border-t border-border/50">
            <div>
              <div className="font-semibold">تسجيل الخروج</div>
              <div className="text-sm text-muted-foreground">الخروج من حسابك</div>
            </div>
            <Button variant="destructive" onClick={() => logout()} data-testid="button-logout">
              خروج
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
