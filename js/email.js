// js/email.js
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
            <h1>114.ae跨境</h1>
            <p class="sub">临时邮箱 · 支持验证码 · 多服务切换</p>
            
            <div style="margin:15px 0;">
                <select id="emailServiceSelect" onchange="switchEmailService()" style="padding:10px 18px;border-radius:50px;border:2px solid var(--accent-color);background:var(--card-bg);">
                    <option value="mailtm">Mail.tm（推荐·稳定）</option>
                    <option value="duckmail">DuckMail（duckmail.sbs）</option>
                </select>
            </div>

            <div id="addr" class="mail-display">正在自动生成邮箱...</div>
            
            <div class="btn-group">
                <button onclick="copyMail()" class="btn btn-s">📋 复制地址</button>
                <button onclick="initEmail()" class="btn btn-p">🔄 更换地址</button>
            </div>
        </div>
        <div class="results-container">
            <div class="results-title">📥 实时收件箱</div>
            <div id="list">
                <div style="text-align: center; padding: 60px; color: var(--text-secondary);">等待邮件推送中...</div>
            </div>
        </div>
    </div>`;

    document.getElementById('contentContainer').innerHTML = html;
    initCurrentEmailService();
};

window.switchEmailService = function() {
    currentService = document.getElementById('emailServiceSelect').value;
    document.getElementById('list').innerHTML = '<div style="text-align: center; padding: 60px; color: var(--text-secondary);">切换服务中...</div>';
    initCurrentEmailService();
};

window.initCurrentEmailService = function() {
    if (pollTimer) clearInterval(pollTimer);
    if (currentService === 'mailtm') initMailTM();
    else if (currentService === 'duckmail') initDuckMail();
};

async function initMailTM() {
    const addrEl = document.getElementById('addr');
    addrEl.innerText = "⚡ 生成 Mail.tm 邮箱...";
    try {
        const domRes = await fetch(`${MAILTM_API}/domains`);
        const doms = await domRes.json();
        const domain = doms['hydra:member'][0].domain;
        const user = Math.random().toString(36).substring(2, 12);
        const pass = Math.random().toString(36).substring(2, 15) + "A1";
        const address = `${user}@${domain}`;

        await fetch(`${MAILTM_API}/accounts`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({address, password: pass})
        });

        const tokenRes = await fetch(`${MAILTM_API}/token`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({address, password: pass})
        });
        const tokenData = await tokenRes.json();
        currentAccount = {address, token: tokenData.token};

        addrEl.innerText = currentAccount.address;
        document.getElementById('list').innerHTML = '<div style="text-align: center; padding: 60px; color: var(--text-secondary);">🚀 Mail.tm 已就绪，正在监听...</div>';
        pollTimer = setInterval(fetchMailTMMessages, 5000);
    } catch(e) {
        addrEl.innerText = "❌ Mail.tm 生成失败，请重试";
    }
}

async function fetchMailTMMessages() {
    if (!currentAccount.token) return;
    try {
        const res = await fetch(`${MAILTM_API}/messages`, {
            headers: {'Authorization': `Bearer ${currentAccount.token}`}
        });
        const data = await res.json();
        const msgs = data['hydra:member'] || [];
        const listEl = document.getElementById('list');
        if (msgs.length === 0) {
            listEl.innerHTML = '<div style="text-align: center; padding: 60px; color: var(--text-secondary);">暂无新邮件...</div>';
            return;
        }
        listEl.innerHTML = msgs.map(m => `
            <div class="msg-item" onclick="readMail('${m.id}', '${escapeHtml(m.subject || '无主题')}')">
                <div class="msg-meta">来自: ${escapeHtml(m.from ? m.from.address : '未知')} | ${new Date(m.createdAt).toLocaleTimeString('zh-CN')}</div>
                <div class="msg-subject">${escapeHtml(m.subject || '（无主题）')}</div>
            </div>
        `).join('');
    } catch(e) {}
}

window.readMail = async function(id, subject) {
    const modal = document.getElementById('mailModal');
    const mBody = document.getElementById('modalBody');
    const mSub = document.getElementById('modalSubject');
    mSub.innerText = subject;
    mBody.innerHTML = '加载详情中...';
    modal.style.display = 'flex';
    try {
        const res = await fetch(`${MAILTM_API}/messages/${id}`, {
            headers: {'Authorization': `Bearer ${currentAccount.token}`}
        });
        const data = await res.json();
        mBody.innerHTML = data.html || `<pre style="white-space:pre-wrap; font-family: monospace;">${data.text || '无正文'}</pre>`;
    } catch(e) {
        mBody.innerHTML = '加载失败，请稍后重试';
    }
};

async function initDuckMail() {
    const addrEl = document.getElementById('addr');
    addrEl.innerText = DUCK_EMAIL;
    document.getElementById('list').innerHTML = '<div style="text-align: center; padding: 60px; color: var(--text-secondary);">🚀 DuckMail 已就绪，正在监听...</div>';
}

window.closeMail = function() {
    document.getElementById('mailModal').style.display = 'none';
};

window.copyMail = function() {
    const val = document.getElementById('addr').innerText;
    if (val.includes('@')) navigator.clipboard.writeText(val).then(() => alert('✅ 复制成功！'));
};

window.copyEmailContent = function() {
    const content = document.getElementById('modalBody').innerText;
    navigator.clipboard.writeText(content).then(() => alert('✅ 邮件全文已复制'));
};

function escapeHtml(str) {
    return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
}
