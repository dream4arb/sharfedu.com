# 🚨 تعديلات جديدة إلزامية — فبراير 2026

> **أضف هذه القواعد إلى ملف INSTRUCTIONS-للجلسة-القادمة.md الموجود في مشروعك**

---

## 1️⃣ الهيدر (Hero) — بدون سطر فرعي وبدون أيقونة

```html
<!-- ❌ ممنوع -->
<h1>📚 عنوان الدرس</h1>
<p class="hsub">الدرس الثاني - العلوم</p>
<div class="hero-badge">📚 منصة شارف التعليمية</div>

<!-- ✅ المطلوب -->
<h1>عنوان الدرس</h1>
<div class="hero-badge">📚 منصة شارف التعليمية</div>
```

**القواعد:**
- ❌ لا أيقونة emoji في عنوان h1
- ❌ لا سطر فرعي (hsub) نهائيًا — احذف العنصر بالكامل
- ✅ فقط: اسم الدرس بدون زخرفة + بادج "منصة شارف التعليمية"

---

## 2️⃣ الأسئلة — إظهار الإجابة الصحيحة بالأخضر عند الخطأ

**🔴 إلزامي:** عند اختيار إجابة خاطئة → الخاطئة بالأحمر ❌ + الصحيحة بالأخضر ✅

```javascript
} else {
    event.target.classList.add('wrong');
    wrongAnswers++;
    // إظهار الإجابة الصحيحة فقط باللون الأخضر
    buttons.forEach(btn => {
      if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes('true)')) {
        btn.classList.add('correct');
      }
    });
    expDiv.textContent = explanations[exerciseNum].wrong;
    expDiv.classList.add('show', 'wrong-exp');
}
```

---

## 3️⃣ الآيات القرآنية — لا تحذفها أبدًا!

إذا احتوى PDF المصدر على آية قرآنية يجب تضمينها بهذا التنسيق:

```html
<div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px solid #86efac; border-radius: 16px; padding: 25px; margin-top: 20px; text-align: center;">
  <p style="font-size: 20px; line-height: 2.2; color: #14532d; font-weight: 700;">
    ﴿ نص الآية ﴾
  </p>
  <p style="font-size: 16px; color: #166534; font-weight: 800; margin-top: 10px;">📖 اسم السورة: رقم الآية</p>
</div>
```

---

## 4️⃣ 🚨 قاعدة BOM — إلزامية لمنع تشوّه النصوص العربية!

**المشكلة:** فتح ملف HTML محليًا → المتصفح لا يكتشف UTF-8 → حروف مشوّهة

**الحل الإلزامي:** بعد إنشاء أي ملف HTML، نفّذ هذا الأمر:

```python
python3 -c "
with open('FILENAME.html', 'rb') as f:
    content = f.read()
if not content.startswith(b'\xef\xbb\xbf'):
    content = b'\xef\xbb\xbf' + content
    with open('FILENAME.html', 'wb') as f:
        f.write(content)
    print('BOM added!')
"
```

**🔴 بدون هذا الأمر = نصوص مشوّهة في المتصفح!**

---

## 5️⃣ الملفات المرجعية (5 ملفات الآن)

```
✅ khalafaa-rashidoon-FINAL.html  (درس دراسات)
✅ youve-got-mail-english.html    (درس إنجليزي)
✅ zawaya-almudallae.html         (درس رياضيات)
✅ الغلاف-الجوي-والطقس.html      (درس علوم 1)
✅ الكتل-والجبهات-الهوائية.html   (درس علوم 2) ← جديد!
```

---

## 6️⃣ ملاحظة مهمة حول ترميز الملفات

**عند نسخ ملفات HTML عربية بين الأنظمة، قد يحدث تشوّه في الترميز (Double Encoding).**

**العلامات:**
- ظهور حروف مثل `Ø§Ù„` بدلاً من `ال`
- ظهور `ðŸ"š` بدلاً من 📚

**الوقاية:**
- تأكد دائمًا أن `<meta charset="UTF-8">` موجود في أول سطر بعد `<head>`
- أضف BOM (انظر القاعدة 4)
- لا تنسخ ملفات HTML من أنظمة مختلفة الترميز

---

---

## 7️⃣ 🇬🇧 تنسيق دروس اللغة الإنجليزية — قواعد جديدة

### الهيكل المطلوب:

| العنصر | التنسيق |
|---|---|
| المفردات | `content-box` واحد يحتوي جداول المفردات |
| عنوان القواعد | `h2` كبير (32px) بين الصناديق |
| كل قاعدة نحوية | `content-box` **مستقل** (ليس داخل صندوق آخر) |
| صندوق القاعدة | خلفية تدرج + أيقونة 💡 + الصيغة في مربع أبيض |
| مقارنة خطأ/صح | شبكة `grid 1fr 1fr` (أحمر ❌ وأخضر ✅) |
| الأمثلة | صناديق بحدود يمنى ملونة + إيموجي + ترجمة عربية |

### ❌ ممنوع في دروس الإنجليزي:
- ❌ وضع جميع القواعد داخل صندوق واحد (كل قاعدة منفصلة)
- ❌ عناوين بدون صناديق (كل عنوان داخل `content-box`)
- ❌ استخدام `laws-section` (استخدم `content-box` بدلاً منها)

### ✅ الملف المرجعي:
```
youve-got-mail-english.html ← انسخ تنسيقه لكل درس إنجليزي
```

---
