import { initializeApp } from "https://www.gstatic.com/firebase/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebase/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebase/9.6.1/firebase-firestore.js";

// !!! BURAYA KENDİ FIREBASE YAPILANDIRMANIZI EKLEYİNİZ !!!
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

let auth, db;
let isConfigAvailable = false;

/**
 * Kullanıcının adının baş harflerini hesaplar (Özel 'MA' kuralı dahil).
 */
function getInitials(displayName) {
    if (!displayName) return '?';
    
    const standardName = displayName.toLowerCase().trim();
    
    // İstenen özel durum kontrolü: 'mehmet açan' için 'MA'
    if (standardName.includes('mehmet açan') || standardName.startsWith('mehmet a')) {
        return 'MA';
    }

    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length > 0) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return '?';
}

/**
 * Navbar/Header UI'sini kullanıcının oturum durumuna göre günceller.
 */
async function updateNavbarUI(user) {
    const loggedInNav = document.getElementById('loggedInNav');
    const loggedOutNav = document.getElementById('loggedOutNav');
    
    if (!loggedInNav || !loggedOutNav) return;

    if (user && user.email) {
        let displayName = user.displayName || 'Kullanıcı';
        let isPremium = false;
        
        // Firestore'dan ek bilgileri çek (Örn: isPremium ve güncel displayName)
        if (db) {
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    isPremium = data.isPremium === true;
                    if (data.displayName) { 
                        displayName = data.displayName;
                    }
                }
            } catch (error) {
                console.error("Kullanıcı profil bilgileri çekilemedi:", error);
            }
        }
        
        // Kullanıcı Adı ve Hesap Türü
        const roleText = isPremium ? 'Premium' : 'Standart';
        // Premium için sarı (yellow-500), Standart için gri (gray-500)
        const roleClass = isPremium ? 'bg-yellow-500 text-gray-900' : 'bg-gray-500 text-white';
        const initials = getInitials(displayName); 
        
        // UI elementlerini güncelle
        const navProfileInitials = document.getElementById('nav_profile_initials');
        const navDisplayName = document.getElementById('nav_display_name');
        const navUserRole = document.getElementById('nav_user_role');
        const navDisplayNameMobile = document.getElementById('nav_display_name_mobile');
        const navUserRoleMobile = document.getElementById('nav_user_role_mobile');

        if (navProfileInitials) navProfileInitials.textContent = initials;
        if (navDisplayName) navDisplayName.textContent = displayName;
        if (navUserRole) {
            navUserRole.textContent = roleText;
            navUserRole.className = `text-xs font-medium rounded-full px-2 py-0.5 mt-0.5 ${roleClass}`;
        }
        // Mobil görünüm için de güncelle
        if (navDisplayNameMobile) navDisplayNameMobile.textContent = displayName;
        if (navUserRoleMobile) {
            navUserRoleMobile.textContent = roleText;
            navUserRoleMobile.className = `text-xs font-medium rounded-full px-2 py-0.5 mt-0.5 block ${roleClass}`;
        }

        // Göster/Gizle
        loggedOutNav.classList.add('hidden');
        loggedInNav.classList.remove('hidden');

    } else {
        // --- 2. Kullanıcı Giriş Yapmamış Durumda ---
        loggedInNav.classList.add('hidden');
        loggedOutNav.classList.remove('hidden');
    }
}

/**
 * Çıkış Yapma İşlemi
 */
async function handleLogout() {
    if (!auth) return;
    try {
        await signOut(auth);
        // İsteğe bağlı: Çıkış yaptıktan sonra anasayfaya yönlendir
        window.location.href = 'panel.html'; 
    } catch (error) {
        console.error("Çıkış hatası:", error);
    }
}

/**
 * Firebase uygulamasını başlatır ve oturum dinleyicisini kurar.
 */
function startClient() {
    try {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        isConfigAvailable = true;
        
        // Oturum dinleyicisini kur
        onAuthStateChanged(auth, (user) => {
            updateNavbarUI(user); // Her oturum değişikliğinde Navbar'ı güncelle
        });

        // Çıkış butonu olay dinleyicisi (Eğer sayfada mevcutsa)
        document.getElementById('logoutButtonNav')?.addEventListener('click', handleLogout);

    } catch (e) {
        console.error("Firebase başlatma hatası:", e);
        updateNavbarUI(null);
    }
}

// Global scope'a ekleme (HTML dosyalarından çağrılabilmesi için)
window.startClient = startClient;
