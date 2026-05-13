/**
 * 📁 auto-publisher.js
 * وصف: واجهة جدولة النشر، ربط بـ Cloud Scheduler، إدارة الصور
 */
class AutoPublisher {
  constructor() { this.scheduleRef = db.collection('auto_schedules'); }

  renderUI(containerId) {
    document.getElementById(containerId).innerHTML = `
      <div class="card">
        <div class="card-header"><h3 class="card-title">🤖 النشر التلقائي</h3></div>
        <div class="grid grid-2">
          <div>
            <label>عدد المرات يومياً</label>
            <input type="number" id="pubFreq" value="2" min="1" max="10">
            <label>التبويبة المستهدفة</label>
            <select id="pubCat"><option>شنفر (تلقائي)</option></select>
            <label>كلمات مفتاحية</label>
            <input type="text" id="pubTopics" placeholder="أعمال, تقنية, صحة">
            <button onclick="autoPub.save()" style="width:100%;margin-top:0.5rem;">💾 حفظ</button>
          </div>
          <div>
            <label>🖼️ الصور</label>
            <label><input type="checkbox" id="pubImg" checked> جلب صور من Unsplash</label>
            <select id="pubImgStyle" style="margin-top:0.5rem;">
              <option value="technology">تقني</option><option value="abstract">تجريدي</option>
            </select>
          </div>
        </div>
        <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border-color);display:flex;align-items:center;gap:1rem;">
          <button class="outline btn-sm" id="pubToggle" onclick="autoPub.toggle()">🟡 تفعيل الجدولة</button>
          <span id="pubStatus" style="color:var(--text-muted);">غير نشط</span>
        </div>
      </div>
    `;
    this.load();
  }

  async save() {
    await this.scheduleRef.doc('main').set({
      freq: parseInt(document.getElementById('pubFreq').value),
      category: document.getElementById('pubCat').value,
      topics: document.getElementById('pubTopics').value,
      useImg: document.getElementById('pubImg').checked,
      imgStyle: document.getElementById('pubImgStyle').value,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    alert('✅ تم حفظ الإعدادات');
  }

  async load() {
    const doc = await this.scheduleRef.doc('main').get();
    if (doc.exists) {
      document.getElementById('pubFreq').value = doc.data().freq || 2;
      document.getElementById('pubTopics').value = doc.data().topics || '';
    }
    setTimeout(() => {
      const sel = document.getElementById('pubCat');
      sel.innerHTML = '<option value="شنفر">شنفر (تلقائي)</option>' + 
        (app?.state?.categories?.map(c => `<option value="${c.name}">${c.name}</option>`).join('') || '');
    }, 300);
  }

  async toggle() {
    const doc = await this.scheduleRef.doc('main').get();
    const isActive = !(doc.data()?.active);
    await this.scheduleRef.doc('main').set({ active: isActive }, { merge: true });
    document.getElementById('pubToggle').innerHTML = isActive ? '🔴 إيقاف' : '🟡 تفعيل';
    document.getElementById('pubStatus').textContent = isActive ? '🟢 نشط (Cloud Scheduler)' : 'غير نشط';
    document.getElementById('pubStatus').style.color = isActive ? 'var(--success)' : 'var(--text-muted)';
  }
}

const autoPub = new AutoPublisher();
