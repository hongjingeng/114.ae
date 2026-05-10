// js/main.js
let currentTabIndex = 3; // 默认域名查询

const tabs = [
    { id: 0, name: "🔍 全网盘搜", file: "search.js" },
    { id: 1, name: "✉️ 临时邮箱", file: "email.js" },
    { id: 2, name: "💱 汇率查询", file: "exchange.js" },
    { id: 3, name: "🔍 域名查询", file: "domain.js" },
    { id: 4, name: "🎵 在线音乐", file: "music.js" }
];

let loadedModules = new Set();

async function loadModule(file) {
    if (loadedModules.has(file)) return;
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `js/${file}`;
        script.onload = () => { loadedModules.add(file); resolve(); };
        script.onerror = () => reject(new Error(`加载失败 ${file}`));
        document.head.appendChild(script);
    });
}

function renderTabs() {
    const bar = document.getElementById('tabBar');
    bar.innerHTML = tabs.map(tab => `
        <button class="tab ${tab.id === currentTabIndex ? 'active' : ''}" onclick="switchTab(${tab.id})">${tab.name}</button>
    `).join('');
}

window.switchTab = async function(index) {
    currentTabIndex = index;
    renderTabs();
    const tab = tabs[index];
    await loadModule(tab.file);
    const initFn = `init${tab.file.replace('.js','').replace(/^\w/, c => c.toUpperCase())}`;
    if (typeof window[initFn] === 'function') window[initFn]();
};

// 广告加载
async function loadAdvertisements() {
    // 图片广告 1200x70
    const adContainer = document.getElementById('ad-1200x70');
    try {
        const res = await fetch('https://ad.wemart.ae/ads?slot=banner-1200x70');
        const ads = await res.json();
        if (ads && ads.length > 0) {
            const ad = ads[0];
            adContainer.innerHTML = `<a href="${ad.link}" target="_blank" rel="noopener noreferrer"><img src="${ad.image_url}" alt="${ad.title}" style="width:100%;max-width:1200px;height:auto;display:block;margin:0 auto;border-radius:8px;"></a>`;
        }
    } catch(e) { adContainer.style.display = 'none'; }

    // 文字广告
    const textContainer = document.getElementById('text-ads');
    try {
        const res = await fetch('https://ad.wemart.ae/ads?slot=text-380x54');
        const ads = await res.json();
        let html = '';
        ads.forEach(ad => {
            html += `<a href="${ad.link}" target="_blank" style="margin:0 15px;color:#1e40af;text-decoration:underline;">${ad.title}</a>`;
        });
        textContainer.innerHTML = html;
    } catch(e) {}
}

// 主题切换
document.addEventListener('DOMContentLoaded', () => {
    renderTabs();
    switchTab(currentTabIndex);

    const toggle = document.getElementById('themeToggle');
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
        toggle.textContent = '☀️';
    }
    toggle.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark');
        document.body.classList.toggle('dark', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        toggle.textContent = isDark ? '☀️' : '🌙';
    });

    loadAdvertisements();
});
