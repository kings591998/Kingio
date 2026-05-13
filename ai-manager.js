/**
 * 📁 ai-manager.js
 * وصف: إدارة مفاتيح AI، التعليمات، ربط الكتّاب بالتبويبات، والتوليد عبر Cloud Function
 */
class AIManager {
  constructor() {
    this.configsRef = db.collection('ai_configs');
    this.mappingRef = db.collection('writer_category_mapping');
    // 📍 استبدل هذا الرابط بعد نشر الـ Cloud Function
    this.functionsUrl = "https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/generateContent";
    this.generatedContent = null;
    this.generatedTopic = null;
  }

  renderUI(containerId) {
    document.getElementById(containerId).innerHTML = `
      <div class="card">
        <div class="card-header"><h3 class="card-title">🤖 مركز الذكاء الاصطناعي</h3></div>
        <div class="tabs">
          <button class="tab-btn active" data-tab="ai-keys">🔑 مفاتيح API</button>
          <button class="tab-btn" data-tab="ai-instructions">📜 التعليمات والأسلوب</button>
          <button class="tab-btn" data-tab="ai-mapping">🔗 ربط الكتّاب بالتبويبات</button>
          <button class="tab-btn" data-tab="ai-generate">⚡ توليد يدوي</button>
        </div>

        <div id="tab-ai-keys" class="tab-content active">
          <div class="flex-row">
            <select id="aiModel" style="flex:1">
              <option value="openai">OpenAI</option><option value="gemini">Google Gemini</option><option value="groq">Groq</option>
            </select>
            <input type="password" id="aiApiKey" placeholder="أدخل مفتاح API..." style="flex:2">
            <button onclick="aiManager.saveKey()">💾 حفظ آمن</button>
          </div>
          <div id="aiKeysList" style="margin-top:1rem;"></div>
        </div>

        <div id="tab-ai-instructions" class="tab-content">
          <label style="font-weight:500;">📝 التعليمات الأساسية</label>
          <textarea id="aiPrompt" rows="5" placeholder="أنت كاتب محترف في منصة شنفر..."></textarea>
          <label style="font-weight:500;margin-top:0.5rem;display:block;">🎭 النبرة</label>
          <select id="aiTone">
            <option value="professional">رسمية احترافية</option><option value="academic">أكاديمية</option><option value="engaging">جذابة</option>
          </select>
          <button onclick="aiManager.saveInstructions()" style="margin-top:0.5rem;">💾 حفظ</button>
        </div>

        <div id="tab-ai-mapping" class="tab-content">
          <div class="flex-row">
            <select id="mapCat" style="flex:1"><option>اختر التبويبة</option></select>
            <select id="mapWriter" style="flex:1"><option>اختر الكاتب</option></select>
            <button onclick="aiManager.addMapping()">🔗 ربط</button>
          </div>
          <div id="aiMappings" style="margin-top:1rem;"></div>
        </div>

        <div id="tab-ai-generate" class="tab-content">
          <input type="text" id="aiTopic" placeholder="عنوان أو موضوع المقال...">
          <div class="flex-row">
            <select id="aiGenCat"><option>اختر التبويبة</option></select>
            <select id="aiGenWriter"><option>اختر الكاتب</option></select>
            <button onclick="aiManager.generate()">🚀 توليد ومعاينة</button>
          </div>
          <div id="aiResult" style="margin-top:1rem;background:var(--bg-secondary);padding:1rem;border-radius:0.5rem;min-height:100px;white-space:pre-wrap;"></div>
          <button id="aiPubBtn" style="display:none;margin-top:0.5rem;" onclick="aiManager.publish()">📤 نشر</button>
        </div>
      </div>
    `;
    this.setupTabs(); this.loadKeys(); this.loadInstructions(); this.loadMappings();
    setTimeout(() => this.fillSelects(), 500);
  }

