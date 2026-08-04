// ============================================================
//  NOTIFICATION SYSTEM
// ============================================================
function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission();
    }
}

function sendBrowserNotification(title, message, orderId = null) {
    if ("Notification" in window && Notification.permission === "granted") {
        const notification = new Notification(title, {
            body: message,
            icon: 'https://files.catbox.moe/o3t86k.jpg'
        });
        notification.onclick = function() {
            window.focus();
            if (orderId) {
                if (typeof isAdminLoggedIn !== 'undefined' && isAdminLoggedIn) {
                    openAdminChat(orderId);
                } else {
                    navigateTo('orders');
                    setTimeout(() => openOrderChat(orderId), 500);
                }
            }
        };
    }
}

requestNotificationPermission();

// ============================================================
//  CONFIG & DATA
// ============================================================
const CONFIG = {
    flashSaleEnd: new Date(Date.now() + 4 * 3600 * 1000 + 32 * 60000 + 15 * 1000),
    promoCodes: {
        'JOELL50': { discount: 0.5, type: 'percent', max: 50000, desc: 'Diskon 50%' },
        'WELCOME': { discount: 10000, type: 'fixed', desc: 'Potongan Rp 10.000' },
        'FLASH25': { discount: 0.25, type: 'percent', max: 25000, desc: 'Diskon 25%' }
    },
    imgurClientId: '546c25a59c58ad7',
    osintApiKey: 'a306d58d00msh5264c55372d6410p14feb6jsn101a605f6cd6',
    adminPassword: 'joelladmin2026'
};

const topupGames = [
    { name: 'FREE FIRE', logo: 'https://files.catbox.moe/5mzzve.webp', url: 'https://bananagamestore.com/free-fire-b' },
    { name: 'MOBILE LEGENDS', logo: 'https://files.catbox.moe/6l0i99.webp', url: 'https://bananagamestore.com/mobile-legends-b' },
    { name: 'HONOR OF KINGS', logo: 'https://files.catbox.moe/jr45bw.png', url: 'https://bananagamestore.com/honor-of-kings' },
    { name: 'PUBG MOBILE', logo: 'https://files.catbox.moe/ja3cb4.webp', url: 'https://bananagamestore.com/pubg-mobile' },
    { name: 'MAGIC CHESS', logo: 'https://files.catbox.moe/20pncb.webp', url: 'https://bananagamestore.com/magic-chess-go-go' },
    { name: 'VALORANT', logo: 'https://files.catbox.moe/o7ggke.webp', url: 'https://bananagamestore.com/valorant' },
    { name: 'BLOOD STRIKE', logo: 'https://files.catbox.moe/rzmi2o.webp', url: 'https://bananagamestore.com/blood-strike' },
    { name: 'CALL OF DUTY', logo: 'https://files.catbox.moe/xjzqxc.webp', url: 'https://bananagamestore.com/call-of-duty-mobile-id' },
    { name: 'ROBLOX', logo: 'https://files.catbox.moe/t347k0.webp', url: 'https://bananagamestore.com/roblox' },
    { name: 'DELTA FORCE', logo: 'https://files.catbox.moe/kkcx3r.webp', url: 'https://bananagamestore.com/delta-force-garena' },
    { name: 'POINT BLANK', logo: 'https://files.catbox.moe/y9zkye.webp', url: 'https://bananagamestore.com/ppoint-blank-voucher-cash' },
    { name: 'STEAM', logo: 'https://files.catbox.moe/s7r8fi.webp', url: 'https://bananagamestore.com/steam-voucher-indonesia-rupiah' }
];

const products = [
    { id: 1, name: 'Panel Pterodactyl', price: 2000, desc: 'Panel hosting premium dengan performa stabil untuk bot dan game server.', icon: 'fa-server', category: 'hosting', badge: 'hot', variants: [
        { name: '1GB RAM', price: 2000, stock: 'Tersedia' }, { name: '2GB RAM', price: 3000, stock: 'Tersedia' },
        { name: '3GB RAM', price: 4000, stock: 'Tersedia' }, { name: '4GB RAM', price: 5000, stock: 'Tersedia' },
        { name: '5GB RAM', price: 6000, stock: 'Tersedia' }, { name: '6GB RAM', price: 7000, stock: 'Tersedia' },
        { name: '7GB RAM', price: 8000, stock: 'Tersedia' }, { name: '8GB RAM', price: 9000, stock: 'Tersedia' },
        { name: '9GB RAM', price: 10000, stock: 'Tersedia' }, { name: '11GB RAM', price: 11000, stock: 'Tersedia' },
        { name: 'Unlimited RAM', price: 13000, stock: 'Limited' }, { name: 'Reseller Panel', price: 16000, stock: 'Tersedia' },
        { name: 'Admin Panel', price: 18000, stock: 'Tersedia' }
    ]},
    { id: 2, name: 'Jasa Pembuatan Fitur', price: 5000, desc: 'Custom fitur untuk bot WhatsApp sesuai kebutuhan Anda.', icon: 'fa-microchip', category: 'hosting', badge: 'new', variants: [
        { name: 'Add & Fix Fitur', price: 5000, stock: 'Tersedia' }, { name: 'Auto React Status', price: 15000, stock: 'Tersedia' },
        { name: 'Security IP', price: 25000, stock: 'Tersedia' }, { name: 'Security User+Pass', price: 15000, stock: 'Tersedia' },
        { name: 'Autojoin Saluran', price: 10000, stock: 'Tersedia' }, { name: 'Auto Show JKT48', price: 55000, stock: 'Limited' }
    ]},
    { id: 3, name: 'Sewa Bot & Jadibot', price: 10000, desc: 'Bot WhatsApp siap pakai 24/7 tanpa perlu setup.', icon: 'fa-robot', category: 'hosting', variants: [
        { name: '2 Minggu', price: 10000, stock: 'Tersedia' }, { name: '1 Bulan', price: 20000, stock: 'Tersedia' }, { name: 'Lifetime', price: 30000, stock: 'Limited' }
    ]},
    { id: 4, name: 'Script Lily Gen 2', price: 30000, desc: 'Script bot WhatsApp 600+ fitur dengan auto react & auto show JKT48.', icon: 'fa-database', category: 'hosting', badge: 'pro', variants: [
        { name: 'No Update', price: 30000, stock: 'Tersedia' }, { name: 'Free 1x Update', price: 35000, stock: 'Tersedia' }, { name: 'Free 2x Update', price: 45000, stock: 'Tersedia' }
    ]},
    { id: 5, name: 'Jasa Rename Script', price: 7000, desc: 'Ubah identitas script bot WA dari 30% hingga 100% full rename.', icon: 'fa-pen-fancy', category: 'hosting', variants: [
        { name: 'Rename 30%', price: 7000, stock: 'Tersedia' }, { name: 'Rename 60%', price: 12000, stock: 'Tersedia' },
        { name: 'Rename 80%', price: 15000, stock: 'Tersedia' }, { name: 'Rename 100%', price: 20000, stock: 'Tersedia' }
    ]},
    { id: 6, name: 'Domain & Hosting', price: 8000, desc: 'Domain dan hosting website berkualitas dengan panel cPanel.', icon: 'fa-globe', category: 'hosting', variants: [
        { name: 'Domain .my.id 1th', price: 8000, stock: 'Tersedia' }, { name: 'Domain .biz.id 1th', price: 8000, stock: 'Tersedia' },
        { name: 'Domain .xyz 1th', price: 75000, stock: 'Tersedia' }, { name: '.xyz + Hosting', price: 550000, stock: 'Tersedia' }
    ]},
    { id: 7, name: 'Bot Multi Device', price: 35000, desc: 'Script bot WhatsApp MD dengan fitur modern dan stabil.', icon: 'fa-code-branch', category: 'script', badge: 'hot', variants: [
        { name: 'Bot MD Basic', price: 35000, stock: 'Tersedia' }, { name: 'Bot MD Premium', price: 75000, stock: 'Tersedia' }, { name: 'Custom Request', price: 0, stock: 'Hubungi' }
    ]},
    { id: 8, name: 'Bot RPG', price: 45000, desc: 'Script bot RPG dengan sistem game, inventory, dan leveling.', icon: 'fa-gamepad', category: 'script', variants: [
        { name: 'Bot RPG Basic', price: 45000, stock: 'Tersedia' }, { name: 'Bot RPG Full', price: 85000, stock: 'Tersedia' }, { name: 'Custom Request', price: 0, stock: 'Hubungi' }
    ]},
    { id: 9, name: 'Bot Jaga Group', price: 30000, desc: 'Bot keamanan grup dengan welcome, anti-link, dan auto respon.', icon: 'fa-users-cog', category: 'script', variants: [
        { name: 'Jaga Group Basic', price: 30000, stock: 'Tersedia' }, { name: 'Jaga Group + Pushkontak', price: 70000, stock: 'Tersedia' }, { name: 'Custom Request', price: 0, stock: 'Hubungi' }
    ]},
    { id: 10, name: 'Bot Downloader', price: 40000, desc: 'Bot convert media, downloader sosmed, dan pembuat sticker.', icon: 'fa-download', category: 'script', badge: 'new', variants: [
        { name: 'Downloader Basic', price: 40000, stock: 'Tersedia' }, { name: 'Convert + Sticker Full', price: 80000, stock: 'Tersedia' }, { name: 'Custom Request', price: 0, stock: 'Hubungi' }
    ]},
    { id: 11, name: 'Bot Auto AI', price: 50000, desc: 'Bot AI pintar untuk chat otomatis dan asisten virtual.', icon: 'fa-brain', category: 'script', badge: 'pro', variants: [
        { name: 'AI Basic', price: 50000, stock: 'Tersedia' }, { name: 'AI Premium', price: 95000, stock: 'Tersedia' }, { name: 'Custom Request', price: 0, stock: 'Hubungi' }
    ]},
    { id: 12, name: 'Bot Auto Order', price: 55000, desc: 'Bot WhatsApp dengan sistem pembayaran otomatis.', icon: 'fa-credit-card', category: 'script', variants: [
        { name: 'Auto Order Basic', price: 55000, stock: 'Tersedia' }, { name: 'Auto Order Premium', price: 99000, stock: 'Tersedia' }, { name: 'Custom Request', price: 0, stock: 'Hubungi' }
    ]},
    { id: 13, name: 'Topup All Game', price: 0, desc: 'Topup diamond, UC, dan voucher game favoritmu.', icon: 'fa-gamepad', category: 'topup', isTopup: true, variants: [{ name: 'Pilih Game', price: 0, stock: 'Tersedia' }] },
];

