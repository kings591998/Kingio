/**
 * 📁 monetization.js
 * وصف: إدارة عناوين الدفع (Binance, PayPal, BTC...) وخطط الاشتراك
 */
class MonetizationManager {
  constructor() { this.payRef = db.collection('payment_methods'); this.planRef = db.collection('subscription_plans'); }

  renderUI(containerId) {
    document.getElementById(containerId).innerHTML = `
      <div class="card">
        <div class="card-header"><h3 class="card-title">💎 الربحية والدفع</h3></div>
        <div class="tabs">
          <button class="tab-btn active" data-tab="mon-pay">💳 بوابات الدفع</button>
          <button class="tab-btn" data-tab="mon-subs">📦 خطط الاشتراك</button>
        </div>
        <div id="tab-mon-pay" class="tab-content active">
          <div class="flex-row">
            <select id="payPlat" style="flex:1">
              <option value="binance">Binance</option><option value="paypal">PayPal</option>
              <option value="bitcoin">Bitcoin (BTC)</option><option value="ethereum">Ethereum (ETH)</option>
              <option value="usdt">USDT (TRC20)</option><option value="custom">أخرى</option>
            </select>
            <input type="text" id="payAddr" placeholder="العنوان / البريد / رابط الدفع" style="flex:2">
            <button onclick="monManager.addPay()">➕ حفظ</button>
          </div>
          <div id="payList" style="margin-top:1rem;"></div>
        </div>
        <div id="tab-mon-subs" class="tab-content">
          <div class="flex-row">
            <input type="text" id="subName" placeholder="اسم الخطة" style="flex:1">
            <input type="number" id="subPrice" placeholder="السعر" style="flex:1">
            <input type="text" id="subCurr" value="USD" style="flex:0.5">
            <button onclick="monManager.addPlan()">➕ إضافة</button>
          </div>
          <div id="planList" style="margin-top:1rem;"></div>
        </div>
      </div>
    `;
    this.setupTabs(); this.loadPays(); this.loadPlans();
  }

  setupTabs() {
    document.querySelectorAll('#mon-ui .tab-btn').forEach(btn => {
      btn.onclick = e => {
        document.querySelectorAll('#mon-ui .tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('#mon-ui .tab-content').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById(`tab-${e.target.dataset.tab}`).classList.add('active');
      };
    });
  }

  async addPay() {
    const p = document.getElementById('payPlat').value, a = document.getElementById('payAddr').value.trim();
    if (!a) return alert('أدخل العنوان');
    await this.payRef.add({ platform: p, address: a, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    document.getElementById('payAddr').value = ''; this.loadPays(); alert('✅ تمت الإضافة');
  }

  async loadPays() {
    const snap = await this.payRef.get();
    document.getElementById('payList').innerHTML = snap.docs.map(d => 
      `<div class="flex-row" style="justify-content:space-between;background:var(--bg-secondary);padding:0.5rem;border-radius:0.5rem;margin-bottom:0.5rem;">
        <span>🔹 ${d.data().platform} <code>${d.data().address.slice(0,10)}...</code></span>
        <button class="btn-sm danger" onclick="monManager.delPay('${d.id}')">🗑️</button>
      </div>`
    ).join('');
  }
  async delPay(id) { await this.payRef.doc(id).delete(); this.loadPays(); }

  async addPlan() {
    const n = document.getElementById('subName').value, p = document.getElementById('subPrice').value, c = document.getElementById('subCurr').value;
    if (!n || !p) return;
    await this.planRef.add({ name: n, price: parseFloat(p), currency: c, active: true });
    this.loadPlans(); alert('✅ تمت إضافة الخطة');
  }

  async loadPlans() {
    const snap = await this.planRef.get();
    document.getElementById('planList').innerHTML = snap.docs.map(d => 
      `<div class="flex-row" style="justify-content:space-between;background:var(--bg-secondary);padding:0.5rem;border-radius:0.5rem;margin-bottom:0.5rem;">
        <span>📦 ${d.data().name} - <strong>${d.data().price} ${d.data().currency}</strong></span>
        <button class="btn-sm danger" onclick="monManager.delPlan('${d.id}')">🗑️</button>
      </div>`
    ).join('');
  }
  async delPlan(id) { await this.planRef.doc(id).delete(); this.loadPlans(); }
}

const monManager = new MonetizationManager();