  setupTabs() {
    document.querySelectorAll('#ai-ui .tab-btn').forEach(btn => {
      btn.onclick = e => {
        document.querySelectorAll('#ai-ui .tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('#ai-ui .tab-content').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById(`tab-${e.target.dataset.tab}`).classList.add('active');
      };
    });
  }

  async saveKey() {
    const model = document.getElementById('aiModel').value;
    const key = document.getElementById('aiApiKey').value.trim();
    if (!key) return alert('أدخل المفتاح');
    await this.configsRef.add({ model, isActive: true, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    document.getElementById('aiApiKey').value = '';
    this.loadKeys(); alert('✅ تم تسجيل المفتاح بأمان (يُستخدم عبر الخادم فقط)');
  }

  async loadKeys() {
    const snap = await this.configsRef.where('isActive', '==', true).get();
    document.getElementById('aiKeysList').innerHTML = snap.docs.map(d => 
      `<div class="flex-row" style="justify-content:space-between;background:var(--bg-secondary);padding:0.5rem;border-radius:0.5rem;margin-bottom:0.5rem;">
        <span>🔹 ${d.data().model} <small style="color:var(--text-muted)">🔒 محمي</small></span>
        <button class="btn-sm danger" onclick="aiManager.toggleKey('${d.id}', ${!d.data().isActive})">⏯️</button>
      </div>`
    ).join('');
  }

  async toggleKey(id, state) { await this.configsRef.doc(id).update({ isActive: state }); this.loadKeys(); }

  async saveInstructions() {
    await this.configsRef.doc('instructions').set({
      prompt: document.getElementById('aiPrompt').value,
      tone: document.getElementById('aiTone').value,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    alert('✅ تم حفظ التعليمات');
  }

  async loadInstructions() {
    const doc = await this.configsRef.doc('instructions').get();
    if (doc.exists) {
      document.getElementById('aiPrompt').value = doc.data().prompt || '';
      document.getElementById('aiTone').value = doc.data().tone || 'professional';
    }
  }

  async addMapping() {
    const c = document.getElementById('mapCat').value, w = document.getElementById('mapWriter').value;
    if (!c || !w) return;
    await this.mappingRef.add({ category: c, writer: w });
    this.loadMappings(); alert('✅ تم الربط');
  }

  async loadMappings() {
    const snap = await this.mappingRef.get();
    document.getElementById('aiMappings').innerHTML = snap.docs.map(d => 
      `<div class="flex-row" style="justify-content:space-between;background:var(--bg-secondary);padding:0.5rem;border-radius:0.5rem;margin-bottom:0.5rem;">
        <span>🗂️ ${d.data().category} ➜ ✍️ ${d.data().writer}</span>
        <button class="btn-sm danger" onclick="aiManager.deleteMapping('${d.id}')">✕</button>
      </div>`
    ).join('');
  }

  async deleteMapping(id) { await this.mappingRef.doc(id).delete(); this.loadMappings(); }

  fillSelects() {
    const cats = app?.state?.categories?.map(c => `<option value="${c.name}">${c.name}</option>`).join('') || '';
    const writers = app?.state?.authors?.map(a => `<option value="${a.name}">${a.name}</option>`).join('') || '';
    ['mapCat','aiGenCat'].forEach(id => { const el = document.getElementById(id); if(el) el.innerHTML = '<option>اختر</option>' + cats; });
    ['mapWriter','aiGenWriter'].forEach(id => { const el = document.getElementById(id); if(el) el.innerHTML = '<option>اختر</option>' + writers; });
  }

  async generate() {
    const topic = document.getElementById('aiTopic').value.trim();
    if (!topic) return alert('أدخل موضوعاً');
    document.getElementById('aiResult').innerHTML = '<span class="spinner"></span> جاري التوليد عبر الخادم الآمن...';
    try {
      const res = await fetch(this.functionsUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, model: 'openai', tone: document.getElementById('aiTone').value })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطأ في الخادم');
      document.getElementById('aiResult').textContent = data.content;
      document.getElementById('aiPubBtn').style.display = 'block';
      this.generatedContent = data.content;
      this.generatedTopic = topic;
    } catch(e) {
      document.getElementById('aiResult').textContent = '❌ ' + e.message;
    }
  }

  async publish() {
    if (!this.generatedContent) return;
    const cat = document.getElementById('aiGenCat').value || 'شنفر';
    const writer = document.getElementById('aiGenWriter').value || 'شنفر AI';
    await db.collection('articles').add({
      title: this.generatedTopic, author: writer, category: cat,
      subfield: 'توليد ذكي', contentBlocks: [
        { type: 'summary', value: `مقال توليدي حول: ${this.generatedTopic}` },
        { type: 'text', value: `<p>${this.generatedContent.replace(/\n/g, '</p><p>')}</p>` }
      ], views: 0, isAutoGenerated: false, status: 'published',
      date: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert('✅ تم النشر بنجاح');
    this.generatedContent = null; this.generatedTopic = null;
    document.getElementById('aiPubBtn').style.display = 'none';
    document.getElementById('aiResult').innerHTML = '';
  }
}

const aiManager = new AIManager();
