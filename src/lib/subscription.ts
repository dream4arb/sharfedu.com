/**
 * تم إلغاء منطق انتهاء الاشتراك - الحساب يظل نشطاً دائماً
 */

export interface SchoolYearSettings {
  schoolYearStart: string;
  schoolYearEnd: string;
  semester1End: string;
}

export interface SubscriptionResult {
  hasSemester1: boolean;
  hasSemester2: boolean;
  expiresAt: string | null;
}

/** اشتراك كامل دائماً - لا انتهاء للصلاحية */
export function computeSubscription(
  _userCreatedAt: Date | string,
  _settings: SchoolYearSettings
): SubscriptionResult {
  return {
    hasSemester1: true,
    hasSemester2: true,
    expiresAt: null,
  };
}

/** المحتوى متاح دائماً */
export function canAccessSemester(
  _semesterId: string,
  _subscription: SubscriptionResult
): boolean {
  return true;
}
