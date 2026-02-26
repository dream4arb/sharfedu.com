import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
});

const FROM = process.env.MAIL_FROM || process.env.SMTP_USER || "noreply@sharfedu.com";

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  console.log("[Mail] SMTP مُعد — الإرسال من", process.env.SMTP_USER, "عبر", process.env.SMTP_HOST || "smtp.gmail.com");
} else {
  console.warn("[Mail] SMTP غير مُعد (SMTP_USER أو SMTP_PASS فارغ في .env)");
}

export async function sendPasswordResetCode(email: string, code: string): Promise<{ sent: boolean; error?: string }> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[Mail] SMTP غير مُعد — رمز استعادة كلمة المرور (للتجربة):", code);
    return { sent: false };
  }
  try {
    console.log("[Mail] إرسال رمز استعادة إلى", email, "عبر", process.env.SMTP_HOST);
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: "رمز استعادة كلمة المرور — منصة شارف التعليمية",
      text: `رمزك هو: ${code}\nصالح لمدة 15 دقيقة.\nلم تطلب هذا؟ تجاهل هذه الرسالة.`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 400px;">
          <h2>استعادة كلمة المرور</h2>
          <p>رمزك للتحقق:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #0ea5e9;">${code}</p>
          <p style="color: #64748b;">صالح لمدة 15 دقيقة.</p>
          <p style="color: #64748b;">لم تطلب هذا؟ يمكنك تجاهل هذه الرسالة.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;" />
          <p style="font-size: 12px; color: #94a3b8;">منصة شارف التعليمية</p>
        </div>
      `,
    });
    return { sent: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Mail] فشل إرسال بريد استعادة كلمة المرور:", err);
    return { sent: false, error: msg };
  }
}
