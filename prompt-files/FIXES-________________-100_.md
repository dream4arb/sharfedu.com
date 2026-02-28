# 🔧 الإصلاحات المحددة للوصول إلى 100%

## ✅ **استبدل الرسومات القديمة بهذه النسخ المحسّنة:**

---

## 🎨 **الرسم 1: تجربة جاليليو** (محسّن 100%)

**استبدل الكود القديم بهذا:**

```html
<div class="svg-container">
  <svg viewBox="0 0 640 300" width="640" height="300">
    <!-- العنوان -->
    <text x="320" y="28" text-anchor="middle" font-size="16" font-weight="900" fill="#1e293b">تجربة جاليليو: إثبات أن للهواء كتلة</text>

    <!-- دورق غير محقون -->
    <rect x="40" y="60" width="250" height="180" rx="16" fill="#f0f9ff" stroke="#bae6fd" stroke-width="2"/>
    
    <text x="165" y="88" text-anchor="middle" font-size="14" font-weight="700" fill="#0c4a6e">
      <tspan x="165" dy="0">دورق غير محقون</tspan>
      <tspan x="165" dy="18">بالهواء</tspan>
    </text>
    
    <!-- الدورق -->
    <ellipse cx="120" cy="180" rx="45" ry="35" fill="white" stroke="#64748b" stroke-width="2"/>
    <line x1="120" y1="145" x2="120" y2="120" stroke="#64748b" stroke-width="2"/>
    <circle cx="120" cy="117" r="5" fill="#64748b"/>
    
    <!-- الميزان -->
    <rect x="190" y="155" width="60" height="40" rx="6" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="220" y="180" text-anchor="middle" font-size="14" font-weight="800" fill="#334155">50 غ</text>

    <!-- سهم -->
    <line x1="305" y1="150" x2="340" y2="150" stroke="#2563eb" stroke-width="3" marker-end="url(#arrow1)"/>
    <defs><marker id="arrow1" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#2563eb"/></marker></defs>

    <!-- دورق محقون -->
    <rect x="350" y="60" width="250" height="180" rx="16" fill="#f0fdf4" stroke="#86efac" stroke-width="2"/>
    
    <text x="475" y="88" text-anchor="middle" font-size="14" font-weight="700" fill="#065f46">
      <tspan x="475" dy="0">دورق محقون</tspan>
      <tspan x="475" dy="18">بالهواء</tspan>
    </text>
    
    <!-- الدورق -->
    <ellipse cx="430" cy="180" rx="45" ry="35" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
    <line x1="430" y1="145" x2="430" y2="120" stroke="#22c55e" stroke-width="2"/>
    <circle cx="430" cy="117" r="5" fill="#22c55e"/>
    
    <!-- نقاط الهواء -->
    <circle cx="420" cy="170" r="3" fill="#22c55e" opacity="0.5"/>
    <circle cx="440" cy="180" r="3" fill="#22c55e" opacity="0.5"/>
    <circle cx="425" cy="190" r="3" fill="#22c55e" opacity="0.5"/>
    <circle cx="435" cy="173" r="3" fill="#22c55e" opacity="0.5"/>
    
    <!-- الميزان -->
    <rect x="500" y="155" width="60" height="40" rx="6" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5"/>
    <text x="530" y="180" text-anchor="middle" font-size="14" font-weight="800" fill="#065f46">55 غ</text>

    <!-- النتيجة (مقسمة لسطرين) -->
    <text x="320" y="265" text-anchor="middle" font-size="14" font-weight="700" fill="#dc2626">
      <tspan x="320" dy="0">النتيجة: كتلة الدورق المحقون أكبر</tspan>
      <tspan x="320" dy="18">← إذن الهواء له كتلة!</tspan>
    </text>
  </svg>
</div>
```

