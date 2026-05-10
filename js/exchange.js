// js/exchange.js - 完整从原始代码迁移
const i18n = {
    zh: { 
        title: "114.ae汇率换算器", 
        source: "选择汇率源", 
        amount: "金额", 
        currency: "从 / 到", 
        calc: "立即换算", 
        share: "分享结果" 
    },
    en: { 
        title: "114.ae Currency Converter", 
        source: "Select Source", 
        amount: "Amount", 
        currency: "From / To", 
        calc: "Calculate", 
        share: "Share Result" 
    },
    ar: { 
        title: "محول العملات", 
        source: "اختر المصدر", 
        amount: "المبلغ", 
        currency: "من / إلى", 
        calc: "احسب الآن", 
        share: "شارك النتيجة" 
    }
};

window.initExchange = function() {
    const html = `
    <div id="exchange-content">
        <div class="exchange-top-bar">
            <select id="lang" onchange="setLang(this.value)">
                <option value="zh">中文</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
            </select>
            <button onclick="location.href='https://www.114.ae/aed-cny.html'">AED ⇄ CNY</button>
        </div>
        <div class="exchange-card" id="exchangeCard">
            <h2 data-i18n="title">💱114.ae汇率换算器</h2>
            <label data-i18n="source">选择汇率源</label>
            <select id="api">
                <option value="opener">Open ER API</option>
                <option value="exchangerateapi">ExchangeRate-API</option>
                <option value="cbr">俄罗斯央行</option>
            </select>
            <label data-i18n="amount">金额</label>
            <input id="amount" type="number" value="1000">
            <div class="quick-btns">
                <button onclick="setAmount(100)">100</button>
                <button onclick="setAmount(500)">500</button>
                <button onclick="setAmount(1000)">1000</button>
                <button onclick="setAmount(5000)">5000</button>
            </div>
            <label data-i18n="currency">从 / 到</label>
            <div style="display:flex; gap:10px;">
                <select id="from" style="flex:1;"></select>
                <select id="to" style="flex:1;"></select>
            </div>
            <button class="btn btn-p" onclick="calc()" data-i18n="calc" style="width:100%;margin:15px 0;padding:16px;">立即换算</button>
            <button class="btn btn-s" onclick="copyResult()" style="width:100%;margin-bottom:8px;">📋 复制结果</button>
            <button class="btn btn-s" onclick="share()" data-i18n="share" style="width:100%;">分享结果</button>
            <div class="result" id="result">0</div>
            <div class="source" id="source"></div>
            <canvas id="chart" style="max-height:280px;margin-top:20px;"></canvas>
        </div>
    </div>`;

    document.getElementById('contentContainer').innerHTML = html;
    initExchangeChart();
};

window.setLang = function(lang) {
    document.querySelectorAll("#exchange-content [data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (i18n[lang] && i18n[lang][key]) {
            el.textContent = i18n[lang][key];
        }
    });
    document.documentElement.lang = lang;
};

window.setAmount = function(v) {
    document.getElementById("amount").value = v;
    calc();
};

window.copyResult = function() {
    const text = window._lastResult || document.getElementById("result").innerText;
    navigator.clipboard.writeText(text).then(() => alert("结果已复制到剪贴板 ✅"));
};

window.share = function() {
    if (navigator.share) {
        navigator.share({
            title: "汇率换算结果",
            text: window._lastResult || "汇率查询结果"
        });
    } else {
        copyResult();
    }
};

window.calc = async function() {
    const amount = document.getElementById("amount").value;
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
    const api = document.getElementById("api").value;
    try {
        const res = await fetch(`https://exapi.114.ae/convert?from=${from}&to=${to}&amount=${amount}&api=${api}`);
        const d = await res.json();
        document.getElementById("result").innerText = d.result || "0";
        document.getElementById("source").innerText = `来源：${d.source || '实时'}`;
        window._lastResult = `${d.amount} ${d.from} = ${d.result} ${d.to}`;
        loadChart(from, to, api);
    } catch (e) {
        document.getElementById("result").innerText = "Error";
    }
};

async function loadChart(from, to, api) {
    try {
        const res = await fetch(`https://exapi.114.ae/history?from=${from}&to=${to}&api=${api}`);
        const d = await res.json();
        // Chart.js 逻辑（原始代码有）
        if (window.exchangeChart) {
            window.exchangeChart.data.labels = d.history.map(i => new Date(i.date).toLocaleDateString());
            window.exchangeChart.data.datasets[0].data = d.history.map(i => i.rate);
            window.exchangeChart.update();
        }
    } catch(e) {}
}

function initExchangeChart() {
    const ctx = document.getElementById('chart');
    if (ctx) {
        window.exchangeChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: { 
                labels: [], 
                datasets: [{ label: 'Rate', data: [], borderColor: '#3b82f6', tension: 0.4 }] 
            },
            options: { 
                responsive: true, 
                plugins: { legend: { display: false } } 
            }
        });
    }

    // 初始化货币选项
    const currencies = ["AED","CNY","USD","RUB","EUR","GBP","JPY","HKD"];
    const fromSel = document.getElementById("from");
    const toSel = document.getElementById("to");
    currencies.forEach(c => {
        fromSel.innerHTML += `<option value="${c}">${c}</option>`;
        toSel.innerHTML += `<option value="${c}">${c}</option>`;
    });
    fromSel.value = "AED";
    toSel.value = "CNY";

    // 默认计算一次
    setTimeout(() => {
        if (typeof calc === 'function') calc();
    }, 500);
}
