let client = null;
const audioPlayer = document.getElementById('audio-player');
const currentSongText = document.getElementById('current-song');
const playlist = document.getElementById('playlist');

document.getElementById('connect-btn').addEventListener('click', async () => {
    const url = document.getElementById('dav-url').value.trim();
    const username = document.getElementById('dav-username').value.trim();
    const password = document.getElementById('dav-password').value.trim();

    if (!url || !username || !password) {
        alert('请完整填写 WebDAV 配置信息！');
        return;
    }

    try {
        // 初始化 WebDAV 客户端
        client = webdav.createClient(url, {
            username: username,
            password: password
        });

        // 测试连接：获取根目录文件
        const contents = await client.getDirectoryContents("/");
        alert('连接网盘成功！');
        
        // 切换面板
        document.getElementById('config-panel').classList.add('hidden');
        document.getElementById('main-panel').classList.remove('hidden');

        // 加载音乐列表
        loadMusicFiles(contents);

    } catch (error) {
        console.error(error);
        alert('连接失败，请检查 URL、账号、密码或网络（注意跨域问题）。');
    }
});

function loadMusicFiles(contents) {
    playlist.innerHTML = '';
    // 筛选常见的音频格式
    const musicFiles = contents.filter(file => {
        const ext = file.filename.split('.').pop().toLowerCase();
        return ['mp3', 'flac', 'wav', 'm4a', 'aac'].includes(ext);
    });

    if (musicFiles.length === 0) {
        playlist.innerHTML = '<li>网盘根目录下没有找到支持的音乐文件</li>';
        return;
    }

    musicFiles.forEach(file => {
        const li = document.createElement('li');
        li.textContent = file.basename;
        
        li.addEventListener('click', () => {
            playMusic(file);
        });
        playlist.appendChild(li);
    });
}

async function playMusic(file) {
    currentSongText.textContent = `正在加载: ${file.basename}`;
    try {
        // 获取文件的 WebDAV 完整下载链接
        // 注意：如果是直接通过 URL 播放，有些 WebDAV 服务器需要带上认证信息或生成临时直链
        // 简单方案：利用 webdav 库生成带鉴权的下载链接或通过 Blob 加载
        const downloadUrl = client.getFileDownloadLink(file.filename);
        
        audioPlayer.src = downloadUrl;
        audioPlayer.play();
        currentSongText.textContent = `正在播放: ${file.basename}`;
    } catch (error) {
        console.error(error);
        alert('播放失败：' + error.message);
    }
}