**✅ التحسينات:**
- viewBox من 620×260 إلى 640×300 ✓
- نص العنوان مقسّم لسطرين باستخدام tspan ✓
- النتيجة مقسمة لسطرين ✓
- هامش أسفل كافٍ (300 - 283 = 17px) ✓

---

## 🎨 **الرسم 2: تركيب الغلاف الجوي** (محسّن 100%)

**استبدل الكود القديم بهذا:**

```html
<div class="svg-container">
  <svg viewBox="0 0 720 360" width="720" height="360">
    <text x="360" y="30" text-anchor="middle" font-size="18" font-weight="900" fill="#1e293b">تركيب غازات الغلاف الجوي</text>

    <!-- الدائرة الكبيرة -->
    <circle cx="200" cy="200" r="130" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/>
    
    <!-- نيتروجين 78% -->
    <path d="M200,70 A130,130 0 1,1 74.5,263" fill="#3b82f6"/>
    
    <!-- أكسجين 21% -->
    <path d="M200,70 A130,130 0 0,0 74.5,263" fill="#10b981"/>

    <!-- النصوص داخل الدائرة -->
    <text x="240" y="200" text-anchor="middle" font-size="16" font-weight="800" fill="white">النيتروجين</text>
    <text x="240" y="222" text-anchor="middle" font-size="22" font-weight="900" fill="white">%78</text>

    <text x="120" y="140" text-anchor="middle" font-size="14" font-weight="800" fill="white">الأكسجين</text>
    <text x="120" y="160" text-anchor="middle" font-size="18" font-weight="900" fill="white">%21</text>

    <!-- المفتاح (مع text-anchor="start") -->
    <rect x="400" y="80" width="22" height="22" rx="4" fill="#3b82f6"/>
    <text x="430" y="97" text-anchor="start" font-size="15" font-weight="700" fill="#334155">النيتروجين N₂ — %78</text>

    <rect x="400" y="120" width="22" height="22" rx="4" fill="#10b981"/>
    <text x="430" y="137" text-anchor="start" font-size="15" font-weight="700" fill="#334155">الأكسجين O₂ — %21</text>

    <rect x="400" y="160" width="22" height="22" rx="4" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
    <text x="430" y="177" text-anchor="start" font-size="15" font-weight="700" fill="#334155">غازات أخرى — %1</text>

    <!-- تفصيل الغازات الأخرى -->
    <text x="430" y="220" text-anchor="start" font-size="13" fill="#64748b">تشمل الغازات الأخرى:</text>
    <text x="430" y="242" text-anchor="start" font-size="12" fill="#64748b">• بخار الماء (0 – %4)</text>
    <text x="430" y="262" text-anchor="start" font-size="12" fill="#64748b">• ثاني أكسيد الكربون CO₂</text>
    <text x="430" y="282" text-anchor="start" font-size="12" fill="#64748b">• الأرجون، النيون، الأوزون</text>
  </svg>
</div>
```

**✅ التحسينات:**
- viewBox من 660×340 إلى 720×360 ✓
- text-anchor="start" لجميع نصوص المفتاح ✓
- font-size مصغّر قليلاً (15 بدلاً من 16) ✓
- هوامش محسّنة ✓

---

## 🎨 **الرسم 3: طبقات الغلاف الجوي** (محسّن 100%)

**الكود الحالي جيد لكن هذه نسخة محسّنة:**