// ============================================================
//  STATE
// ============================================================
let cart = JSON.parse(localStorage.getItem('joellCart')) || [];
let wishlist = JSON.parse(localStorage.getItem('joellWishlist')) || [];
let orders = JSON.parse(localStorage.getItem('joellOrders')) || [];
let currentUser = JSON.parse(localStorage.getItem('joellUser')) || null;
let currentProductId = null;
let selectedVariant = null;
let activePromo = null;
let currentFilter = 'all';
let currentOrderChatId = null;
let isAdminLoggedIn = false;
let currentAdminChatId = null;
let logoClickCount = 0;

// ============================================================
//  FIREBASE REAL-TIME DATABASE INTEGRATION
// ============================================================
const _0x4f2a = ["QUl6YVN5RG9HNkdQQkRVUnZCQ3piT09TQ1FMSmtucnVGeXM0WEV3", "am9lbGwtc2hvcC1kYjNhNi5maXJlYmFzZWFwcC5jb20=", "am9lbGwtc2hvcC1kYjNhNg==", "am9lbGwtc2hvcC1kYjNhNi5maXJlYmFzZXN0b3JhZ2UuYXBw", "MTAxNjIzOTA2NjI0MA==", "MToxMDE2MjM5MDY2MjQwOndlYjoxODk4ZWM4MGU4OWU0NTg3MjRhYTY1", "aHR0cHM6Ly9qb2VsbC1zaG9wLWRiM2E2LWRlZmF1bHQtcnRkYi5hc2lhLXNvdXRoZWFzdDEuZmlyZWJhc2VkYXRhYmFzZS5hcHAv"];
const firebaseConfig = {
    apiKey: atob(_0x4f2a[0]),
    authDomain: atob(_0x4f2a[1]),
    projectId: atob(_0x4f2a[2]),
    storageBucket: atob(_0x4f2a[3]),
    messagingSenderId: atob(_0x4f2a[4]),
    appId: atob(_0x4f2a[5]),
    databaseURL: atob(_0x4f2a[6])
};

let db;
function initCloudSync() {
    const statusDot = document.getElementById('cloudStatusDot');
    const statusText = document.getElementById('cloudStatusText');
    
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        
        const connectedRef = db.ref(".info/connected");
        connectedRef.on("value", (snap) => {
            if (snap.val() === true) {
                if (statusDot) statusDot.style.background = 'var(--green)';
                if (statusText) statusText.textContent = 'Terhubung ke Cloud Database';
                console.log("Cloud Connected");
            } else {
                if (statusDot) statusDot.style.background = 'var(--red)';
                if (statusText) statusText.textContent = 'Terputus dari Cloud Database';
                console.log("Cloud Disconnected");
            }
        });

        db.ref('orders').on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const oldOrders = JSON.parse(JSON.stringify(orders));
                orders = data;
                localStorage.setItem('joellOrders', JSON.stringify(orders));
                
                renderOrdersList();
                if (isAdminLoggedIn) {
                    renderAdminOrders();
                    updateAdminStats();
                }
                if (currentOrderChatId) renderOrderChatMessages();
                if (currentAdminChatId) renderAdminChatMessages();
                updateUnreadBadges();
                
                if (document.hidden) {
                    orders.forEach(newOrder => {
                        const oldOrder = oldOrders.find(o => o.id === newOrder.id);
                        if (oldOrder && newOrder.chat && newOrder.chat.length > oldOrder.chat.length) {
                            const lastMsg = newOrder.chat[newOrder.chat.length - 1];
                            sendBrowserNotification(`Pesan Baru: #${newOrder.id}`, lastMsg.text || 'Mengirim file...', newOrder.id);
                        }
                    });
                }
            }
        });
    } catch (e) {
        console.error("Firebase Init Error:", e);
        if (statusDot) statusDot.style.background = 'var(--red)';
        if (statusText) statusText.textContent = 'Error: Konfigurasi Cloud Salah';
    }
}

function syncOrdersToCloud() {
    if (db) {
        db.ref('orders').set(orders).then(() => {
            console.log("Cloud Sync Success");
        }).catch(e => {
            console.error("Sync Error:", e);
            let errorMsg = 'Gagal kirim ke data cloud';
            if (e.code === 'PERMISSION_DENIED') {
                errorMsg = 'Izin Ditolak: Pastikan Firebase Rules sudah diatur ke true.';
            } else if (e.message.includes('disconnected')) {
                errorMsg = 'Koneksi Terputus: Cek internet Anda.';
            }
            showToast('Cloud Error', errorMsg, 'error', 5000);
        });
    }
}

initCloudSync();
updateUnreadBadges();

let bc;
try {
    bc = new BroadcastChannel('joell_shop_channel');
    bc.onmessage = (event) => {
        if (event.data.type === 'orders_updated' || event.data.type === 'chat_updated') {
            orders = JSON.parse(localStorage.getItem('joellOrders')) || [];
            renderOrdersList();
            if (isAdminLoggedIn) renderAdminOrders();
            if (currentOrderChatId === event.data.orderId) renderOrderChatMessages();
            if (currentAdminChatId === event.data.orderId) renderAdminChatMessages();
            
            if (document.hidden && event.data.type === 'chat_updated') {
                const order = orders.find(o => o.id === event.data.orderId);
                if (order && order.chat && order.chat.length > 0) {
                    const lastMsg = order.chat[order.chat.length - 1];
                    sendBrowserNotification(`Pesan Baru: #${event.data.orderId}`, lastMsg.text || 'Mengirim file...', event.data.orderId);
                }
            }
        }
    };
} catch(e) {}

function broadcastOrders() {
    syncOrdersToCloud();
    if (bc) bc.postMessage({ type: 'orders_updated' });
}
function broadcastChat(orderId) {
    syncOrdersToCloud();
    if (bc) bc.postMessage({ type: 'chat_updated', orderId });
    updateUnreadBadges();
}

function updateUnreadBadges() {
    if (!orders || !Array.isArray(orders)) return;
    
    let totalUnreadUser = 0;
    let totalUnreadAdmin = 0;

    orders.forEach(order => {
        if (!order.chat || !Array.isArray(order.chat)) return;
        const lastMsg = order.chat[order.chat.length - 1];
        if (!lastMsg) return;

        if (lastMsg.from === 'admin') {
            if (currentUser && order.userId === currentUser.id) {
                totalUnreadUser++;
            }
        } else if (lastMsg.from === 'user') {
            totalUnreadAdmin++;
        }
    });

    const navBadge = document.getElementById('navOrdersBadge');
    if (navBadge) {
        if (totalUnreadUser > 0) {
            navBadge.textContent = totalUnreadUser;
            navBadge.style.display = 'block';
        } else {
            navBadge.style.display = 'none';
        }
    }

    const adminBadge = document.getElementById('adminChatBadge');
    if (adminBadge) {
        if (totalUnreadAdmin > 0) {
            adminBadge.textContent = totalUnreadAdmin;
            adminBadge.style.display = 'block';
        } else {
            adminBadge.style.display = 'none';
        }
    }
}

// ============================================================
//  GOOGLE LOGIN
// ============================================================
function handleGoogleLogin(response) {
    const credential = response.credential;
    const payload = JSON.parse(atob(credential.split('.')[1]));
    currentUser = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        token: credential
    };
    localStorage.setItem('joellUser', JSON.stringify(currentUser));
    updateUserUI();
    document.getElementById('loginOverlay').classList.remove('open');
    showToast('Login Berhasil', `Selamat datang, ${currentUser.name}!`, 'success');
}

function openProfileSettings() {
    if (!currentUser) return;
    document.getElementById('profileNameInput').value = currentUser.name;
    document.getElementById('profileEmailInput').value = currentUser.email;
    document.getElementById('profilePreview').src = currentUser.picture;
    document.getElementById('profileOverlay').classList.add('open');
}

document.getElementById('profileCloseBtn').addEventListener('click', () => {
    document.getElementById('profileOverlay').classList.remove('open');
});

document.getElementById('profileLogoutBtn').addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        currentUser = null;
        localStorage.removeItem('joellUser');
        updateUserUI();
        document.getElementById('profileOverlay').classList.remove('open');
        showToast('Logout', 'Anda telah keluar', 'info');
    }
});

document.getElementById('profileSaveBtn').addEventListener('click', () => {
    const newName = document.getElementById('profileNameInput').value.trim();
    if (!newName) { showToast('Error', 'Nama tidak boleh kosong', 'error'); return; }
    currentUser.name = newName;
    localStorage.setItem('joellUser', JSON.stringify(currentUser));
    updateUserUI();
    renderProfilePage();
    if (currentOrderChatId) renderOrderChatMessages();
    document.getElementById('profileOverlay').classList.remove('open');
    showToast('Berhasil', 'Profil Anda telah diperbarui!', 'success');
});

function handleProfilePhotoUpload(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('Error', 'Ukuran file maksimal 2MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result;
        document.getElementById('profilePreview').src = base64;
        currentUser.picture = base64;
    };
    reader.readAsDataURL(file);
}

