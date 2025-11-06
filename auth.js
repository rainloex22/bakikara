// auth.js

// --- KRİTİK SABİTLER (DEĞİŞMEYENLER) ---
const SUPABASE_URL = 'https://ywxhworspkocuzsygsgc.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3eGh3b3JzcGtvY3V6c3lnc2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MzEzMTcsImV4cCI6MjA3ODAwNzMxN30.x7IMaG9C1bF8_RIbv50NfyeymsTu5cwsBRnQy9ZRa8Y'; 
const RENDER_API_URL = 'https://sosyalpro-api-1.onrender.com'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// CURRENT_PAGE_SLUG ARTIK Global olarak tanımlanmayacak,
// HTML dosyasından atanacak.

// ... Geri kalan tüm JavaScript fonksiyonları (updateAuthStatus, handleSignUp, loadComments, vb.)
// ... buraya taşınacak.
// loadComments fonksiyonu artık sayfa slug'ını parametre olarak alacak:
async function loadComments(pageSlug) {
    // ... API isteği yaparken pageSlug kullanılacak ...
    const response = await fetch(`${RENDER_API_URL}/api/comments/${pageSlug}`);
    // ...
}

// Yorum Gönderme fonksiyonu da pageSlug'ı parametre olarak almalı
document.getElementById('yorum-gonder-formu').addEventListener('submit', async (e) => {
    // ...
    const response = await fetch(`${RENDER_API_URL}/api/comments/add`, {
        // ...
        body: JSON.stringify({
            // ...
            page_slug: window.CURRENT_PAGE_SLUG, // HTML'den gelen global değişkeni kullan
            // ...
        })
    });
    // ...
});

// Sayfa yüklendiğinde yorumları çekmeyi global olarak yapamayız, HTML'e bırakırız.
// document.addEventListener('DOMContentLoaded', loadComments); // BU SATIRI auth.js'den KALDIRIN
