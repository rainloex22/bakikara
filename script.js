document.addEventListener('DOMContentLoaded', () => {
    const discordCard = document.getElementById('discord-card');
    const backgroundMusic = document.getElementById('background-music');
    const musicToggle = document.getElementById('music-toggle');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeIcon = document.getElementById('volume-icon');
    const visitorCountTextElement = document.getElementById('visitor-count-text'); 
    
    // Sabit Kullanıcı Adı Belirlemesi (BAKİ S2)
    const DISPLAY_NAME = 'BAKİ S2'; 

    // Müzik Kontrolleri
    let isPlaying = false;

    // Başlangıçta sesi kapalı (mute) ve ikon 🔇 olarak ayarla
    backgroundMusic.volume = 0;
    volumeSlider.value = 0;
    musicToggle.classList.add('paused');
    musicToggle.setAttribute('aria-label', 'Sesi Aç');


    // Sesi açma/kapama fonksiyonu
    musicToggle.addEventListener('click', () => {
        if (isPlaying) {
            backgroundMusic.pause();
            isPlaying = false;
            musicToggle.classList.add('paused');
            volumeIcon.textContent = '🔇'; // Kapalı ikon
            musicToggle.setAttribute('aria-label', 'Sesi Aç');
        } else {
            // İlk tıklamada müziği başlat
            backgroundMusic.play().catch(error => {
                console.log("Oynatma hatası:", error);
            });
            isPlaying = true;
            musicToggle.classList.remove('paused');
            
            // Eğer slider 0'da değilse, sesi aç (varsayılan: 0.5)
            if (volumeSlider.value == 0) {
                backgroundMusic.volume = 0.5;
                volumeSlider.value = 0.5;
            }
            // Sesi açtıktan sonra ikonu kontrol et
            volumeIcon.textContent = (backgroundMusic.volume > 0) ? '🔊' : '🔇';
            musicToggle.setAttribute('aria-label', 'Sesi Kapat');
        }
    });

    // Ses seviyesi kontrolü
    volumeSlider.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        backgroundMusic.volume = volume;

        // Ses seviyesine göre ikon güncelleme
        if (volume === 0) {
            volumeIcon.textContent = '🔇'; // Sessiz
            musicToggle.classList.add('paused');
        } else {
            volumeIcon.textContent = '🔊'; // Sesli
            musicToggle.classList.remove('paused');
        }

        // Eğer slider 0'dan yukarı çekilirse ve müzik duraklatılmışsa, oynatmayı başlat
        if (volume > 0 && !isPlaying) {
             backgroundMusic.play().catch(error => {
                console.log("Oynatma hatası:", error);
            });
            isPlaying = true;
            musicToggle.classList.remove('paused');
        }
    });

    // Discord API'den verileri çekme 
    const DISCORD_ID = '1252284892457468026';
    const LANYARD_API_URL = `https://api.lanyard.rest/v1/users/${DISCORD_ID}`;

    const fetchDiscordStatus = () => {
        fetch(LANYARD_API_URL)
            .then(response => response.json())
            .then(data => {
                const user = data.data;

                if (!user || user.listening_to_spotify === undefined) {
                    throw new Error("Discord verileri alınamadı.");
                }

                // 1. Durum Rengi
                const status = user.discord_status || 'offline';
                let statusColor;
                switch (status) {
                    case 'online':
                        statusColor = '#43B581'; // Yeşil
                        break;
                    case 'idle':
                        statusColor = '#FAA61A'; // Turuncu
                        break;
                    case 'dnd':
                        statusColor = '#F04747'; // Kırmızı
                        break;
                    default:
                        statusColor = '#747F8D'; // Gri (çevrimdışı/görünmez)
                }

                // 2. Aktivite
                let activityText;
                let activityDotColor = 'transparent'; 
                let activityDotVisible = false;

                if (user.activities && user.activities.length > 0) {
                    const activity = user.activities[0];
                    activityDotVisible = true;
                    
                    if (activity.type === 0) { 
                        activityText = `Oynuyor: <strong>${activity.name}</strong>`;
                        activityDotColor = '#1DB954'; 
                    } else if (activity.type === 1) { 
                        activityText = `Yayın yapıyor: <strong>${activity.name}</strong>`;
                        activityDotColor = '#9400D3'; 
                    } else if (activity.type === 2) { 
                        if (user.spotify) {
                            activityText = `Dinliyor: <strong>${user.spotify.song}</strong> - ${user.spotify.artist}`;
                            activityDotColor = '#1DB954'; 
                        } else {
                            activityText = 'Şu anda bir aktivite yok...';
                            activityDotVisible = false;
                        }
                    } else {
                        activityText = 'Şu anda bir aktivite yok...';
                        activityDotVisible = false;
                    }

                } else {
                    activityText = 'Şu anda bir aktivite yok...';
                    activityDotVisible = false;
                }

                // 3. Kartı HTML ile güncelleme
                discordCard.innerHTML = `
                    <div class="discord-header">
                        <div style="position: relative;">
                            <img src="https://cdn.discordapp.com/avatars/${DISCORD_ID}/${user.discord_user.avatar}.png?size=1024" alt="Avatar" class="discord-avatar">
                            <span class="status-dot" style="background-color: ${statusColor}; border-color: ${statusColor}; position: absolute; bottom: 0; right: 0;"></span>
                        </div>
                        
                        <div>
                            <span class="discord-username">${DISPLAY_NAME}</span>
                            <span class="discord-tag"></span>
                        </div>
                    </div>

                    <div class="status-indicator-wrapper">
                        ${activityDotVisible ? `<span class="activity-dot" style="background-color: ${activityDotColor}; border-color: ${activityDotColor};"></span>` : ''}
                        <span class="discord-status">${activityText}</span>
                    </div>
                `;
                discordCard.style.display = 'block';
                discordCard.classList.remove('loading');

            })
            .catch(error => {
                console.error("Discord verileri çekilirken hata oluştu:", error);
                discordCard.innerHTML = `<span style="color: #f04747;">Discord verileri yüklenemedi.</span>`;
                discordCard.style.display = 'block';
                discordCard.classList.remove('loading');
            });
    };


    // Sayaç için CountAPI.xyz entegrasyonu
    const COUNT_API_NAMESPACE = 'your_github_username.github.io'; 
    const COUNT_API_KEY = 'BAKI-S2'; 

    const fetchVisitorCount = () => {
        fetch(`https://api.countapi.xyz/hit/${COUNT_API_NAMESPACE}/${COUNT_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                if (visitorCountTextElement) {
                    visitorCountTextElement.textContent = data.value;
                }
            })
            .catch(error => {
                console.error("Sayaç verileri çekilirken hata oluştu:", error);
                if (visitorCountTextElement) {
                    visitorCountTextElement.textContent = '...'; 
                }
            });
    };

    fetchDiscordStatus();
    fetchVisitorCount(); 
    setInterval(fetchDiscordStatus, 10000); 
});
```eof

### 2. 🎨 Güncellenmiş `style.css` Kodunun Tamamı (Göz Görünür, Arka Plansız, Yuvarlak Avatar)

```css:Styles:style.css
/* Genel Ayarlar ve Fontlar */
body {
    font-family: 'Poppins', sans-serif;
    color: #fff;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    overflow: hidden; /* Taşmayı önler */
}

/* 1. VİDEO ARKA PLAN */
.video-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -2; 
    overflow: hidden;
}
#bg-video {
    width: 100vw;
    height: 100vh;
    object-fit: cover;
}

/* 2. ANA İÇERİK KAPSAYICISI VE ŞEFFAFLIK */
.content {
    z-index: 1;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.0); /* Ultra Şeffaf arkaplan */
    padding: 20px;
    border-radius: 15px;
    backdrop-filter: blur(0px); /* Arka plan bulanıklığı yok */
    -webkit-backdrop-filter: blur(0px);
}

/* 3. BAŞLIK STİLİ - NORMALDE KIRMIMSI, HOVER'DA MAVİ PARLIYOR */
.title {
    font-size: 6.5em; 
    font-weight: 800;
    letter-spacing: 7px;
    margin-bottom: 40px;
    
    /* Normalde hafif kırmızımsı bir parlaklık */
    text-shadow: 
        0 0 5px rgba(255, 0, 0, 0.5),   
        0 0 10px rgba(255, 0, 0, 0.3);
    
    transition: text-shadow 0.4s ease-in-out; /* Yumuşak geçiş için */
    
    animation: fadeInDown 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; 
}

/* Fare Üzerine Gelince Mavi/Cyan Parlaklık Ekle */
.title:hover {
    text-shadow: 
        0 0 5px #00FFFF,   
        0 0 10px #00FFFF,
        0 0 15px #00FFFF,
        0 0 40px #00A9A9; /* Mavi/Cyan parlaklık burada aktive olur */
    cursor: default; 
}

@keyframes fadeInDown {
    0% { opacity: 0; transform: translateY(-50px); }
    100% { opacity: 1; transform: translateY(0); }
}

/* 4. DİSCORD KARTI STİLİ */
.discord-info {
    width: 300px;
    background: rgba(47, 49, 54, 0.9); /* Discord Koyu Arkaplan rengi */
    border-radius: 10px;
    padding: 15px;
    margin: 0 auto 30px; 
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    /* Büyüme efekti için yumuşak geçiş */
    transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); 
}

/* Kartın Üzerine Gelince Büyütme Efekti */
.discord-info:hover {
    transform: scale(1.05); /* %5 oranında yakınlaştırma */
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6); /* Gölgeyi de belirginleştiriyoruz */
}

/* Discord Header ve Avatar */
.discord-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}
.discord-avatar {
    width: 50px;
    height: 50px;
    /* AVATAR ŞEKLİ YUVARLAK */
    border-radius: 50%; 
    margin-right: 15px;
    position: relative;
    border: 3px solid #1e2024; /* Kartın arkaplanı ile uyumlu kalın border */
}

/* Kullanıcı İsimleri */
.discord-username {
    font-size: 1.1em;
    font-weight: 600;
    color: #fff;
    display: block;
}
.discord-tag {
    /* Etiket (#) alanı gizlendi */
    display: none;
}

/* Durum Noktası (Çevrimiçi, Boşta vb.) */
.status-indicator-wrapper {
    display: flex;
    align-items: center;
    font-size: 0.95em;
    color: #b9bbbe;
    margin-bottom: 10px;
    font-weight: 400;
}
.status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 10px;
    border: 3px solid #1e2024; /* Avatar border'ı ile uyumlu */
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

/* Aktivite Noktası (Oynuyor/Oynamıyor) */
.activity-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 10px;
    border: 3px solid #1e2024; 
    transition: background-color 0.3s ease;
    display: inline-block;
    vertical-align: middle; 
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}


/* Aktivite Metni */
.discord-status {
    font-size: 0.95em;
    color: #b9bbbe;
}
.discord-status strong {
    color: #fff; 
}


/* 5. SOSYAL LİNKLER */
.social-links {
    display: flex;
    justify-content: center;
    gap: 25px;
    margin-top: 20px; /* Sayacın altına biraz boşluk */
}
.social-icon {
    font-size: 30px;
    color: #fff;
    transition: color 0.3s, transform 0.3s;
}
.social-icon:hover {
    transform: scale(1.1);
}
.social-icon.discord:hover {
    color: #5865f2;
}

/* 7. ZİYARETÇİ SAYACI STİLİ (ARKA PLANSIZ VE HER ZAMAN GÖRÜNÜR İKON) */
.visitor-counter-display {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: -15px; 
    margin-bottom: 20px; 
    font-size: 0.95em;
    color: #fff;
    
    /* ARKA PLAN VE GÖLGE KALDIRILDI */
    background: transparent; 
    padding: 0; /* Boşluk kaldırıldı */
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
    box-shadow: none; 
}

.visitor-icon {
    font-size: 1.1em; 
    margin-right: 8px;
    vertical-align: middle;
    /* İKON HER ZAMAN BEYAZ VE GÖRÜNÜR */
    color: #fff; 
    transition: color 0.3s; 
}

/* Göz ikonunun üzerine gelince beyazlığını korur, ekstra bir renk değişimi olmaz */
.visitor-counter-display:hover .visitor-icon {
    color: #fff;
}

#visitor-count-text {
    font-weight: 600;
    color: #fff;
    vertical-align: middle;
}


/* 6. MÜZİK KONTROLLERİ */
#music-controls-wrapper {
    position: absolute;
    top: 20px;
    left: 20px;
    display: flex;
    align-items: center;
    z-index: 10;
}

.music-button {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 20px;
    padding: 10px;
    border-radius: 50%;
    transition: background-color 0.3s;
}

.music-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.music-button.paused #volume-icon {
    color: #f04747; /* Kırmızı, kapalı olduğunu belirtir */
}

#volume-slider {
    width: 100px;
    margin-left: 10px;
    /* Slider görünümünü özelleştirme (Tarayıcıya göre farklılık gösterebilir) */
    -webkit-appearance: none;
    appearance: none;
    height: 5px;
    background: #5865f2;
    border-radius: 5px;
    outline: none;
    opacity: 0.7;
    transition: opacity .2s;
}

#volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
}

/* Yüklenme Durumu */
.loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100px;
}
.loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #5865f2;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```eof

**Önemli Hatırlatma:** Lütfen bu dosyaları yükledikten sonra tarayıcınızda sayfayı **zorla yenileyerek** (Ctrl+Shift+R veya Cmd+Shift+R) önbelleğin temizlendiğinden emin olun.
