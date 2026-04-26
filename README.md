# حاسبة الذهب والفضة - دليل التطوير

هذا المشروع مبني باستخدام React + Vite.

## التشغيل المحلي (على جهازك)
1. تأكد من تثبيت [Node.js](https://nodejs.org/).
2. افتح المجلد في **Microsoft Visual Studio** (Open Folder).
3. افتح الـ Terminal ونفذ:
   ```bash
   npm install
   npm run dev
   ```

## التحويل إلى تطبيق موبايل (Mobile App)
لتحويل هذا الكود إلى تطبيق موبايل باستخدام **Capacitor**:

1. قم بتثبيت Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init
   ```
2. أضف المنصات (Android/iOS):
   ```bash
   npm install @capacitor/android @capacitor/ios
   npx cap add android
   npx cap add ios
   ```
3. بعد كل تعديل في الكود، قم ببناء المشروع ومزامنته للحصول على نسخة الموبايل:
   ```bash
   npm run build
   npx cap copy
   npx cap open android
   ```

## ملاحظة لمستخدمي Microsoft Visual Studio
يمكنك استخدام إضافات "Node.js tool for Visual Studio" لتسهيل إدارة المكتبات والتشغيل من داخل واجهة البرنامج مباشرة.