function updateUserUI() {
    const section = document.getElementById('userSection');
    if (currentUser) {
        section.innerHTML = `
            <div class="user-chip" id="userChip" title="${currentUser.name}">
                <img src="${currentUser.picture}" alt="avatar">
                <span class="user-name">${currentUser.name.split(' ')[0]}</span>
            </div>
        `;
        document.getElementById('userChip').addEventListener('click', openProfileSettings);
    } else {
        section.innerHTML = `
            <button class="header-btn" id="loginBtn" title="Login">
                <i class="fas fa-sign-in-alt"></i>
            </button>
        `;
        document.getElementById('loginBtn').addEventListener('click', () => {
            document.getElementById('loginOverlay').classList.add('open');
        });
    }
}

// ============================================================
//  THEME MANAGER
// ============================================================
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('joellTheme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('joellTheme', next);
    updateThemeIcon(next);
    showToast('Theme Changed', `Switched to ${next} mode`, 'info');
});

function updateThemeIcon(theme) {
    themeToggle.innerHTML = `<i class="fas fa-${theme === 'dark' ? 'sun' : 'moon'}"></i>`;
}

// ============================================================
//  PARTICLES BACKGROUND
// ============================================================
const pCanvas = document.getElementById('particlesCanvas');
const pCtx = pCanvas.getContext('2d');
let particles = [];

function resizeParticles() {
    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;
}
resizeParticles();
window.addEventListener('resize', resizeParticles);

class Particle {
    constructor() {
        this.x = Math.random() * pCanvas.width;
        this.y = Math.random() * pCanvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > pCanvas.width) this.x = 0;
        if (this.x < 0) this.x = pCanvas.width;
        if (this.y > pCanvas.height) this.y = 0;
        if (this.y < 0) this.y = pCanvas.height;
    }
    draw() {
        pCtx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
        pCtx.beginPath();
        pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        pCtx.fill();
    }
}

for (let i = 0; i < 50; i++) particles.push(new Particle());

function animateParticles() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ============================================================
//  TYPING EFFECT
// ============================================================
const typingTexts = ['Bot WhatsApp', 'Hosting Panel', 'Topup Game', 'Script Premium'];
let typingIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingElement = document.getElementById('typingText');

function typeEffect() {
    const current = typingTexts[typingIndex];
    if (isDeleting) {
        typingElement.textContent = current.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingElement.textContent = current.substring(0, charIndex + 1);
        charIndex++;
    }
    let speed = isDeleting ? 50 : 100;
    if (!isDeleting && charIndex === current.length) {
        speed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        typingIndex = (typingIndex + 1) % typingTexts.length;
        speed = 500;
    }
    setTimeout(typeEffect, speed);
}
typeEffect();

