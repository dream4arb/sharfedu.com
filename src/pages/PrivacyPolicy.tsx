import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { setPageMeta } from "@/lib/seo";
import { Shield, ChevronLeft } from "lucide-react";

const lastUpdated = "15 فبراير 2026";

const sections = [
  {
    id: "intro",
    title: "مقدمة",
    content: `نحن في منصة شارف التعليمية نُولي خصوصية مستخدمينا أهمية بالغة، ونلتزم بحماية بياناتهم الشخصية وفقاً لأنظمة المملكة العربية السعودية، بما في ذلك نظام حماية البيانات الشخصية الصادر بالمرسوم الملكي رقم (م/19) وتاريخ 9/2/1443هـ. توضح هذه السياسة كيفية جمع بياناتك واستخدامها وحمايتها عند استخدامك لمنصتنا وخدماتنا التعليمية.

باستخدامك لمنصة شارف، فإنك توافق على الممارسات الموضحة في هذه السياسة. نرجو قراءتها بعناية، وفي حال وجود أي استفسار، لا تتردد في التواصل معنا عبر القنوات المذكورة أدناه.`,
  },
  {
    id: "data-collection",
    title: "البيانات التي نجمعها",
    content: `نجمع أنواعاً محددة من البيانات اللازمة لتقديم خدماتنا التعليمية بالشكل الأمثل، وتشمل:`,
    subsections: [
      {
        title: "بيانات التسجيل والحساب",
        items: [
          "الاسم الكامل وعنوان البريد الإلكتروني عند إنشاء الحساب",
          "المرحلة الدراسية والصف الذي يدرس فيه الطالب",
          "كلمة المرور (تُخزّن بشكل مشفّر ولا يمكن لأي شخص الاطلاع عليها)",
          "بيانات تسجيل الدخول عبر حساب Google في حال اختيار هذه الطريقة",
        ],
      },
      {
        title: "بيانات الاستخدام والتفاعل",
        items: [
          "الدروس التي يتابعها الطالب ومدة المشاهدة",
          "نتائج الاختبارات والتقييمات ومعدلات الإنجاز",
          "التفاعل مع محتوى الذكاء الاصطناعي والملخصات",
          "الصفحات التي تمت زيارتها وأوقات النشاط على المنصة",
        ],
      },
      {
        title: "بيانات تقنية",
        items: [
          "نوع المتصفح ونظام التشغيل المستخدم",
          "عنوان بروتوكول الإنترنت (IP) لأغراض أمنية فقط",
          "ملفات تعريف الارتباط (الكوكيز) الضرورية لعمل المنصة",
        ],
      },
    ],
  },
  {
    id: "data-usage",
    title: "كيف نستخدم بياناتك",
    content: `نستخدم البيانات المجمّعة للأغراض التالية حصراً:`,
    items: [
      "تقديم الخدمات التعليمية وتخصيص المحتوى بما يتناسب مع المرحلة الدراسية للطالب",
      "تتبع التقدم الدراسي وعرض الإحصائيات والتقارير الخاصة بكل طالب",
      "تحسين تجربة التعلم من خلال تحليل أنماط الاستخدام وتطوير المحتوى",
      "تشغيل خدمات الذكاء الاصطناعي لتقديم الملخصات والتوصيات المخصصة",
      "إرسال الإشعارات المهمة المتعلقة بالحساب أو التحديثات الجوهرية على المنصة",
      "ضمان أمن المنصة والكشف عن أي محاولات وصول غير مشروعة",
      "الامتثال للمتطلبات القانونية والتنظيمية المعمول بها في المملكة العربية السعودية",
    ],
  },
  {
    id: "data-sharing",
    title: "مشاركة البيانات مع أطراف ثالثة",
    content: `نتعامل مع بياناتك بمسؤولية تامة، ونؤكد على الالتزامات التالية:`,
    items: [
      "لا نبيع بياناتك الشخصية لأي جهة تحت أي ظرف من الظروف",
      "لا نشارك معلوماتك مع جهات تسويقية أو إعلانية",
      "قد نشارك بيانات محدودة مع مزودي خدمات تقنية موثوقين (مثل خدمات الاستضافة والبريد الإلكتروني) بموجب اتفاقيات سرية صارمة وفي حدود ما هو ضروري لتشغيل المنصة",
      "نستخدم خدمات Google للمصادقة وتسجيل الدخول، وتخضع هذه العملية لسياسة خصوصية Google المعمول بها",
      "قد نُفصح عن بيانات في الحالات التي يُلزمنا فيها القانون أو بناءً على أمر قضائي صادر من جهة مختصة",
    ],
  },
  {
    id: "ai-services",
    title: "خدمات الذكاء الاصطناعي",
    content: `تعتمد منصة شارف على تقنيات الذكاء الاصطناعي لتعزيز التجربة التعليمية. نود توضيح الآتي بشأن استخدام هذه التقنيات:`,
    items: [
      "نستخدم نماذج ذكاء اصطناعي لتوليد ملخصات الدروس وتقديم المساعدة التعليمية التفاعلية",
      "المحتوى المُرسل لمعالجة الذكاء الاصطناعي يقتصر على المادة التعليمية ذات الصلة، ولا يتضمن بيانات شخصية للطالب",
      "لا تُستخدم بياناتك لتدريب نماذج ذكاء اصطناعي خارجية",
      "نتائج الذكاء الاصطناعي تُقدَّم كأداة مساعدة وليست بديلاً عن المنهج الدراسي المعتمد",
    ],
  },
  {
    id: "data-protection",
    title: "حماية البيانات وأمنها",
    content: `نطبّق مجموعة من الإجراءات التقنية والتنظيمية لحماية بياناتك، تشمل:`,
    items: [
      "تشفير كلمات المرور باستخدام خوارزميات تشفير قوية ومعتمدة عالمياً (bcrypt)",
      "استخدام بروتوكول HTTPS لتشفير جميع البيانات المنقولة بين جهازك والمنصة",
      "تطبيق رؤوس أمان HTTP المتقدمة للحماية من هجمات الاختراق الشائعة",
      "إدارة جلسات المستخدمين بآليات آمنة مع انتهاء تلقائي للجلسات غير النشطة",
      "تقييد صلاحيات الوصول إلى قواعد البيانات ومنحها للمسؤولين المعتمدين فقط",
      "إجراء مراجعات أمنية دورية وتحديث الأنظمة بشكل مستمر",
    ],
  },
  {
    id: "cookies",
    title: "ملفات تعريف الارتباط (الكوكيز)",
    content: `نستخدم ملفات تعريف الارتباط الضرورية لتشغيل المنصة بشكل سليم. وتشمل:`,
    items: [
      "كوكيز الجلسة: لإدارة تسجيل الدخول والحفاظ على اتصالك بالمنصة أثناء التصفح",
      "كوكيز التفضيلات: لحفظ إعداداتك مثل وضع العرض (فاتح/داكن) واللغة المفضلة",
      "لا نستخدم كوكيز تتبع إعلانية أو كوكيز لأطراف ثالثة لأغراض تسويقية",
    ],
    note: "يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح الخاص بك، مع العلم أن تعطيل بعض الكوكيز الضرورية قد يؤثر على وظائف المنصة.",
  },
  {
    id: "user-rights",
    title: "حقوقك كمستخدم",
    content: `وفقاً لنظام حماية البيانات الشخصية في المملكة العربية السعودية، تتمتع بالحقوق التالية:`,
    items: [
      "الحق في الاطلاع على بياناتك الشخصية المخزنة لدينا وطلب نسخة منها",
      "الحق في تصحيح أي بيانات غير دقيقة أو تحديثها من خلال صفحة الملف الشخصي",
      "الحق في طلب حذف حسابك وبياناتك الشخصية مع مراعاة الالتزامات القانونية",
      "الحق في سحب موافقتك على معالجة بياناتك في أي وقت",
      "الحق في الاعتراض على معالجة بياناتك لأغراض معينة",
      "الحق في نقل بياناتك إلى مزود خدمة آخر بصيغة قابلة للقراءة",
    ],
    note: "لممارسة أي من هذه الحقوق، يُرجى التواصل معنا عبر البريد الإلكتروني المذكور في قسم التواصل أدناه، وسنستجيب لطلبك خلال مدة لا تتجاوز ثلاثين يوماً.",
  },
  {
    id: "children",
    title: "خصوصية الأطفال",
    content: `بما أن منصة شارف تقدم خدمات تعليمية للطلاب في مختلف المراحل الدراسية، بما فيها المرحلة الابتدائية، فإننا نولي اهتماماً خاصاً بخصوصية القاصرين:`,
    items: [
      "نوصي بأن يتم إنشاء حسابات الطلاب دون سن الثالثة عشرة بإشراف ولي الأمر",
      "لا نجمع من الأطفال بيانات تتجاوز ما هو ضروري لتقديم الخدمة التعليمية",
      "لا نعرض إعلانات موجهة للأطفال ولا نشارك بياناتهم مع جهات إعلانية",
      "يحق لولي الأمر الاطلاع على بيانات الطالب أو طلب تعديلها أو حذفها",
    ],
  },
  {
    id: "data-retention",
    title: "الاحتفاظ بالبيانات",
    content: `نحتفظ ببياناتك الشخصية طالما كان حسابك نشطاً أو حسب الحاجة لتقديم خدماتنا. وفيما يلي تفاصيل سياسة الاحتفاظ:`,
    items: [
      "بيانات الحساب: تُحفظ طوال فترة نشاط الحساب، وتُحذف خلال تسعين يوماً من طلب إغلاق الحساب",
      "سجلات التقدم الدراسي: تُحفظ لمدة عامين بعد آخر نشاط على الحساب",
      "البيانات التقنية وسجلات الأمان: تُحفظ لمدة لا تتجاوز اثني عشر شهراً",
      "قد نحتفظ ببعض البيانات لفترات أطول إذا اقتضت الأنظمة واللوائح المعمول بها ذلك",
    ],
  },
  {
    id: "changes",
    title: "التعديلات على سياسة الخصوصية",
    content: `نحتفظ بالحق في تحديث هذه السياسة بشكل دوري لتعكس التغييرات في ممارساتنا أو المتطلبات القانونية. وعند إجراء تعديلات جوهرية:`,
    items: [
      "سنُشعرك عبر البريد الإلكتروني المسجل لدينا أو من خلال إشعار بارز على المنصة",
      "سنُحدّث تاريخ آخر تعديل المذكور في أعلى هذه الصفحة",
      "استمرارك في استخدام المنصة بعد نشر التعديلات يُعدّ قبولاً لها",
    ],
  },
  {
    id: "contact",
    title: "التواصل معنا",
    content: `إذا كانت لديك أسئلة أو استفسارات حول سياسة الخصوصية أو كيفية تعاملنا مع بياناتك، يمكنك التواصل معنا عبر:`,
    contactInfo: [
      { label: "البريد الإلكتروني", value: "info@sharfedu.com" },
      { label: "الهاتف", value: "0555005547" },
      { label: "العنوان", value: "الرياض، المملكة العربية السعودية" },
    ],
    note: "نسعى للرد على جميع الاستفسارات المتعلقة بالخصوصية خلال خمسة أيام عمل كحد أقصى.",
  },
  {
    id: "governing-law",
    title: "القانون الحاكم",
    content: `تخضع هذه السياسة لأنظمة المملكة العربية السعودية وتُفسَّر وفقاً لها. وفي حال نشوء أي نزاع يتعلق بهذه السياسة، تختص المحاكم المعنية في مدينة الرياض بالنظر فيه والبت فيه وفقاً للأنظمة المرعية.`,
  },
];

