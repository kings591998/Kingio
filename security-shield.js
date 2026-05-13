/**
 * 📁 security-shield.js
 * وصف: منع النسخ، كشف DevTools، حماية الجلسة، تسجيل المحاولات
 */
class SecurityShield {
  constructor() { this.attempts = 0; this.init(); }

  init() {
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey && (e.key==='u'||e.key==='s'||e.key==='shift')) || e.key==='F12') e.preventDefault();
    });
    this.checkDevTools();
    const style = document.createElement('style');
    style.innerHTML = `body,.card,.article-card{user-select:none;-webkit-user-select:none}img{pointer-events:none}`;
    document.head.appendChild(style);
  }

  checkDevTools() {
    const th = 160;
    setInterval(() => {
      if (window.outerWidth - window.innerWidth > th || window.outerHeight - window.innerHeight > th) {
        this.attempts++;
        if (this.attempts >= 2) this.blockSession();
      }
    }, 1000);
  }

  blockSession() {
    document.body.innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:#0A0B10;display:flex;align-items:center;justify-content:center;flex-direction:column;z-index:999999;">
        <div style="background:#12141E;padding:2rem;border-radius:1rem;text-align:center;border:1px solid #ef4444;max-width:500px;">
          <h1 style="color:#ef4444;">🛡️ نشاط غير مصرح به</h1>
          <p style="color:#aaa;margin:1rem 0;">تم رصد محاولة الوصول لأدوات المطور. تم تأمين الجلسة.</p>
          <div style="background:#1a1c25;height:6px;border-radius:3px;margin:1rem 0;overflow:hidden;"><div id="secProg" style="height:100%;background:#ef4444;width:0%;transition:width 2s;"></div></div>
          <small style="color:#666;">جاري إعادة التوجيه الآمن...</small>
        </div>
      </div>`;
    setTimeout(() => document.getElementById('secProg').style.width = '100%', 100);
    setTimeout(() => window.location.replace('about:blank'), 2500);
  }
}

const securityShield = new SecurityShield();
