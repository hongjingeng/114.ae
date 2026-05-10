// js/email.js - 完整迁移
let currentService = 'mailtm';
let currentAccount = { address: "", token: "" };
let duckToken = null;
let pollTimer = null;

const MAILTM_API = "https://api.mail.tm";
const DUCK_EMAIL = "wM6v6WSM6s@duckmail.sbs";
const DUCK_PASSWORD = "xPN8sSjcvb7V";

window.initEmail = function() {
    const html = `
    <div id="email-content">
        <div class="search-header">
            <div class="avatar-wrapper"><div class="avatar">🛸</div></div>
            <h1>114.ae 临时邮箱</h1>
            <p class="sub">支持验证码 · 多服务切换</p>
            <select id="emailServiceSelect" onchange="switchEmailService()" style="padding:10px 18px;border-radius:50px;border:2px solid var(--accent-color);">
                <option value="mailtm">Mail.tm（推荐）</option>
                <option value="duckmail">DuckMail</option>
            </select>
            <div id="addr" class="mail-display">正在生成邮箱...</div>
            <div class="btn-group">
                <button onclick="copyMail()" class="btn btn-s">📋 复制地址</button>
                <button onclick="initEmail()" class="btn btn-p">🔄 换新地址</button>
            </div>
        </div>
        <div class="results-container">
            <div class="results-title">📥 实时收件箱</div>
            <div id="list"><div style="padding:60px;text-align:center;">等待邮件...</div></div>
        </div>
    </div>`;
    document.getElementById('contentContainer').innerHTML = html;
    initCurrentEmailService();
};

window.switchEmailService = function() {
    currentService = document.getElementById('emailServiceSelect').value;
    initCurrentEmailService();
};

async function initCurrentEmailService() {
    if (pollTimer) clearInterval(pollTimer);
    if (currentService === 'mailtm') await initMailTM();
    else await initDuckMail();
}

async function initMailTM() {
    const addrEl = document.getElementById('addr');
    addrEl.innerText = "生成中...";
    try {
        const domRes = await fetch(`${MAILTM_API}/domains`);
        const doms = await domRes.json();
        const domain = doms['hydra:member'][0].domain;
        const user = Math.random().toString(36).substring(2,12);
        const pass = Math.random().toString(36).substring(2,15)+"A1";
        const address = `${user}@${domain}`;

        await fetch(`${MAILTM_API}/accounts`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({address, password:pass})});
        const tokenRes = await fetch(`${MAILTM_API}/token`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({address, password:pass})});
        const tokenData = await tokenRes.json();
        currentAccount = {address, token: tokenData.token};
        addrEl.innerText = address;
        pollTimer = setInterval(fetchMailTMMessages, 5000);
    } catch(e) {
        addrEl.innerText = "生成失败";
    }
}

async function fetchMailTMMessages() {
    if (!currentAccount.token) return;
    try {
        const res = await fetch(`${MAILTM_API}/messages`, {headers: {'Authorization': `Bearer ${currentAccount.token}`}});
        const data = await res.json();
        const msgs = data['hydra:member'] || [];
        document.getElementById('list').innerHTML = msgs.map(m => `
            <div class="msg-item" onclick="readMail('${m.id}', '${escapeHtml(m.subject||'无主题')}')">
                <div class="msg-meta">${new Date(m.createdAt).toLocaleString()}</div>
                <div class="msg-subject">${escapeHtml(m.subject||'无主题')}</div>
            </div>
        `).join('');
    } catch(e) {}
}

window.readMail = async function(id, subject) {
    alert(`邮件：${subject}\n\n详情查看控制台或扩展弹窗`);
};

async function initDuckMail() {
    document.getElementById('addr').innerText = DUCK_EMAIL;
}

window.copyMail = function() {
    const val = document.getElementById('addr').innerText;
    navigator.clipboard.writeText(val).then(() => alert('已复制'));
};

function escapeHtml(str) {
    return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
}