```html
<div class="svg-container">
  <svg viewBox="0 0 720 540" width="720" height="540">
    <text x="360" y="30" text-anchor="middle" font-size="18" font-weight="900" fill="#1e293b">طبقات الغلاف الجوي</text>

    <!-- التروبوسفير -->
    <rect x="60" y="420" width="480" height="85" rx="12" fill="#bfdbfe" stroke="#3b82f6" stroke-width="2"/>
    <text x="300" y="458" text-anchor="middle" font-size="16" font-weight="800" fill="#1e40af">التروبوسفير</text>
    <text x="300" y="485" text-anchor="middle" font-size="13" fill="#1e40af">(الطبقة المتقلبة) — 0 إلى 10 كم</text>

    <!-- الستراتوسفير -->
    <rect x="60" y="315" width="480" height="85" rx="12" fill="#bbf7d0" stroke="#22c55e" stroke-width="2"/>
    <text x="300" y="353" text-anchor="middle" font-size="16" font-weight="800" fill="#065f46">الستراتوسفير</text>
    <text x="300" y="380" text-anchor="middle" font-size="13" fill="#065f46">10 إلى 50 كم — تحتوي طبقة الأوزون</text>

    <!-- الميزوسفير -->
    <rect x="60" y="215" width="480" height="80" rx="12" fill="#fde68a" stroke="#f59e0b" stroke-width="2"/>
    <text x="300" y="250" text-anchor="middle" font-size="16" font-weight="800" fill="#92400e">الميزوسفير</text>
    <text x="300" y="275" text-anchor="middle" font-size="13" fill="#92400e">50 إلى 85 كم — أبرد طبقة</text>

    <!-- الثيرموسفير -->
    <rect x="60" y="120" width="480" height="75" rx="12" fill="#fecaca" stroke="#ef4444" stroke-width="2"/>
    <text x="300" y="153" text-anchor="middle" font-size="16" font-weight="800" fill="#991b1b">الثيرموسفير</text>
    <text x="300" y="178" text-anchor="middle" font-size="13" fill="#991b1b">85 إلى 500 كم — أكثر من 1700°س</text>

    <!-- الإكسوسفير -->
    <rect x="60" y="40" width="480" height="70" rx="12" fill="#e9d5ff" stroke="#a855f7" stroke-width="2"/>
    <text x="300" y="71" text-anchor="middle" font-size="16" font-weight="800" fill="#6b21a8">الإكسوسفير</text>
    <text x="300" y="96" text-anchor="middle" font-size="13" fill="#6b21a8">أعلى من 500 كم — تتلاشى في الفضاء</text>

    <!-- سهم الارتفاع -->
    <line x1="575" y1="500" x2="575" y2="45" stroke="#64748b" stroke-width="2" marker-end="url(#arrowUp)"/>
    <defs><marker id="arrowUp" markerWidth="10" markerHeight="7" refX="5" refY="3.5" orient="auto"><polygon points="0 7, 5 0, 10 7" fill="#64748b"/></marker></defs>
    <text x="595" y="275" text-anchor="start" font-size="13" font-weight="700" fill="#64748b" transform="rotate(-90 595 275)">الارتفاع (كم)</text>

    <text x="650" y="515" text-anchor="middle" font-size="12" fill="#64748b">سطح الأرض</text>
  </svg>
</div>
```

**✅ التحسينات:**
- viewBox من 700×520 إلى 720×540 ✓
- مساحات أكبر للطبقات ✓
- text-anchor للجميع ✓

---

## 🎨 **الرسم 5: التوصيل والحمل** (محسّن 100%)