// ============================================================
//  COUNTDOWN TIMER
// ============================================================
function updateCountdown() {
    const now = new Date();
    const diff = CONFIG.flashSaleEnd - now;
    if (diff <= 0) {
        document.getElementById('flashSaleBar').style.display = 'none';
        return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById('cdHours').textContent = String(h).padStart(2, '0');
    document.getElementById('cdMinutes').textContent = String(m).padStart(2, '0');
    document.getElementById('cdSeconds').textContent = String(s).padStart(2, '0');
}
setInterval(updateCountdown, 1000);
updateCountdown();

// ============================================================
//  TOAST SYSTEM
// ============================================================
function showToast(title, message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-circle' };
    toast.innerHTML = `
        <div class="toast-icon ${type}"><i class="fas ${icons[type] || icons.info}"></i></div>
        <div class="toast-content"><h4>${title}</h4><p>${message}</p></div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============================================================
//  PROMO CODE
// ============================================================
document.getElementById('promoBtn').addEventListener('click', () => {
    const code = document.getElementById('promoInput').value.trim().toUpperCase();
    const msgEl = document.getElementById('promoMessage');
    if (!code) { msgEl.textContent = 'Masukkan kode promo'; msgEl.className = 'promo-message error'; return; }
    if (CONFIG.promoCodes[code]) {
        activePromo = { code, ...CONFIG.promoCodes[code] };
        msgEl.textContent = `✅ ${activePromo.desc} berhasil diterapkan!`;
        msgEl.className = 'promo-message success';
        showToast('Promo Applied', activePromo.desc, 'success');
        updateCartUI();
    } else {
        activePromo = null;
        msgEl.textContent = '❌ Kode promo tidak valid';
        msgEl.className = 'promo-message error';
    }
});

// ============================================================
//  SERVER STATUS REFRESH
// ============================================================
document.getElementById('refreshStatus').addEventListener('click', function() {
    this.classList.add('spinning');
    setTimeout(() => {
        this.classList.remove('spinning');
        const pings = document.querySelectorAll('.server-ping');
        pings.forEach(p => {
            const newPing = Math.floor(Math.random() * 100) + 5;
            p.textContent = newPing + 'ms';
            p.style.color = newPing > 80 ? 'var(--orange)' : 'var(--green)';
        });
        showToast('Server Status', 'Status server diperbarui', 'success');
    }, 1000);
});

// ============================================================
//  RENDER FUNCTIONS
// ============================================================
function renderTopupGames() {
    const grid = document.getElementById('topupGrid');
    if (!grid) return;
    grid.innerHTML = topupGames.map(g => `
        <div class="topup-item" onclick="window.open('${g.url}', '_blank')">
            <img src="${g.logo}" alt="${g.name}" loading="lazy">
            <span>${g.name}</span>
        </div>
    `).join('');
}

function renderMenus() {
    const hostingGrid = document.getElementById('gridHosting');
    const scriptGrid = document.getElementById('gridScript');
    const topupGrid = document.getElementById('gridTopup');
    
    if (hostingGrid) hostingGrid.innerHTML = renderMenuCards(products.filter(p => p.category === 'hosting'));
    if (scriptGrid) scriptGrid.innerHTML = renderMenuCards(products.filter(p => p.category === 'script'));
    if (topupGrid) topupGrid.innerHTML = renderMenuCards(products.filter(p => p.category === 'topup'));
}

function renderMenuCards(productList) {
    return productList.map(p => {
        const badgeHtml = p.badge ? `<span class="card-badge ${p.badge}">${p.badge.toUpperCase()}</span>` : '';
        return `
            <div class="menu-card" data-id="${p.id}" data-topup="${p.isTopup||false}" data-anime="${p.isAnime||false}" data-bot="${p.isBotController||false}" data-osint="${p.isOsint||false}" data-ssweb="${p.isSsweb||false}" data-upload="${p.isUpload||false}" data-downloader="${p.isDownloader||false}">
                ${badgeHtml}
                <i class="fas ${p.icon}"></i>
                <span>${p.name}</span>
            </div>
        `;
    }).join('');
}

// ============================================================
//  CART FUNCTIONS
// ============================================================
function updateCartUI() {
    const count = cart.reduce((a, i) => a + i.qty, 0);
    const navBadge = document.getElementById('navCartBadge');
    const totalBadge = document.getElementById('cartBadgeTotal');
    if (navBadge) navBadge.textContent = count;
    if (totalBadge) totalBadge.textContent = count;
    
    const container = document.getElementById('cartItems');
    const footer = document.getElementById('cartFooter');

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-bag"></i>
                <h3>Keranjang kosong</h3>
                <p>Yuk, isi dengan produk favoritmu!</p>
            </div>`;
        if (footer) footer.style.display = 'none';
        return;
    }
    if (footer) footer.style.display = 'block';
    
    let subtotal = 0;
    container.innerHTML = cart.map((item, idx) => {
        const sub = item.price * item.qty;
        subtotal += sub;
        const priceText = item.price === 0 ? 'Hubungi Admin' : 'Rp ' + sub.toLocaleString();
        return `
            <div class="cart-item" data-index="${idx}">
                <div class="item-icon"><i class="fas ${item.icon || 'fa-box'}"></i></div>
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-variant">${item.variant}</div>
                    <div class="item-price">${priceText}</div>
                </div>
                <div class="item-actions">
                    <div class="qty-control">
                        <button onclick="updateQty(${idx}, -1)"><i class="fas fa-minus"></i></button>
                        <span class="qty-num">${item.qty}</span>
                        <button onclick="updateQty(${idx}, 1)"><i class="fas fa-plus"></i></button>
                    </div>
                    <button class="item-remove" onclick="removeItem(${idx})"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    }).join('');

    let discount = 0;
    if (activePromo) {
        if (activePromo.type === 'percent') {
            discount = Math.min(subtotal * activePromo.discount, activePromo.max || Infinity);
        } else {
            discount = activePromo.discount;
        }
    }
    const total = Math.max(0, subtotal - discount);

    const subtotalEl = document.getElementById('cartSubtotal');
    const discountEl = document.getElementById('cartDiscount');
    const shippingEl = document.getElementById('cartShipping');
    const totalEl = document.getElementById('cartTotalDisplay');
    
    if (subtotalEl) subtotalEl.textContent = 'Rp ' + subtotal.toLocaleString();
    if (discountEl) discountEl.textContent = discount > 0 ? '- Rp ' + discount.toLocaleString() : 'Rp 0';
    if (shippingEl) shippingEl.textContent = 'Rp 0';
    if (totalEl) totalEl.textContent = 'Rp ' + total.toLocaleString();
    
    localStorage.setItem('joellCart', JSON.stringify(cart));
}

function updateQty(idx, delta) {
    if (!cart[idx]) return;
    if (cart[idx].qty + delta < 1) {
        removeItem(idx);
        return;
    }
    cart[idx].qty += delta;
    updateCartUI();
}

function removeItem(idx) {
    cart.splice(idx, 1);
    updateCartUI();
    showToast('Keranjang', 'Item dihapus', 'info');
}

function addToCart(productId, variantName, variantPrice) {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    const existing = cart.find(c => c.id === productId && c.variant === variantName);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id: p.id, name: p.name, price: variantPrice, variant: variantName, qty: 1, icon: p.icon || 'fa-box' });
    }
    localStorage.setItem('joellCart', JSON.stringify(cart));
    updateCartUI();
    showToast('Keranjang', `${p.name} ditambahkan!`, 'success');
}

document.getElementById('clearCartBtn').addEventListener('click', () => {
    if (!cart.length) return;
    if (confirm('Kosongkan keranjang?')) {
        cart = [];
        activePromo = null;
        document.getElementById('promoInput').value = '';
        document.getElementById('promoMessage').textContent = '';
        updateCartUI();
        showToast('Keranjang', 'Keranjang dikosongkan', 'info');
    }
});

// ============================================================
//  DETAIL MODAL
// ============================================================
function openDetail(productId) {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    currentProductId = p.id;
    selectedVariant = p.variants[0];
    document.getElementById('detailName').textContent = p.name;
    document.getElementById('detailPrice').textContent = 'Rp ' + (p.variants[0].price || 0).toLocaleString();
    document.getElementById('detailDesc').textContent = p.desc;
    const list = document.getElementById('variantList');
    list.innerHTML = p.variants.map((v, i) => {
        const priceText = v.price === 0 ? 'Hubungi Admin' : 'Rp ' + v.price.toLocaleString();
        const stockClass = v.stock === 'Limited' ? 'style="color:var(--orange)"' : v.stock === 'Hubungi' ? 'style="color:var(--accent-light)"' : '';
        return `
            <div class="variant-item ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="selectVariant(this, ${i})">
                <span class="vname">${v.name}</span>
                <span class="vprice">${priceText}</span>
                <span class="vstock" ${stockClass}><i class="fas fa-check-circle"></i> ${v.stock}</span>
            </div>
        `;
    }).join('');
    document.getElementById('detailOverlay').classList.add('open');
}

function selectVariant(el, index) {
    document.querySelectorAll('.variant-item').forEach(v => v.classList.remove('active'));
    el.classList.add('active');
    const p = products.find(x => x.id === currentProductId);
    selectedVariant = p.variants[index];
    const priceText = selectedVariant.price === 0 ? 'Hubungi Admin' : 'Rp ' + selectedVariant.price.toLocaleString();
    document.getElementById('detailPrice').textContent = priceText;
}

document.getElementById('addToCartBtn').addEventListener('click', () => {
    if (!selectedVariant) { showToast('Error', 'Pilih varian dulu', 'error'); return; }
    addToCart(currentProductId, selectedVariant.name, selectedVariant.price);
    document.getElementById('detailOverlay').classList.remove('open');
});

document.getElementById('buyNowBtn').addEventListener('click', () => {
    if (!selectedVariant) { showToast('Error', 'Pilih varian dulu', 'error'); return; }
    addToCart(currentProductId, selectedVariant.name, selectedVariant.price);
    document.getElementById('detailOverlay').classList.remove('open');
    document.getElementById('cartOverlay').classList.add('open');
});

// ============================================================
//  CHECKOUT SYSTEM
// ============================================================
document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (!cart.length) { showToast('Error', 'Keranjang kosong', 'error'); return; }
    if (!currentUser) {
        showToast('Login Diperlukan', 'Silakan login untuk checkout', 'warning');
        document.getElementById('loginOverlay').classList.add('open');
        return;
    }
    const container = document.getElementById('checkoutItems');
    let total = 0;
    container.innerHTML = cart.map(item => {
        const sub = item.price * item.qty;
        total += sub;
        return `<div class="order-item-line">${item.name} (${item.variant}) x${item.qty} = Rp ${sub.toLocaleString()}</div>`;
    }).join('');
    document.getElementById('checkoutTotal').textContent = 'Total: Rp ' + total.toLocaleString();
    document.getElementById('coName').value = currentUser.name || '';
    document.getElementById('coEmail').value = currentUser.email || '';
    document.getElementById('cartOverlay').classList.remove('open');
    document.getElementById('checkoutOverlay').classList.add('open');
});

// Checkout form submission
if (document.getElementById('checkoutForm')) {
    document.getElementById('checkoutForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (!cart.length) return;
        
        const orderId = 'JOELL-' + Math.random().toString(36).substr(2, 4).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
        const total = cart.reduce((a, i) => a + i.price * i.qty, 0);
        
        const order = {
            id: orderId,
            userId: currentUser ? currentUser.id : 'guest',
            userName: document.getElementById('coName').value,
            userEmail: document.getElementById('coEmail').value,
            userPhone: document.getElementById('coPhone').value,
            address: document.getElementById('coAddress').value,
            payment: 'online',
            items: [...cart],
            total: total,
            status: 'pending',
            statusLabel: 'Menunggu Pembayaran',
            createdAt: new Date().toISOString(),
            timeline: [
                { step: 'Menunggu Pembayaran', desc: 'Silakan selesaikan pembayaran', time: '-', completed: false },
                { step: 'Pembayaran Diverifikasi', desc: 'Menunggu konfirmasi pembayaran', time: '-', completed: false },
                { step: 'Sedang Diproses', desc: 'Tim menyiapkan pesanan Anda', time: '-', completed: false },
                { step: 'Pesanan Selesai', desc: 'Detail produk dikirim ke akun Anda', time: '-', completed: false }
            ],
            chat: [
                { 
                    from: 'admin', 
                    text: `Halo ${document.getElementById('coName').value}! Terima kasih telah memesan. Silakan selesaikan pembayaran Anda.`,
                    time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) 
                }
            ]
        };
        
        orders.unshift(order);
        localStorage.setItem('joellOrders', JSON.stringify(orders));
        broadcastOrders();
        
        cart = [];
        activePromo = null;
        localStorage.setItem('joellCart', JSON.stringify(cart));
        updateCartUI();
        
        document.getElementById('checkoutOverlay').classList.remove('open');
        
        // Buka payment modal
        if (typeof openPaymentModal === 'function') {
            openPaymentModal(order);
        } else {
            showToast('Pesanan Dibuat', `ID: ${orderId}. Selesaikan pembayaran.`, 'success', 5000);
            navigateTo('orders');
            setTimeout(() => openOrderChat(orderId), 500);
        }
        renderOrdersList();
    });
}

// ============================================================
//  ORDERS & TRACKING
// ============================================================
function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Berhasil', `${label} berhasil disalin!`, 'success', 2000);
    }).catch(() => {
        showToast('Gagal', 'Gagal menyalin teks', 'error');
    });
}

function getRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    return new Date(timestamp).toLocaleDateString('id-ID');
}

function renderOrdersList() {
    const container = document.getElementById('ordersListContainer');
    if (!container) return;
    
    const myOrders = currentUser ? orders.filter(o => o.userId === currentUser.id) : [];

    if (!myOrders.length) {
        container.innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-box-open"></i>
                <h3>Belum ada pesanan</h3>
                <p>Yuk mulai berbelanja!</p>
            </div>`;
        return;
    }

    const statusClass = {
        'pending': 'pending',
        'read': 'read',
        'processing': 'processing',
        'shipped': 'shipped',
        'completed': 'completed'
    };
    const statusLabel = {
        'pending': 'Menunggu',
        'read': 'Dibaca',
        'processing': 'Diproses',
        'shipped': 'Dikirim',
        'completed': 'Selesai'
    };

    function getUnreadCount(order) {
        if (!order.chat || !Array.isArray(order.chat) || order.chat.length === 0) return 0;
        let count = 0;
        for (let i = order.chat.length - 1; i >= 0; i--) {
            if (order.chat[i].from === 'admin') {
                count++;
            } else {
                break;
            }
        }
        return count;
    }

    container.innerHTML = '<div class="orders-list">' + myOrders.map(o => {
        const itemsText = o.items.map(i => `${i.name} (${i.variant})`).join(', ');
        const unreadCount = getUnreadCount(o);
        const unreadBadge = unreadCount > 0 
            ? `<span class="order-msg-badge"><span class="msg-dot"></span><i class="fas fa-comment-alt"></i> ${unreadCount} PESAN BARU</span>` 
            : '';
        return `
            <div class="order-card" onclick="openOrderChat('${o.id}')">
                <div class="order-card-header">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span class="order-id">#${o.id}</span>
                        <button onclick="event.stopPropagation(); copyToClipboard('${o.id}', 'ID Pesanan')" style="background:rgba(99,102,241,0.1);color:var(--accent-light);border:none;width:24px;height:24px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:0.2s;" title="Salin ID">
                            <i class="far fa-copy" style="font-size:0.75rem;"></i>
                        </button>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span class="order-status ${statusClass[o.status] || 'pending'}">${statusLabel[o.status] || o.status}</span>
                        <button onclick="event.stopPropagation(); deleteOrder('${o.id}')" style="background:rgba(239,68,68,0.1);color:var(--red);border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:0.2s;" title="Hapus Riwayat">
                            <i class="fas fa-trash-alt" style="font-size:0.8rem;"></i>
                        </button>
                    </div>
                </div>
                <div class="order-products">${itemsText}</div>
                ${unreadBadge}
                <div class="order-meta">
                    <div style="display:flex;flex-direction:column;gap:2px;">
                        <span class="realtime-time" data-time="${o.createdAt}" style="font-weight:600;color:var(--text-primary);">${getRelativeTime(o.createdAt)}</span>
                        <span style="font-size:0.7rem;color:var(--text-muted);">${new Date(o.createdAt).toLocaleString('id-ID', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
                    </div>
                    <span class="order-total">Rp ${o.total.toLocaleString()}</span>
                </div>
            </div>
        `;
    }).join('') + '</div>';
}

function deleteOrder(orderId) {
    Swal.fire({
        title: 'Hapus Riwayat?',
        text: "Data pesanan ini akan dihapus permanen dari riwayat Anda.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#374151',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
        background: '#1f2937',
        color: '#fff'
    }).then((result) => {
        if (result.isConfirmed) {
            orders = orders.filter(o => o.id !== orderId);
            localStorage.setItem('joellOrders', JSON.stringify(orders));
            broadcastOrders();
            renderOrdersList();
            if (isAdminLoggedIn) {
                renderAdminOrders();
                updateAdminStats();
            }
            showToast('Dihapus', 'Riwayat pesanan berhasil dihapus', 'success');
        }
    });
}

function openOrderChat(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    currentOrderChatId = orderId;
    document.getElementById('orderChatOrderId').textContent = 'Order: #' + orderId;
    renderOrderChatMessages();
    document.getElementById('orderChatOverlay').classList.add('open');
}

function renderOrderChatMessages() {
    const order = orders.find(o => o.id === currentOrderChatId);
    if (!order) return;
    const container = document.getElementById('orderChatMessages');
    if (!container) return;
    
    container.innerHTML = order.chat.map(c => {
        const isAdmin = c.from === 'admin';
        const payBtnHtml = c.paymentBtn ? `<a href="https://joell-payment.vercel.app" target="_blank" class="chat-payment-btn"><i class="fas fa-credit-card"></i> PAYMENT</a>` : '';
        const imgHtml = c.image ? `
            <div class="chat-img-container">
                <img src="${c.image}" alt="chat-img" onclick="window.open('${c.image}', '_blank')">
                <a href="${c.image}" download="image_${Date.now()}.png" target="_blank" class="chat-download-overlay" title="Download Gambar">
                    <i class="fas fa-download"></i>
                </a>
            </div>` : '';
        const fileHtml = c.file ? `
            <div class="chat-file-box">
                <i class="fas fa-file-alt file-icon"></i>
                <div class="file-info">
                    <div class="file-name">${c.fileName || 'File Terlampir'}</div>
                    <a href="${c.file}" download="${c.fileName || 'file'}" target="_blank" class="file-download-link">
                        <i class="fas fa-cloud-download-alt"></i> Download
                    </a>
                </div>
            </div>` : '';
        
        const avatar = isAdmin ? 
            `<div class="chat-avatar" style="background:var(--accent);"><i class="fas fa-robot"></i></div>` : 
            `<div class="chat-avatar" style="background:var(--purple);">${currentUser ? currentUser.name.charAt(0) : 'U'}</div>`;

        return `
            <div class="chat-row ${isAdmin ? 'admin-row' : 'user-row'}">
                ${avatar}
                <div class="msg ${isAdmin ? 'admin' : 'user'}">
                    ${c.text || ''}
                    ${payBtnHtml}
                    ${imgHtml}
                    ${fileHtml}
                    <span class="time">${c.time}</span>
                </div>
            </div>
        `;
    }).join('');
    container.scrollTop = container.scrollHeight;
}

document.getElementById('orderChatSend').addEventListener('click', () => {
    const input = document.getElementById('orderChatInput');
    const text = input.value.trim();
    if (!text || !currentOrderChatId) return;
    const order = orders.find(o => o.id === currentOrderChatId);
    if (!order) return;
    
    order.chat.push({
        from: 'user',
        text: text,
        time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})
    });
    localStorage.setItem('joellOrders', JSON.stringify(orders));
    broadcastChat(currentOrderChatId);
    input.value = '';
    renderOrderChatMessages();
    
    setTimeout(() => {
        order.chat.push({
            from: 'admin',
            text: 'Terima kasih! Admin akan membalas secepatnya. Mohon ditunggu ya.',
            time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})
        });
        localStorage.setItem('joellOrders', JSON.stringify(orders));
        broadcastChat(currentOrderChatId);
        if (document.getElementById('orderChatOverlay').classList.contains('open')) {
            renderOrderChatMessages();
        }
    }, 2000);
});

