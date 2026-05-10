// js/domain.js - 完整从原始代码迁移
let currentDomainLang = "zh";

const domainTranslations = {
    zh: { title:"114.ae 域名查询", placeholder:"输入域名(不带后缀)" },
    en: { title:"114.ae Domain Search", placeholder:"Enter domain without suffix" },
    ar: { title:"بحث عن النطاق", placeholder:"أدخل النطاق بدون اللاحقة" }
};

window.switchDomainLang = function(lang, el) {
    currentDomainLang = lang;
    document.getElementById("domain-title").innerText = domainTranslations[lang].title;
    document.getElementById("domain-input").placeholder = domainTranslations[lang].placeholder;
    document.querySelectorAll('#domain-content .lang-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
};

window.initDomain = function() {
    const html = `
    <div id="domain-content">
        <div class="domain-container">
            <h1 id="domain-title">114.ae 域名查询</h1>
            <input id="domain-input" placeholder="输入域名(不带后缀)" style="width:70%;padding:14px;font-size:16px;border:1px solid var(--border-color);border-radius:8px;">
            <button onclick="checkDomains()" style="padding:14px 22px;margin:6px;background:var(--accent-color);color:white;border:none;border-radius:8px;">查询</button>
            <div style="margin:15px 0;">
                <span class="lang-btn active" onclick="switchDomainLang('zh',this)">中文</span>
                <span class="lang-btn" onclick="switchDomainLang('en',this)">English</span>
                <span class="lang-btn" onclick="switchDomainLang('ar',this)">عربي</span>
            </div>
            <div id="domain-output" style="margin-top:20px; overflow-x:auto;"></div>
        </div>
    </div>`;

    document.getElementById('contentContainer').innerHTML = html;

    window.checkDomains = async function() {
        const input = document.getElementById("domain-input").value.trim();
        const out = document.getElementById("domain-output");
        if (!input) {
            alert("请输入域名");
            return;
        }
        out.innerHTML = "<div class='loading'>查询中...</div>";
        try {
            const res = await fetch("https://apiforaereg.114.ae/api/aedomain-check.php", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    domains: [input],
                    tlds: [".ae", ".bh", ".qa", ".ac.ae", ".org.ae", ".sch.ae", ".co.ae"]
                })
            });
            const data = await res.json();
            let html = `<table style="width:100%;border-collapse:collapse;"><tr><th>域名</th><th>状态</th><th>注册/续费价格(AED/年)</th></tr>`;
            data.forEach(d => {
                const status = d.isAvailable ? 
                    `<span style="color:#10b981">✅ 可用（联系微信 jingeng 注册）</span>` : 
                    `<span style="color:#ef4444">❌ 已注册</span>`;
                html += `<tr><td>${d.domain}</td><td>${status}</td><td>${d.regPrice} / ${d.renewPrice}</td></tr>`;
            });
            html += `</table>`;
            out.innerHTML = html;
        } catch(e) {
            out.innerHTML = "查询失败，请稍后再试";
        }
    };
};