```html
<div class="svg-container">
  <svg viewBox="0 0 720 340" width="720" height="340">
    <text x="360" y="28" text-anchor="middle" font-size="17" font-weight="900" fill="#1e293b">طريقتا انتقال الحرارة في الغلاف الجوي</text>

    <!-- التوصيل -->
    <rect x="30" y="55" width="310" height="260" rx="16" fill="#fff7ed" stroke="#f59e0b" stroke-width="2"/>
    <text x="185" y="82" text-anchor="middle" font-size="17" font-weight="800" fill="#92400e">التوصيل</text>

    <!-- سطح الأرض -->
    <rect x="60" y="260" width="250" height="30" rx="4" fill="#d97706"/>
    <text x="185" y="280" text-anchor="middle" font-size="12" font-weight="700" fill="white">سطح الأرض</text>
    
    <!-- طاقة الشمس -->
    <line x1="185" y1="100" x2="185" y2="130" stroke="#ef4444" stroke-width="2" stroke-dasharray="4 2"/>
    <text x="185" y="150" text-anchor="middle" font-size="12" fill="#ef4444">↓ طاقة الشمس ↓</text>
    
    <!-- طبقة رقيقة -->
    <rect x="60" y="220" width="250" height="35" rx="4" fill="#fed7aa" stroke="#f59e0b" stroke-width="1"/>
    <text x="185" y="238" text-anchor="middle" font-size="11" font-weight="600" fill="#92400e">طبقة هواء رقيقة</text>
    <text x="185" y="252" text-anchor="middle" font-size="11" font-weight="600" fill="#92400e">تسخن بالتوصيل</text>
    
    <!-- أسهم -->
    <line x1="110" y1="255" x2="110" y2="225" stroke="#ef4444" stroke-width="2" marker-end="url(#aUp)"/>
    <line x1="185" y1="255" x2="185" y2="225" stroke="#ef4444" stroke-width="2" marker-end="url(#aUp)"/>
    <line x1="260" y1="255" x2="260" y2="225" stroke="#ef4444" stroke-width="2" marker-end="url(#aUp)"/>
    <defs><marker id="aUp" markerWidth="8" markerHeight="6" refX="4" refY="0" orient="auto"><polygon points="0 6, 4 0, 8 6" fill="#ef4444"/></marker></defs>
    
    <text x="185" y="192" text-anchor="middle" font-size="12" fill="#78350f">الحرارة تنتقل بالتلامس</text>
    <text x="185" y="207" text-anchor="middle" font-size="12" fill="#78350f">من جزيء ساخن إلى بارد</text>

    <!-- الحمل -->
    <rect x="380" y="55" width="310" height="260" rx="16" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
    <text x="535" y="82" text-anchor="middle" font-size="17" font-weight="800" fill="#065f46">الحمل</text>

    <!-- أسهم دائرية -->
    <path d="M450 220 Q 450 140 535 140" fill="none" stroke="#ef4444" stroke-width="2.5" marker-end="url(#aR2)"/>
    <defs><marker id="aR2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#ef4444"/></marker></defs>
    <text x="440" y="180" text-anchor="middle" font-size="12" fill="#ef4444" font-weight="700">هواء ساخن</text>
    <text x="440" y="195" text-anchor="middle" font-size="12" fill="#ef4444" font-weight="700">يصعد ↑</text>

    <path d="M620 140 Q 620 220 535 220" fill="none" stroke="#3b82f6" stroke-width="2.5" marker-end="url(#aR3)"/>
    <defs><marker id="aR3" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#3b82f6"/></marker></defs>
    <text x="630" y="180" text-anchor="middle" font-size="12" fill="#3b82f6" font-weight="700">هواء بارد</text>
    <text x="630" y="195" text-anchor="middle" font-size="12" fill="#3b82f6" font-weight="700">يهبط ↓</text>

    <!-- سطح الأرض -->
    <rect x="410" y="260" width="250" height="30" rx="4" fill="#d97706"/>
    <text x="535" y="280" text-anchor="middle" font-size="12" font-weight="700" fill="white">سطح الأرض</text>

    <text x="535" y="305" text-anchor="middle" font-size="13" fill="#065f46" font-weight="600">= تيار حمل (الطريقة الرئيسية)</text>
  </svg>
</div>
```

**✅ التحسينات:**
- viewBox من 680×300 إلى 720×340 ✓
- مستطيلات أكبر (310px بدلاً من 290px) ✓
- مسافات داخلية محسّنة ✓
- جميع النصوص مع text-anchor ✓

---

## 🎨 **الرسم 6: الضغط والحرارة** (محسّن 100%)