export default function PrivacyPolicy() {
  useEffect(() => {
    setPageMeta(
      "سياسة الخصوصية | منصة شارف التعليمية",
      "سياسة الخصوصية لمنصة شارف التعليمية - تعرف على كيفية جمع واستخدام وحماية بياناتك الشخصية وفقاً لأنظمة المملكة العربية السعودية",
      "سياسة الخصوصية، حماية البيانات، شارف، منصة تعليمية، بيانات شخصية"
    );
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main>
        <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden bg-gradient-to-b from-primary/5 via-accent/30 to-background">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-200/15 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6" data-testid="badge-privacy">
                <Shield className="w-4 h-4" />
                الخصوصية والأمان
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6" data-testid="text-privacy-title">
                سياسة الخصوصية
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                نلتزم بحماية خصوصيتك وبياناتك الشخصية بأعلى معايير الأمان
              </p>
              <p className="text-sm text-muted-foreground">
                آخر تحديث: {lastUpdated}
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[280px_1fr] gap-10 max-w-6xl mx-auto">
              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="hidden lg:block"
              >
                <div className="sticky top-28 bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-border/50 p-5" data-testid="nav-privacy-sidebar">
                  <h3 className="font-bold text-sm mb-4 text-primary">فهرس المحتويات</h3>
                  <nav className="flex flex-col gap-1">
                    {sections.map((section, i) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors py-1.5 px-3 rounded-lg hover:bg-primary/5 flex items-center gap-2"
                        data-testid={`link-privacy-nav-${i}`}
                      >
                        <ChevronLeft className="w-3 h-3 shrink-0 opacity-50" />
                        {section.title}
                      </a>
                    ))}
                  </nav>
                </div>
              </motion.aside>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-10"
              >
                {sections.map((section, sIndex) => (
                  <article
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-28"
                    data-testid={`section-privacy-${section.id}`}
                  >
                    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-border/40 p-6 sm:p-8 hover:border-primary/20 transition-colors">
                      <div className="flex items-center gap-3 mb-5">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold">
                          {sIndex + 1}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold">{section.title}</h2>
                      </div>

                      <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-[15px]">
                        {section.content}
                      </div>

                      {section.subsections && (
                        <div className="mt-6 space-y-5">
                          {section.subsections.map((sub) => (
                            <div key={sub.title}>
                              <h3 className="font-bold text-base mb-3 text-foreground">{sub.title}</h3>
                              <ul className="space-y-2">
                                {sub.items.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-3 text-muted-foreground text-[15px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                                    <span className="leading-relaxed">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}

                      {section.items && (
                        <ul className="mt-5 space-y-2.5">
                          {section.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-muted-foreground text-[15px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {section.contactInfo && (
                        <div className="mt-5 grid sm:grid-cols-3 gap-4">
                          {section.contactInfo.map((info) => (
                            <div key={info.label} className="p-4 rounded-xl bg-accent/30 dark:bg-white/5 text-center">
                              <div className="text-xs text-muted-foreground mb-1">{info.label}</div>
                              <div className="font-bold text-sm text-foreground" dir="ltr">{info.value}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {section.note && (
                        <div className="mt-5 p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm text-muted-foreground leading-relaxed">
                          <strong className="text-foreground">ملاحظة: </strong>
                          {section.note}
                        </div>
                      )}
                    </div>
                  </article>
                ))}

                <div className="text-center pt-6 pb-4">
                  <Link href="/" className="text-primary hover:underline text-sm font-medium" data-testid="link-privacy-home">
                    العودة إلى الصفحة الرئيسية
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
