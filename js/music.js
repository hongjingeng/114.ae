// js/music.js - 完整迁移
window.initMusic = function() {
    const html = `
    <div id="music-content">
        <div class="music-container" id="music-app">
            <div style="text-align:center;margin-bottom:30px;">
                <h1 style="font-size:2.6rem;">🎵 114.ae 在线音乐</h1>
                <p style="color:var(--text-secondary);">高清音源 · 免费试听 · 支持下载</p>
            </div>

            <div class="music-player">
                <div style="display:flex;gap:12px;flex-wrap:wrap;">
                    <input id="music-keyword" type="text" placeholder="输入歌名或歌手（如：陈雷、周杰伦、晴天）" 
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
    listEl.innerHTML = '<div style="padding:80px;text-align:center;">搜索中...</div>';

    try {
        const proxy = 'https://proxy.api.030101.xyz/';
        const res = await fetch(proxy + `https://u.y.qq.com/cgi-bin/musicu.fcg?data={"req_1":{"method":"DoSearchForQQMusicDesktop","module":"music.search.SearchCgiService","param":{"query":"${encodeURIComponent(keyword)}","num_per_page":30}}}`);
        const data = await res.json();
        const songs = data.req_1?.data?.body?.song?.list || [];

        let html = '';
        songs.forEach(song => {
            html += `
            <div class="song-item" onclick="playSong('${song.mid || song.id}', '${escapeHtml(song.title || song.songname)}', '${escapeHtml(song.singer ? song.singer.map(s => s.name).join(" / ") : "未知")}')">
                <img src="https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.album?.mid || '003'}.jpg" style="width:60px;height:60px;border-radius:12px;" onerror="this.src='https://picsum.photos/id/1015/60/60'">
                <div style="flex:1;">
                    <div style="font-weight:600;">${song.title || song.songname}</div>
                    <div style="color:var(--text-secondary);">${song.singer ? song.singer.map(s => s.name).join(' / ') : '未知歌手'}</div>
                </div>
            </div>`;
        });
        listEl.innerHTML = html || '<div style="padding:60px;text-align:center;color:var(--text-secondary);">未找到匹配歌曲</div>';
    } catch(e) {
        listEl.innerHTML = '<div style="padding:60px;text-align:center;color:red;">搜索失败，请重试</div>';
    }
};

window.playSong = function(mid, title, artist) {
    const player = document.getElementById('current-song-player');
    player.style.display = 'block';
    player.innerHTML = `
        <div style="display:flex;gap:20px;flex-wrap:wrap;">
            <div style="flex:1;min-width:300px;">
                <h2>${title}</h2>
                <p style="color:var(--text-secondary);">${artist}</p>
                <audio controls autoplay style="width:100%;margin:15px 0;">
                    <source src="https://api.xunhuisi.store/API/QQMusic/Song.php?mid=${mid}" type="audio/mpeg">
                </audio>
            </div>
        </div>`;
};

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));
}
