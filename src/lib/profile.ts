/**
 * الحقول المخزنة للملف الشخصي: المرحلة والصف فقط
 */
export type ProfileUser = {
  stageSlug?: string | null;
  gradeId?: string | null;
  profileLocked?: boolean | null;
  role?: string | null;
  email?: string | null;
};

/** المدير له صلاحية كاملة على جميع المراحل والصفوف والمواد */
const ADMIN_EMAIL = "arb998@gmail.com";

function isAdmin(user: ProfileUser | null | undefined): boolean {
  if (!user) return false;
  const role = user.role ?? (user as Record<string, unknown>).role;
  const email = user.email ?? (user as Record<string, unknown>).email;
  return role === "admin" || email === ADMIN_EMAIL;
}

/**
 * يتحقق من اكتمال الملف الشخصي - نفس الحقول التي يتم حفظها (المرحلة والصف فقط)
 * المدير يعتبر مكتملاً دائماً (يتخطى صفحة إكمال الملف)
 */
export function isProfileComplete(user: ProfileUser | null | undefined): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true; // المدير: يعتبر مكتملاً
  const stage = user.stageSlug ?? (user as Record<string, unknown>).stage_slug;
  const grade = user.gradeId ?? (user as Record<string, unknown>).grade_id;
  return !!(stage && grade);
}

/**
 * يتحقق مما إذا كان المستخدم يستطيع الوصول لمرحلة وصف معيّنين
 * تم إلغاء القيود: الجميع يمكنه الوصول لجميع المراحل والصفوف
 */
export function canAccessStageGrade(
  _stageId: string,
  _gradeId: string,
  _user: ProfileUser | null | undefined
): boolean {
  return true;
}

/** يتحقق مما إذا كان المستخدم يستطيع الوصول لمرحلة فقط */
export function canAccessStage(_stageId: string, _user: ProfileUser | null | undefined): boolean {
  return true;
}