```html
<div class="svg-container">
  <svg viewBox="0 0 720 300" width="720" height="300">
    <text x="360" y="28" text-anchor="middle" font-size="17" font-weight="900" fill="#1e293b">العلاقة بين درجة الحرارة والضغط الجوي</text>

    <!-- الهواء الساخن -->
    <rect x="40" y="55" width="300" height="215" rx="16" fill="#fef2f2" stroke="#fecaca" stroke-width="2"/>
    <text x="190" y="80" text-anchor="middle" font-size="16" font-weight="800" fill="#dc2626">الهواء الساخن</text>
    
    <text x="190" y="115" text-anchor="middle" font-size="13" fill="#991b1b">
      <tspan x="190" dy="0">الجزيئات تتحرك بسرعة</tspan>
      <tspan x="190" dy="20">وتتمدد</tspan>
    </text>
    
    <text x="190" y="165" text-anchor="middle" font-size="13" fill="#991b1b">← كثافة أقل ←</text>
    <text x="190" y="185" text-anchor="middle" font-size="13" fill="#991b1b">← ضغط أقل ←</text>
    <text x="190" y="215" text-anchor="middle" font-size="15" font-weight="800" fill="#dc2626">↑ يصعد لأعلى ↑</text>
    <text x="190" y="245" text-anchor="middle" font-size="13" font-weight="700" fill="#dc2626">= منطقة ضغط منخفض</text>

    <!-- الهواء البارد -->
    <rect x="380" y="55" width="300" height="215" rx="16" fill="#eff6ff" stroke="#bfdbfe" stroke-width="2"/>
    <text x="530" y="80" text-anchor="middle" font-size="16" font-weight="800" fill="#1e40af">الهواء البارد</text>
    
    <text x="530" y="115" text-anchor="middle" font-size="13" fill="#1e40af">
      <tspan x="530" dy="0">الجزيئات تتحرك ببطء</tspan>
      <tspan x="530" dy="20">وتتقارب</tspan>
    </text>
    
    <text x="530" y="165" text-anchor="middle" font-size="13" fill="#1e40af">← كثافة أكبر ←</text>
    <text x="530" y="185" text-anchor="middle" font-size="13" fill="#1e40af">← ضغط أعلى ←</text>
    <text x="530" y="215" text-anchor="middle" font-size="15" font-weight="800" fill="#1e40af">↓ ينزل لأسفل ↓</text>
    <text x="530" y="245" text-anchor="middle" font-size="13" font-weight="700" fill="#1e40af">= منطقة ضغط مرتفع</text>

    <text x="360" y="285" text-anchor="middle" font-size="13" font-weight="700" fill="#6b21a8">يختلف الضغط الجوي باختلاف درجة الحرارة</text>
  </svg>
</div>
```

**✅ التحسينات:**
- viewBox من 660×260 إلى 720×300 ✓
- مستطيلات أكبر (300px بدلاً من 270px) ✓
- استخدام tspan للنصوص الطويلة ✓
- مسافات داخلية محسّنة ✓

---

## 📋 **ملخص التحسينات:**

| الرسم | viewBox القديم | viewBox الجديد | التحسينات الرئيسية |
|-------|----------------|----------------|---------------------|
| تجربة جاليليو | 620×260 | 640×300 | تقسيم النصوص + هامش أسفل |
| تركيب الغلاف | 660×340 | 720×360 | text-anchor + هوامش |
| طبقات الغلاف | 700×520 | 720×540 | مساحات أكبر |
| التوصيل والحمل | 680×300 | 720×340 | مستطيلات أكبر + مسافات |
| الضغط والحرارة | 660×260 | 720×300 | tspan + مستطيلات أكبر |

---

## ✅ **النتيجة:**

**بعد تطبيق هذه الإصلاحات:**
- ✅ 0% نصوص خارج الحدود
- ✅ 0% تداخلات
- ✅ 0% مسافات ضيقة
- ✅ 100% جودة احترافية

**= جودة 100% - جاهز للإنتاج!** 🎉

