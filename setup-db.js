/**
 * 📁 setup-db.js
 * وصف: إنشاء المجموعات والوثائق الأساسية تلقائياً عند دخول الأدمن لأول مرة
 * يعمل بشكل آمن (Idempotent) ولا يمسح البيانات الموجودة
 */
class DatabaseInitializer {
  constructor() {
    this.isInitialized = localStorage.getItem('db_setup_done') === 'true';
  }

  async run() {
    if (this.isInitialized) return;
    console.log('🛠️ جاري تهيئة قاعدة البيانات التلقائية...');
    
    try {
      // 1️⃣ إنشاء تصنيف "شنفر" افتراضي
      await db.collection('categories').doc('shanfar').set({
        name: 'شنفر',
        subfields: ['توليد ذكي', 'تقني', 'أعمال'],
        description: 'مقالات منشأة بواسطة الذكاء الاصطناعي',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // 2️⃣ إنشاء تعليمات الذكاء الاصطناعي الافتراضية
      await db.collection('ai_configs').doc('instructions').set({
        prompt: 'أنت كاتب محترف في منصة شنفر. اتبع أسلوباً رسمياً دقيقاً، تجنب الحشو، أدرج أمثلة عملية، ونظم المحتوى بعناوين فرعية.',
        tone: 'professional',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // 3️⃣ إنشاء إعدادات النشر التلقائي
      await db.collection('auto_schedules').doc('main').set({
        freq: 2,
        category: 'شنفر',
        topics: 'تقنية, أعمال, ذكاء اصطناعي, تسويق',
        useImg: true,
        imgStyle: 'technology',
        active: false,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // 4️⃣ إنشاء وثيقة نظام الإعدادات
      await db.collection('system').doc('setup').set({
        dbVersion: '1.0',
        setupAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // حفظ العلامة محلياً لمنع التكرار
      localStorage.setItem('db_setup_done', 'true');
      console.log('✅ تم تهيئة قاعدة البيانات بنجاح');
      
    } catch (error) {
      console.error('❌ خطأ في التهيئة:', error);
    }
  }
}

// تشغيل التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  const initializer = new DatabaseInitializer();
  initializer.run();
});