document.getElementById('orderChatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('orderChatSend').click();
});

// ============================================================
//  TRACKING
// ============================================================
document.getElementById('trackBtn').addEventListener('click', () => {
    const input = document.getElementById('trackInput').value.trim();
    if (!input) { showToast('Error', 'Masukkan ID pesanan', 'error'); return; }
    
    const order = orders.find(o => o.id === input.replace('#', ''));
    if (!order) {
        showToast('Tidak Ditemukan', 'ID pesanan tidak valid', 'error');
        return;
    }
    
    document.getElementById('trackOrderId').textContent = '#' + order.id;
    const statusConfig = {
        'pending': { label: 'Menunggu', color: 'var(--gold)', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.2)' },
        'read': { label: 'Dibaca Admin', color: 'var(--accent-light)', bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.2)' },
        'processing': { label: 'Sedang Diproses', color: 'var(--accent-secondary)', bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.2)' },
        'shipped': { label: 'Dikirim', color: 'var(--purple)', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.2)' },
        'completed': { label: 'Selesai', color: 'var(--green)', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.2)' }
    };
    const cfg = statusConfig[order.status] || statusConfig['pending'];
    const badge = document.getElementById('trackStatusBadge');
    badge.innerHTML = `<i class="fas fa-circle"></i> ${cfg.label}`;
    badge.style.background = cfg.bg;
    badge.style.color = cfg.color;
    badge.style.border = `1px solid ${cfg.border}`;
    
    document.getElementById('trackProducts').textContent = order.items.map(i => `${i.name} (${i.variant}) x${i.qty}`).join(', ');
    document.getElementById('trackDate').textContent = new Date(order.createdAt).toLocaleString('id-ID');
    
    const timeline = document.getElementById('trackingTimeline');
    timeline.innerHTML = order.timeline.map((t, i) => {
        const isCompleted = t.completed;
        const isActive = !t.completed && (i === 0 || order.timeline[i-1].completed);
        return `
            <div class="tracking-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}">
                <div class="tracking-dot">${isCompleted ? '<i class="fas fa-check"></i>' : (isActive ? '<i class="fas fa-circle"></i>' : '<i class="fas fa-clock"></i>')}</div>
                <div class="tracking-info">
                    <h4>${t.step}</h4>
                    <p>${t.desc}</p>
                    <div class="time">${t.time}</div>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('trackChatBtn').onclick = () => {
        document.getElementById('trackResult').style.display = 'none';
        openOrderChat(order.id);
    };
    
    document.getElementById('trackResult').style.display = 'block';
    showToast('Tracking', 'Data pesanan ditemukan', 'success');
});

// ============================================================
//  ADMIN PANEL SYSTEM
// ============================================================
document.getElementById('logoArea').addEventListener('click', () => {
    logoClickCount++;
    if (logoClickCount >= 5) {
        logoClickCount = 0;
        enterAdminMode();
    }
    setTimeout(() => { if (logoClickCount > 0) logoClickCount--; }, 2000);
});

function enterAdminMode() {
    localStorage.setItem('joellCurrentPage', 'admin');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-admin').classList.add('active');
    document.getElementById('bottomNav').style.display = 'none';
    document.getElementById('adminLoginView').style.display = 'block';
    document.getElementById('adminDashboardView').style.display = 'none';
    window.scrollTo(0,0);
}

document.getElementById('adminBackBtn').addEventListener('click', () => {
    localStorage.removeItem('joellCurrentPage');
    document.getElementById('page-admin').classList.remove('active');
    document.getElementById('page-home').classList.add('active');
    document.getElementById('bottomNav').style.display = 'flex';
    isAdminLoggedIn = false;
});

document.getElementById('adminLoginBtn').addEventListener('click', () => {
    const input = document.getElementById('adminPasswordInput').value;
    if (input === CONFIG.adminPassword) {
        isAdminLoggedIn = true;
        document.getElementById('adminLoginView').style.display = 'none';
        document.getElementById('adminDashboardView').style.display = 'block';
        showToast('Admin', 'Login berhasil! Selamat datang, Admin.', 'success');
        renderAdminOrders();
        updateAdminStats();
    } else {
        showToast('Error', 'Password salah!', 'error');
    }
});

document.getElementById('adminPasswordInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('adminLoginBtn').click();
});

function updateAdminStats() {
    document.getElementById('adminStatTotal').textContent = orders.length;
    document.getElementById('adminStatPending').textContent = orders.filter(o => o.status === 'pending').length;
    document.getElementById('adminStatProcessing').textContent = orders.filter(o => o.status === 'processing').length;
    document.getElementById('adminStatCompleted').textContent = orders.filter(o => o.status === 'completed').length;
}

function refreshAdminOrders() {
    const btn = document.getElementById('btnRefreshAdmin');
    if (btn) btn.querySelector('i').classList.add('fa-spin');
    
    if (db) {
        db.ref('orders').once('value').then((snapshot) => {
            const data = snapshot.val();
            if (data) {
                orders = data;
                localStorage.setItem('joellOrders', JSON.stringify(orders));
                renderAdminOrders();
                updateAdminStats();
                showToast('Berhasil', 'Data pesanan diperbarui!', 'success', 2000);
            }
        }).finally(() => {
            if (btn) btn.querySelector('i').classList.remove('fa-spin');
        });
    } else {
        showToast('Error', 'Database tidak terhubung', 'error');
        if (btn) btn.querySelector('i').classList.remove('fa-spin');
    }
}

function renderAdminOrders() {
    const container = document.getElementById('adminOrdersList');
    if (!container) return;
    
    if (!orders.length) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">Belum ada pesanan</p>';
        return;
    }
    const statusOptions = {
        'pending': 'Menunggu',
        'read': 'Dibaca',
        'processing': 'Diproses',
        'shipped': 'Dikirim',
        'completed': 'Selesai'
    };
    container.innerHTML = orders.map(o => {
        const itemsText = o.items.map(i => `${i.name} (${i.variant}) x${i.qty}`).join(', ');
        return `
            <div class="admin-order-item">
                <div class="admin-order-header">
                    <span class="admin-order-id">#${o.id}</span>
                    <select class="admin-status-select" onchange="updateOrderStatus('${o.id}', this.value)">
                        ${Object.entries(statusOptions).map(([k,v]) => `<option value="${k}" ${o.status===k?'selected':''}>${v}</option>`).join('')}
                    </select>
                </div>
                <div class="admin-order-meta">
                    <strong>${o.userName}</strong> · ${o.userEmail} · ${o.userPhone || '-'} · ${o.payment}
                </div>
                <div class="admin-order-products">${itemsText}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div style="display:flex;flex-direction:column;gap:2px;">
                        <span style="font-weight:800;color:var(--accent-light);">Rp ${o.total.toLocaleString()}</span>
                        <div style="display:flex;flex-direction:column;gap:0px;">
                            <span class="realtime-time" data-time="${o.createdAt}" style="font-size:0.75rem;color:var(--text-primary);font-weight:600;">${getRelativeTime(o.createdAt)}</span>
                            <span style="font-size:0.65rem;color:var(--text-muted);">${new Date(o.createdAt).toLocaleString('id-ID', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button onclick="deleteOrder('${o.id}')" style="background:rgba(239,68,68,0.1);color:var(--red);border:1px solid rgba(239,68,68,0.2);padding:8px 12px;border-radius:6px;cursor:pointer;font-size:0.85rem;display:flex;align-items:center;gap:6px;">
                            <i class="fas fa-trash-alt"></i> Hapus
                        </button>
                        <button class="admin-chat-btn" onclick="openAdminChat('${o.id}')" style="position:relative;">
                            <i class="fas fa-comments"></i> Balas Chat
                            ${(o.chat && o.chat.length > 0 && o.chat[o.chat.length-1].from === 'user') ? '<span style="position:absolute;top:-8px;right:-8px;background:var(--red);color:#fff;width:18px;height:18px;border-radius:50%;font-size:0.65rem;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(239,68,68,0.5);border:2px solid var(--bg-card-solid);">!</span>' : ''}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    order.status = newStatus;
    order.statusLabel = {pending:'Menunggu',read:'Dibaca',processing:'Diproses',shipped:'Dikirim',completed:'Selesai'}[newStatus];
    if (newStatus === 'read' && order.timeline[1]) { order.timeline[1].completed = true; order.timeline[1].time = new Date().toLocaleString('id-ID'); }
    if (newStatus === 'processing' && order.timeline[2]) { order.timeline[2].completed = true; order.timeline[2].time = new Date().toLocaleString('id-ID'); }
    if (newStatus === 'completed' && order.timeline[3]) { order.timeline[3].completed = true; order.timeline[3].time = new Date().toLocaleString('id-ID'); }
    
    localStorage.setItem('joellOrders', JSON.stringify(orders));
    broadcastOrders();
    updateAdminStats();
    showToast('Status Updated', `Order #${orderId} → ${order.statusLabel}`, 'success');
}

function openAdminChat(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    currentAdminChatId = orderId;
    document.getElementById('adminChatUserName').textContent = order.userName;
    document.getElementById('adminChatOrderId').textContent = 'Order: #' + orderId;
    
    const userImg = document.getElementById('adminChatUserImg');
    if (userImg) {
        userImg.innerHTML = `<img src="https://ui-avatars.com/api/?name=${encodeURIComponent(order.userName)}&background=random" style="width:100%;height:100%;border-radius:50%;">`;
    }

    if (order.chat.length > 0 && order.chat[order.chat.length - 1].from === 'user') {
        broadcastChat(orderId);
    }

    renderAdminChatMessages();
    document.getElementById('adminChatOverlay').classList.add('open');
    updateUnreadBadges();
}

function renderAdminChatMessages() {
    const order = orders.find(o => o.id === currentAdminChatId);
    if (!order) return;
    const container = document.getElementById('adminChatMessages');
    if (!container) return;
    
    container.innerHTML = order.chat.map(c => {
        const isAdmin = c.from === 'admin';
        const payBtnHtml = c.paymentBtn ? `<a href="https://joell-payment.vercel.app" target="_blank" class="chat-payment-btn"><i class="fas fa-credit-card"></i> PAYMENT</a>` : '';
        const imgHtml = c.image ? `
            <div class="chat-img-container">
                <img src="${c.image}" alt="chat-img" onclick="window.open('${c.image}', '_blank')">
                <a href="${c.image}" download="image_${Date.now()}.png" target="_blank" class="chat-download-overlay" title="Download Gambar">
                    <i class="fas fa-download"></i>
                </a>
            </div>` : '';
        const fileHtml = c.file ? `
            <div class="chat-file-box">
                <i class="fas fa-file-alt file-icon"></i>
                <div class="file-info">
                    <div class="file-name">${c.fileName || 'File Terlampir'}</div>
                    <a href="${c.file}" download="${c.fileName || 'file'}" target="_blank" class="file-download-link">
                        <i class="fas fa-cloud-download-alt"></i> Download
                    </a>
                </div>
            </div>` : '';

        const avatar = isAdmin ? 
            `<div class="chat-avatar" style="background:var(--accent);"><i class="fas fa-robot"></i></div>` : 
            `<div class="chat-avatar" style="background:var(--purple);">${order.userName.charAt(0)}</div>`;

        return `
            <div class="chat-row ${isAdmin ? 'user-row' : 'admin-row'}">
                ${avatar}
                <div class="msg ${isAdmin ? 'user' : 'admin'}">
                    ${c.text || ''}
                    ${payBtnHtml}
                    ${imgHtml}
                    ${fileHtml}
                    <span class="time">${c.time}</span>
                </div>
            </div>
        `;
    }).join('');
    container.scrollTop = container.scrollHeight;
}

async function handleAdminDocUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    const orderId = currentAdminChatId;
    if (!orderId) {
        showToast('Error', 'ID Pesanan tidak ditemukan. Silakan buka chat ulang.', 'error');
        input.value = '';
        return;
    }
    
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        showToast('Error', 'Data pesanan tidak ditemukan.', 'error');
        input.value = '';
        return;
    }

    if (file.size <= 500 * 1024) {
        showToast('Admin', 'Mengkonversi file ke base64...', 'info');
        try {
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64 = e.target.result;
                const newMessage = {
                    from: 'admin',
                    text: `📄 File: ${file.name}`,
                    file: base64,
                    fileName: file.name,
                    time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})
                };
                
                if (!orders[orderIndex].chat) orders[orderIndex].chat = [];
                orders[orderIndex].chat.push(newMessage);
                
                localStorage.setItem('joellOrders', JSON.stringify(orders));
                broadcastChat(orderId);
                renderAdminChatMessages();
                showToast('Berhasil', 'File berhasil dikirim (Base64)!', 'success');
            };
            reader.onerror = function() {
                showToast('Error', 'Gagal membaca file.', 'error');
            };
            reader.readAsDataURL(file);
        } catch (err) {
            showToast('Error', 'Gagal memproses file: ' + err.message, 'error');
        } finally {
            input.value = '';
        }
        return;
    }

    if (file.size > 20 * 1024 * 1024) {
        showToast('Error', 'File terlalu besar. Maksimal 20MB untuk upload eksternal.', 'error');
        input.value = '';
        return;
    }

    showToast('Admin', 'Sedang mengupload file ke server...', 'info');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const response = await fetch('https://file.io/?expires=1w&autoDelete=false', {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success || result.link) {
            const fileUrl = result.link || result.url || result.file;
            if (!fileUrl) throw new Error('URL file tidak ditemukan dalam response.');
            
            const newMessage = {
                from: 'admin',
                text: `📄 File: ${file.name}`,
                file: fileUrl,
                fileName: file.name,
                time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})
            };
            
            if (!orders[orderIndex].chat) orders[orderIndex].chat = [];
            orders[orderIndex].chat.push(newMessage);
            
            localStorage.setItem('joellOrders', JSON.stringify(orders));
            broadcastChat(orderId);
            renderAdminChatMessages();
            showToast('Berhasil', 'File berhasil dikirim!', 'success');
        } else {
            throw new Error(result.message || 'Gagal mengunggah file ke server.');
        }
    } catch (error) {
        console.error("File Upload Error:", error);
        
        if (file.size <= 2 * 1024 * 1024) {
            showToast('Info', 'Server upload gagal, mencoba base64 fallback...', 'warning');
            try {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const base64 = e.target.result;
                    const newMessage = {
                        from: 'admin',
                        text: `📄 File: ${file.name}`,
                        file: base64,
                        fileName: file.name,
                        time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})
                    };
                    
                    if (!orders[orderIndex].chat) orders[orderIndex].chat = [];
                    orders[orderIndex].chat.push(newMessage);
                    
                    localStorage.setItem('joellOrders', JSON.stringify(orders));
                    broadcastChat(orderId);
                    renderAdminChatMessages();
                    showToast('Berhasil', 'File berhasil dikirim (Base64 Fallback)!', 'success');
                };
                reader.readAsDataURL(file);
            } catch (fbErr) {
                showToast('Error', 'Fallback juga gagal: ' + fbErr.message, 'error');
            }
        } else {
            showToast('Error', 'Gagal upload: ' + error.message + '. File >2MB tidak bisa fallback ke base64.', 'error', 5000);
        }
    } finally {
        input.value = '';
    }
}

