# أمر واحد عبر SSH لمعرفة أين تُحفظ البيانات على السيرفر

**افتح اتصال SSH بالسيرفر، ثم انسخ والصق الكتلة التالية كاملة ثم اضغط Enter.**

```bash
echo "=== 1) Current dir and HOME ==="
pwd
echo "HOME=$HOME"

echo ""
echo "=== 2) Dir structure under home ==="
ls -la ~/
ls -la ~/../ 2>/dev/null || true

echo ""
echo "=== 3) Where is public_html and its contents? ==="
find $HOME /home -maxdepth 5 -type d -name "public_html" 2>/dev/null
for d in $(find $HOME /home -maxdepth 5 -type d -name "public_html" 2>/dev/null); do
  echo "--- contents of: $d ---"
  ls -la "$d" 2>/dev/null | head -25
done

echo ""
echo "=== 4) Where is git_repo or repo folder? ==="
find $HOME /home -maxdepth 5 -type d -name "git_repo" 2>/dev/null
for d in $(find $HOME /home -maxdepth 5 -type d -name "git_repo" 2>/dev/null); do
  echo "--- contents of: $d ---"
  ls -la "$d" 2>/dev/null | head -20
  if [ -d "$d/.git" ]; then
    echo "last commit:"
    (cd "$d" && git log -1 --oneline 2>/dev/null)
  fi
done

echo ""
echo "=== 5) Where is index.html (site root)? ==="
find $HOME /home -maxdepth 6 -name "index.html" -type f 2>/dev/null | head -15

echo ""
echo "=== 6) Apache DocumentRoot (if any) ==="
grep -r "DocumentRoot" /etc/apache2/ /usr/local/apache/conf/ 2>/dev/null | grep -v "#" | head -5

echo ""
echo "=== DONE - copy all output above and send it ==="
```

---

## ماذا ستفعل بعد ذلك؟

- **لا** سأعدل أي مجلد أو سكربت نشر في المشروع المحلي حتى أرى **خرج هذا الأمر**.
- بعد أن ترسل لي الخرج (أو تلصقه هنا)، سأحدد:
  1. **المسار الفعلي** الذي يخدم منه الموقع (جذر الويب).
  2. **المسار الفعلي** الذي فيه كود Git (إن وُجد).
  3. التعديل الوحيد المطلوب: ربط المحلي → GitHub → هذا المسار بالضبط، بحيث أي تعديل عندك ينعكس في GitHub ثم على السيرفر ثم على الموقع.

انسخ الخرج كاملاً من الطرفية بعد تشغيل الأمر وأرسله هنا.
