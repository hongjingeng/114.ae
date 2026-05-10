// js/music.js
window.initMusic = function() {
    const html = `
    <div id="music-content">
        <div class="music-container">
            <div style="text-align:center;margin-bottom:30px;">
                <h1 style="font-size:2.6rem;">🎵 114.ae 在线音乐</h1>
                <p style="color:var(--text-secondary);">高清音源 · 免费试听 · 支持下载</p>
            </div>

            <div class="music-player">
                <div style="display:flex;gap:12px;flex-wrap:wrap;">
                    <input id="music-keyword" type="text" placeholder="输入歌名或歌手（如：陈雷、周杰伦）" 
                           style="flex:1;min-width:280px;padding:16px 24px;border-radius:60px;border:1px solid var(--border-color);background:var(--input-bg);font-size:1.1rem;">
                    <button onclick="searchMusicHandler()" style="min-width:140px;padding:16px 32px;border-radius:60px;background:var(--accent-color);color:white;font-weight:600;">🔍 搜索</button>
                </div>
            </div>

            <div id="current-song-player" class="music-player" style="display:none;"></div>

            <div class="music-player">
                <div style="font-size:1.3rem;font-weight:600;margin-bottom:16px;">🎧 搜索结果</div>
                <div id="song-list"></div>
            </div>
        </div>
    </div>`;

    document.getElementById('contentContainer').innerHTML = html;
};

window.searchMusicHandler = async function() {
    const keyword = document.getElementById('music-keyword').value.trim();
    if (!keyword) return;
    const listEl = document.getElementById('song-list');
    listEl.innerHTML = '<div style="padding:60px;text-align:center;">搜索中...</div>';

    try {
        const proxy = 'https://proxy.api.030101.xyz/';
        const res = await fetch(proxy + `https://u.y.qq.com/cgi-bin/musicu.fcg?data={"req_1":{"method":"DoSearchForQQMusicDesktop","module":"music.search.SearchCgiService","param":{"query":"${encodeURIComponent(keyword)}","num_per_page":20}}}`);
        const data = await res.json();
        const songs = data.req_1?.data?.body?.song?.list || [];
        
        let html = '';
        songs.forEach(song => {
            html += `
            <div class="song-item" onclick="playSong('${song.mid}', '${escapeHtml(song.title || song.songname)}', '${escapeHtml(song.singer ? song.singer.map(s=>s.name).join(" / ") : "未知")}')">
                <div style="flex:1;">
                    <div style="font-weight:600;">${song.title || song.songname}</div>
                    <div style="color:var(--text-secondary);">${song.singer ? song.singer.map(s=>s.name).join(" / ") : "未知歌手"}</div>
                </div>
            </div>`;
        });
        listEl.innerHTML = html || '<div style="padding:60px;text-align:center;color:var(--text-secondary);">未找到结果</div>';
    } catch(e) {
        listEl.innerHTML = '<div style="padding:60px;text-align:center;color:red;">搜索失败</div>';
    }
};

window.playSong = function(mid, title, artist) {
    const player = document.getElementById('current-song-player');
    player.style.display = 'block';
    player.innerHTML = `
        <h3>${title} - ${artist}</h3>
        <audio controls autoplay style="width:100%;margin:15px 0;">
            <source src="https://api.xunhuisi.store/API/QQMusic/Song.php?mid=${mid}" type="audio/mpeg">
        </audio>`;
};

function escapeHtml(str) {
    return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
}