document.getElementById('adminChatSend').addEventListener('click', () => {
    const input = document.getElementById('adminChatInput');
    const text = input.value.trim();
    if (!text || !currentAdminChatId) return;
    const order = orders.find(o => o.id === currentAdminChatId);
    if (!order) return;
    order.chat.push({
        from: 'admin',
        text: text,
        time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})
    });
    localStorage.setItem('joellOrders', JSON.stringify(orders));
    broadcastChat(currentAdminChatId);
    input.value = '';
    renderAdminChatMessages();
    showToast('Chat', 'Balasan terkirim ke pelanggan', 'success');
});

document.getElementById('adminChatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('adminChatSend').click();
});

// ============================================================
//  ANIME
// ============================================================
async function handleChatFileUpload(input, senderType) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
        showToast('Error', 'Gambar terlalu besar (Maks 10MB)', 'error');
        input.value = '';
        return;
    }

    const orderId = senderType === 'user' ? currentOrderChatId : currentAdminChatId;
    if (!orderId) {
        showToast('Error', 'Sesi chat tidak ditemukan.', 'error');
        input.value = '';
        return;
    }

    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        showToast('Error', 'Data pesanan tidak ditemukan.', 'error');
        input.value = '';
        return;
    }

    showToast('Chat', 'Sedang mengirim gambar...', 'info');

    const formData = new FormData();
    formData.append('image', file);

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: { 'Authorization': 'Client-ID ' + CONFIG.imgurClientId },
            body: formData,
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();

        if (result.success && result.data && result.data.link) {
            const newMessage = {
                from: senderType,
                text: '',
                image: result.data.link,
                time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})
            };

            if (!orders[orderIndex].chat) orders[orderIndex].chat = [];
            orders[orderIndex].chat.push(newMessage);

            localStorage.setItem('joellOrders', JSON.stringify(orders));
            broadcastChat(orderId);

            if (senderType === 'user') renderOrderChatMessages();
            else renderAdminChatMessages();

            showToast('Berhasil', 'Gambar berhasil dikirim!', 'success');
        } else {
            throw new Error('Gagal mendapatkan link gambar dari Imgur.');
        }
    } catch (error) {
        console.error("Image Upload Error:", error);

        if (file.size <= 2 * 1024 * 1024) {
            showToast('Info', 'Imgur gagal, mencoba base64 fallback...', 'warning');
            try {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const base64 = e.target.result;
                    const newMessage = {
                        from: senderType,
                        text: '',
                        image: base64,
                        time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})
                    };

                    if (!orders[orderIndex].chat) orders[orderIndex].chat = [];
                    orders[orderIndex].chat.push(newMessage);

                    localStorage.setItem('joellOrders', JSON.stringify(orders));
                    broadcastChat(orderId);

                    if (senderType === 'user') renderOrderChatMessages();
                    else renderAdminChatMessages();

                    showToast('Berhasil', 'Gambar berhasil dikirim (Base64)!', 'success');
                };
                reader.readAsDataURL(file);
            } catch (fbErr) {
                showToast('Error', 'Fallback juga gagal: ' + fbErr.message, 'error');
            }
        } else {
            showToast('Error', 'Gagal kirim gambar: ' + error.message + '. Gambar >2MB tidak bisa fallback.', 'error', 5000);
        }
    } finally {
        input.value = '';
    }
}

