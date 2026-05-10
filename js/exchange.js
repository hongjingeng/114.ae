// js/exchange.js
window.initExchange = function() {
    const html = `
    <div id="exchange-content">
        <div class="exchange-card" id="exchangeCard">
            <h2>💱 114.ae 汇率换算器</h2>
            <label>选择汇率源</label>
            <select id="api">
                <option value="opener">Open ER API</option>
                <option value="exchangerateapi">ExchangeRate-API</option>
            </select>
            <label>金额</label>
            <input id="amount" type="number" value="1000" style="width:100%;padding:12px;">
            <div class="quick-btns" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:15px 0;">
                <button onclick="setAmount(100)">100</button>
                <button onclick="setAmount(500)">500</button>
                <button onclick="setAmount(1000)">1000</button>
                <button onclick="setAmount(5000)">5000</button>
            </div>
            <label>从 / 到</label>
            <div style="display:flex;gap:10px;">
                <select id="from" style="flex:1;padding:12px;"></select>
                <select id="to" style="flex:1;padding:12px;"></select>
            </div>
            <button class="btn btn-p" onclick="calc()" style="width:100%;margin:15px 0;padding:16px;">立即换算</button>
            <div class="result" id="result" style="font-size:32px;text-align:center;margin-top:20px;">0</div>
            <div id="source" style="text-align:center;color:var(--text-secondary);"></div>
        </div>
    </div>`;

    document.getElementById('contentContainer').innerHTML = html;
    initExchangeCurrencies();
};

function initExchangeCurrencies() {
    const currencies = ["AED","CNY","USD","EUR","RUB","GBP","JPY","HKD"];
    const from = document.getElementById("from");
    const to = document.getElementById("to");
    currencies.forEach(c => {
        from.innerHTML += `<option value="${c}">${c}</option>`;
        to.innerHTML += `<option value="${c}">${c}</option>`;
    });
    from.value = "AED";
    to.value = "CNY";
    setTimeout(() => calc(), 300);
}

window.setAmount = function(v) {
    document.getElementById("amount").value = v;
    calc();
};

window.calc = async function() {
    const amount = document.getElementById("amount").value;
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
    try {
        const res = await fetch(`https://exapi.114.ae/convert?from=${from}&to=${to}&amount=${amount}`);
        const d = await res.json();
        document.getElementById("result").innerText = d.result || "0";
        document.getElementById("source").innerText = `来源：${d.source || '实时汇率'}`;
    } catch(e) {
        document.getElementById("result").innerText = "请求失败";
    }
};
