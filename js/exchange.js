// js/exchange.js
window.initExchange = function() {
    const html = `
    <div id="exchange-content">
        <div class="exchange-card">
            <h2>💱 114.ae 汇率换算器</h2>
            <label>金额</label>
            <input id="amount" type="number" value="1000" style="width:100%;padding:14px;margin-bottom:15px;">
            <div style="display:flex;gap:10px;margin-bottom:15px;">
                <select id="from" style="flex:1;padding:12px;"></select>
                <select id="to" style="flex:1;padding:12px;"></select>
            </div>
            <button class="btn btn-p" onclick="calc()" style="width:100%;padding:16px;">立即换算</button>
            <div class="result" id="result" style="margin-top:20px;font-size:32px;text-align:center;">0</div>
            <div id="source" style="text-align:center;color:var(--text-secondary);margin-top:10px;"></div>
        </div>
    </div>`;

    document.getElementById('contentContainer').innerHTML = html;
    initExchangeCurrencies();
};

function initExchangeCurrencies() {
    const currencies = ["AED","CNY","USD","EUR","RUB","GBP","JPY"];
    const fromSel = document.getElementById("from");
    const toSel = document.getElementById("to");
    currencies.forEach(c => {
        fromSel.innerHTML += `<option value="${c}">${c}</option>`;
        toSel.innerHTML += `<option value="${c}">${c}</option>`;
    });
    fromSel.value = "AED";
    toSel.value = "CNY";
}

window.calc = async function() {
    const amount = document.getElementById("amount").value;
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
    try {
        const res = await fetch(`https://exapi.114.ae/convert?from=${from}&to=${to}&amount=${amount}`);
        const d = await res.json();
        document.getElementById("result").innerText = d.result || "0";
        document.getElementById("source").innerText = `来源：${d.source || '实时'}`;
    } catch(e) {
        document.getElementById("result").innerText = "请求失败";
    }
};