async function getLatestAnime() {
    try {
        const res = await fetch('https://api.jikan.moe/v4/seasons/now?limit=10');
        const data = await res.json();
        return data.data || [];
    } catch { return []; }
}
async function getUpcomingAnime() {
    try {
        const res = await fetch('https://api.jikan.moe/v4/seasons/upcoming?limit=10');
        const data = await res.json();
        return data.data || [];
    } catch { return []; }
}

function renderAnimeList(list, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!list.length) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">Tidak ada data</p>';
        return;
    }
    container.innerHTML = list.map(anime => {
        const title = anime.title || 'Unknown';
        const image = anime.images?.jpg?.image_url || '';
        const score = anime.score || 'N/A';
        const episodes = anime.episodes || '?';
        const type = anime.type || 'TV';
        return `
            <div class="anime-card">
                <div class="poster">${image ? `<img src="${image}" alt="${title}" loading="lazy">` : '<div class="fallback"><i class="fas fa-film"></i></div>'}</div>
                <div class="info">
                    <div class="title">${title}</div>
                    <div class="meta">
                        <span class="badge episode-badge"><i class="fas fa-play-circle"></i> EP${episodes}</span>
                        <span class="badge"><i class="fas fa-tv"></i> ${type}</span>
                    </div>
                    <div class="rating">
                        <span class="score"><i class="fas fa-star"></i> ${score}</span>
                    </div>
                    <button class="btn-watch" onclick="window.open('https://www.google.com/search?q=nonton+${encodeURIComponent(title)}+streaming+sub+indo','_blank')">
                        <i class="fas fa-play"></i> Nonton
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function loadAnime() {
    const [latest, upcoming] = await Promise.all([getLatestAnime(), getUpcomingAnime()]);
    renderAnimeList(latest, 'animeLatest');
    renderAnimeList(upcoming, 'animeUpcoming');
}

function openAnime() {
    document.getElementById('animeOverlay').classList.add('open');
    loadAnime();
}

// ============================================================
//  BOT CONTROLLER
// ============================================================
(function() {
    const tokenInput = document.getElementById('botTokenInput');
    const checkBtn = document.getElementById('botCheckBtn');
    const statusBox = document.getElementById('botStatusBox');
    const panel = document.getElementById('botPanelKontrol');
    const logArea = document.getElementById('botLogArea');
    let currentToken = '', currentChatId = null;

    function addLog(type, text) {
        const time = new Date().toLocaleTimeString('id-ID', {hour12:false});
        const colors = { INFO: 'bot-term-info', SUCCESS: 'bot-term-success', ERROR: 'bot-term-error', WARN: 'bot-term-warn' };
        logArea.innerHTML += `<div class="bot-terminal-line"><span class="bot-term-time">[${time}]</span><span class="${colors[type]||'bot-term-info'}">[${type}]</span><span class="bot-term-text">${text}</span></div>`;
        logArea.scrollTop = logArea.scrollHeight;
    }

    async function botCheck(token) {
        try {
            const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
            const data = await res.json();
            return data.ok ? { valid: true, bot: data.result } : { valid: false, error: data.description };
        } catch { return { valid: false, error: 'Network error' }; }
    }

    checkBtn.addEventListener('click', async () => {
        const token = tokenInput.value.trim();
        if (!token) { statusBox.className = 'bot-status-banner error'; statusBox.innerHTML = '<span>Token diperlukan</span>'; statusBox.classList.remove('hidden'); return; }
        statusBox.className = 'bot-status-banner info'; statusBox.innerHTML = '<span><i class="fas fa-spinner fa-spin"></i> Menghubungkan...</span>'; statusBox.classList.remove('hidden');
        const result = await botCheck(token);
        if (!result.valid) {
            statusBox.className = 'bot-status-banner error'; statusBox.innerHTML = `<span>Gagal: ${result.error}</span>`;
            panel.classList.add('hidden');
            return;
        }
        currentToken = token;
        document.getElementById('botName').textContent = result.bot.first_name || 'Bot';
        document.getElementById('botId').textContent = result.bot.id;
        statusBox.className = 'bot-status-banner success'; statusBox.innerHTML = '<span><i class="fas fa-check-circle"></i> Terhubung!</span>';
        panel.classList.remove('hidden');
        addLog('SUCCESS', 'Bot terautentikasi');
    });

    document.getElementById('botKirimBtn').addEventListener('click', async () => {
        const text = document.getElementById('botPesanInput').value.trim();
        if (!text) { addLog('ERROR', 'Pesan kosong'); return; }
        if (!currentToken) { addLog('ERROR', 'Belum terhubung'); return; }
        addLog('INFO', 'Mengirim pesan...');
        try {
            const form = new FormData();
            form.append('chat_id', currentChatId || '123456789');
            form.append('text', text);
            const res = await fetch(`https://api.telegram.org/bot${currentToken}/sendMessage`, { method: 'POST', body: form });
            const data = await res.json();
            if (data.ok) { addLog('SUCCESS', 'Pesan terkirim'); document.getElementById('botPesanInput').value = ''; }
            else { addLog('ERROR', data.description); }
        } catch { addLog('ERROR', 'Gagal mengirim'); }
    });
})();

// ============================================================
//  OSINT
// ============================================================
(function() {
    const queryBtn = document.getElementById('osintQueryBtn');
    queryBtn.addEventListener('click', async () => {
        const phone = document.getElementById('osintPhone').value.trim();
        const endpoint = document.getElementById('osintEndpoint').value;
        if (!phone) { showToast('Error', 'Masukkan nomor telepon', 'error'); return; }
        queryBtn.disabled = true; queryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
        document.getElementById('osintResult').classList.remove('hidden');
        document.getElementById('osintResultPre').textContent = 'Mengirim request...';
        try {
            const clean = phone.replace(/[^0-9]/g, '');
            let url = 'https://whatsapp-osint.p.rapidapi.com' + endpoint;
            const headers = { 'x-rapidapi-key': CONFIG.osintApiKey, 'x-rapidapi-host': 'whatsapp-osint.p.rapidapi.com' };
            const options = { method: 'GET', headers };
            if (endpoint === '/bizos') {
                options.method = 'POST';
                options.headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify({ phone: clean });
            } else { url += '?phone=' + clean; }
            const res = await fetch(url, options);
            const data = await res.json();
            document.getElementById('osintResultPre').textContent = JSON.stringify(data, null, 2);
        } catch (e) {
            document.getElementById('osintResultPre').textContent = 'Error: ' + e.message;
        } finally {
            queryBtn.disabled = false;
            queryBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Jalankan Query';
        }
    });
})();

// ============================================================
//  SSWEB
// ============================================================
(function() {
    document.getElementById('sswebBtn').addEventListener('click', async () => {
        const url = document.getElementById('sswebUrl').value.trim();
        const result = document.getElementById('sswebResult');
        if (!url) { result.innerHTML = '<div class="error">Masukkan URL</div>'; return; }
        let finalUrl;
        try { finalUrl = new URL(url); } catch { try { finalUrl = new URL('https://' + url); } catch { result.innerHTML = '<div class="error">URL tidak valid</div>'; return; } }
        result.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Mengambil screenshot...</div>';
        try {
            const apiUrl = `https://api.screenshotmachine.com/?key=14d2e6&url=${encodeURIComponent(finalUrl.href)}&dimension=1024x768&cacheLimit=0`;
            const res = await fetch(apiUrl);
            if (res.ok) {
                const blob = await res.blob();
                const reader = new FileReader();
                reader.onload = () => {
                    result.innerHTML = `<img src="${reader.result}" alt="screenshot" loading="lazy"><div style="margin-top:12px;display:flex;gap:10px;"><a href="${reader.result}" download="screenshot.png" class="btn-download-ss"><i class="fas fa-download"></i> Download</a><button onclick="window.open('${reader.result}','_blank')" class="btn-open-ss"><i class="fas fa-external-link-alt"></i> Buka</button></div>`;
                };
                reader.readAsDataURL(blob);
            } else { throw new Error('Gagal'); }
        } catch {
            result.innerHTML = '<div class="error">Gagal mengambil screenshot. Coba lagi.</div>';
        }
    });
})();

