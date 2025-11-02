function updateDiscordCard(user) {
    let activityText = 'Şu an boşta...';
    let statusColor = '#99aab5'; // Varsayılan: Gri (Çevrimdışı)

    // Durum rengini ayarla
    if (user.discord_status === 'online') {
        statusColor = '#43b581'; // Yeşil
    } else if (user.discord_status === 'idle') {
        statusColor = '#faa61a'; // Sarı
    } else if (user.discord_status === 'dnd') {
        statusColor = '#f04747'; // Kırmızı (Rahatsız Etmeyin)
    }

    // Aktivite kontrolü: Spotify ve Diğer aktiviteler (Oyun/Stream)
    const spotifyActivity = user.activities.find(act => act.name === 'Spotify' && act.type === 2);
    const mainActivity = user.activities.find(act => act.type === 0 || act.type === 1); // 0=Oynuyor, 1=Streaming

    if (spotifyActivity) {
        activityText = `Spotify'da ${spotifyActivity.details}`;
    } else if (mainActivity) {
        if (mainActivity.state && mainActivity.details) {
            activityText = `${mainActivity.details} (${mainActivity.state})`;
        } else if (mainActivity.details) {
            activityText = mainActivity.details;
        } else {
            activityText = `Şu an ${mainActivity.name}`;
        }
    }
    
    // Discord CDN'den avatar çekme
    let avatarUrl = `https://cdn.discordapp.com/avatars/${user.discord_user.id}/${user.discord_user.avatar}.png?size=256`;
    
    // Kartın HTML içeriğini oluştur
    cardElement.innerHTML = `
        <div class="discord-header">
            <img src="${avatarUrl}" alt="${user.discord_user.username}" class="discord-avatar">
            <div>
                <span class="discord-username">${user.discord_user.global_name || user.discord_user.username}</span>
                <span class="discord-tag">#${user.discord_user.discriminator === '0' ? '' : user.discord_user.discriminator}</span>
            </div>
        </div>
        <div class="status-indicator-wrapper">
            <span class="status-dot" style="background-color: ${statusColor};"></span>
            Durum: <strong>${user.discord_status === 'online' ? 'Çevrimiçi' : user.discord_status === 'idle' ? 'Boşta' : user.discord_status === 'dnd' ? 'Rahatsız Etmeyin' : 'Çevrimdışı'}</strong>
        </div>
        <div class="discord-status">
            Aktivite: <strong>${activityText}</strong>
        </div>
    `;

    cardElement.style.display = 'block';
    cardElement.classList.add('active'); 
}