// ============================================================
//  UPLOAD
// ============================================================
(function() {
    const dropzone = document.getElementById('uploadDropzone');
    const fileInput = document.getElementById('uploadFileInput');
    let selectedFile = null;

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => { if (e.target.files[0]) { selectedFile = e.target.files[0]; updateDropzone(); } });
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault(); dropzone.classList.remove('dragover');
        if (e.dataTransfer.files[0]) { selectedFile = e.dataTransfer.files[0]; fileInput.files = e.dataTransfer.files; updateDropzone(); }
    });

    function updateDropzone() {
        dropzone.innerHTML = `<i class="fas fa-file-image" style="color:var(--accent-light);"></i><p style="font-weight:700;color:var(--text-primary);">${selectedFile.name}</p><span class="file-types">${(selectedFile.size/1024/1024).toFixed(2)} MB</span>`;
    }

    document.getElementById('uploadBtn').addEventListener('click', async () => {
        if (!selectedFile) { showToast('Error', 'Pilih file dulu', 'error'); return; }
        if (selectedFile.size > 10 * 1024 * 1024) { showToast('Error', 'Maksimal 10MB', 'error'); return; }
        const progressDiv = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('uploadProgressFill');
        progressDiv.style.display = 'block';
        const formData = new FormData();
        formData.append('image', selectedFile);
        try {
            const res = await fetch('https://api.imgur.com/3/image', {
                method: 'POST',
                headers: { 'Authorization': 'Client-ID ' + CONFIG.imgurClientId },
                body: formData
            });
            const json = await res.json();
            if (json.success && json.data?.link) {
                document.getElementById('uploadResultLink').value = json.data.link;
                document.getElementById('uploadResult').style.display = 'block';
                document.getElementById('uploadPreview').innerHTML = `<img src="${json.data.link}" alt="preview">`;
                progressFill.style.width = '100%';
                showToast('Upload', 'Berhasil upload!', 'success');
            } else { throw new Error('Gagal'); }
        } catch { showToast('Error', 'Gagal upload', 'error'); }
    });

    document.getElementById('uploadCopyBtn').addEventListener('click', () => {
        const link = document.getElementById('uploadResultLink').value;
        if (link) navigator.clipboard.writeText(link).then(() => showToast('Copied', 'Link disalin!', 'success'));
    });
})();

// ============================================================
//  NAVIGATION
// ============================================================
function navigateTo(page) {
    if (page === 'admin') {
        enterAdminMode();
        return;
    }
    localStorage.setItem('joellCurrentPage', page);

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    document.getElementById('cartOverlay').classList.remove('open');
    document.getElementById('bottomNav').style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'orders') renderOrdersList();
    if (page === 'profile') renderProfilePage();
}

function renderProfilePage() {
    const userView = document.getElementById('userProfileView');
    const guestView = document.getElementById('guestProfileView');
    if (currentUser) {
        if (userView) userView.style.display = 'block';
        if (guestView) guestView.style.display = 'none';
        document.getElementById('userProfileImg').src = currentUser.picture;
        document.getElementById('userProfileName').textContent = currentUser.name;
        document.getElementById('userProfileEmail').textContent = currentUser.email;
        const userOrders = orders.filter(o => o.userId === currentUser.id);
        document.getElementById('statOrderCount').textContent = userOrders.length;
        document.getElementById('btnProfileLogoutPage').onclick = () => {
            if (confirm('Apakah Anda yakin ingin keluar?')) {
                currentUser = null; localStorage.removeItem('joellUser');
                updateUserUI(); renderProfilePage();
                showToast('Logout', 'Anda telah keluar', 'info');
            }
        };
    } else {
        if (userView) userView.style.display = 'none';
        if (guestView) guestView.style.display = 'block';
    }
}

function doSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    const keyword = searchInput.value.toLowerCase().trim();
    const cats = ['hosting', 'script', 'topup'];
    cats.forEach(cat => {
        const filtered = products.filter(p => {
            const matchCat = currentFilter === 'all' || p.category === currentFilter;
            const matchText = p.name.toLowerCase().includes(keyword) || p.desc.toLowerCase().includes(keyword);
            return p.category === cat && matchCat && matchText;
        });
        const grid = document.getElementById('grid' + cat.charAt(0).toUpperCase() + cat.slice(1));
        if (grid) grid.innerHTML = renderMenuCards(filtered);
    });
    navigateTo('home');
}

// ============================================================
//  EVENT LISTENERS - NAVIGATION
// ============================================================
document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const page = btn.dataset.page;
        if (page === 'cart') { document.getElementById('cartOverlay').classList.toggle('open'); return; }
        if (page) {
            localStorage.setItem('joellCurrentPage', page);
            navigateTo(page);
        }
    });
});

document.getElementById('cartCloseBtn').addEventListener('click', () => document.getElementById('cartOverlay').classList.remove('open'));
document.getElementById('cartOverlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.classList.remove('open'); });

document.querySelectorAll('.grid-menu').forEach(grid => {
    grid.addEventListener('click', (e) => {
        const card = e.target.closest('.menu-card');
        if (!card) return;
        const id = parseInt(card.dataset.id);
        const product = products.find(p => p.id === id);
        if (!product) return;
        if (product.isUpload) { document.getElementById('uploadOverlay').classList.add('open'); return; }
        if (product.isSsweb) { document.getElementById('sswebOverlay').classList.add('open'); return; }
        if (product.isOsint) { document.getElementById('osintOverlay').classList.add('open'); return; }
        if (product.isTopup) { document.getElementById('topupOverlay').classList.add('open'); return; }
        if (product.isAnime) { openAnime(); return; }
        if (product.isBotController) { document.getElementById('botControllerOverlay').classList.add('open'); return; }
        if (product.isDownloader) return;
        openDetail(id);
    });
});

document.querySelectorAll('.detail-close, .modal-close').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.detail-overlay, .modal-overlay').classList.remove('open'));
});
document.querySelectorAll('.detail-overlay, .modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); }
    );
});

document.querySelectorAll('.anime-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.anime-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('animeLatest').style.display = tab.dataset.tab === 'latest' ? 'block' : 'none';
        document.getElementById('animeUpcoming').style.display = tab.dataset.tab === 'upcoming' ? 'block' : 'none';
    });
});

document.getElementById('animeSearchBtn').addEventListener('click', async () => {
    const query = document.getElementById('animeInput').value.trim();
    if (!query) return;
    document.getElementById('animeResult').innerHTML = '<p style="color:var(--text-muted);text-align:center;"><i class="fas fa-spinner fa-spin"></i> Mencari...</p>';
    try {
        const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        if (data.data?.length) {
            const container = document.createElement('div');
            container.className = 'anime-list';
            container.id = 'animeSearchResult';
            renderAnimeList(data.data, 'animeSearchResult');
            document.getElementById('animeResult').innerHTML = '';
            document.getElementById('animeResult').appendChild(container);
        } else {
            document.getElementById('animeResult').innerHTML = '<p style="color:var(--text-muted);text-align:center;">Tidak ditemukan</p>';
        }
    } catch {
        document.getElementById('animeResult').innerHTML = '<p style="color:var(--red);text-align:center;">Gagal mengambil data</p>';
    }
});

document.querySelectorAll('.bot-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.bot-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('botViewController').classList.toggle('hidden', tab.dataset.tab !== 'controller');
        document.getElementById('botViewLibrary').classList.toggle('hidden', tab.dataset.tab !== 'library');
    });
});

// ============================================================
//  VIDEO & BACK TO TOP
// ============================================================
(function() {
    const video = document.getElementById('heroVideo');
    const toggle = document.getElementById('soundToggle');
    if (video && toggle) {
        const icon = toggle.querySelector('i');
        let muted = true;
        video.muted = true;
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            muted = !muted;
            video.muted = muted;
            icon.className = muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
            toggle.classList.toggle('unmuted', !muted);
        });
    }
})();

const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 300);
});
backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================================================
//  ESCAPE KEY
// ============================================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.detail-overlay.open, .modal-overlay.open, .cart-overlay.open').forEach(el => el.classList.remove('open'));
    }
});

// ============================================================
//  REAL-TIME TIME UPDATER
// ============================================================
setInterval(() => {
    document.querySelectorAll('.realtime-time').forEach(el => {
        const timestamp = parseInt(el.dataset.time);
        if (timestamp) el.textContent = getRelativeTime(timestamp);
    });
}, 60000);

// ============================================================
//  INIT
// ============================================================
updateUserUI();
renderTopupGames();
renderMenus();
updateCartUI();
showToast('Selamat Datang', 'JOELL SHOP siap melayani!', 'success', 4000);

// ============================================================
// FUNGSI UNTUK MEMISAHKAN WITHDRAW DARI PAYMENT
// ============================================================
window.closePaymentAndOpenWithdraw = function() {
    const paymentOverlay = document.getElementById('paymentOverlay');
    if (paymentOverlay) {
        paymentOverlay.classList.remove('open');
    }
    navigateTo('profile');
    setTimeout(() => {
        const withdrawSection = document.querySelector('.withdraw-section-in-profile');
        if (withdrawSection) {
            withdrawSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 500);
};
