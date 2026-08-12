// ============================================================
// JOELL SHOP - MAIN SCRIPT (FULL WORKING - NO ERRORS)
// ============================================================

// ============================================================
// NOTIFICATION SYSTEM
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
// CONFIG & DATA
// ============================================================
const CONFIG = {
    flashSaleEnd: new Date(Date.now() + 4 * 3600 * 1000 + 32 * 60000 + 15 * 1000),
    promoCodes: {
        'JOELL50': { discount: 0.5, type: 'percent', max: 50000, desc: 'Diskon 50%' },
        'WELCOME': { discount: 10000, type: 'fixed', desc: 'Potongan Rp 10.000' },
        'FLASH25': { discount: 0.25, type: 'percent', max: 25000, desc: 'Diskon 25%' }
    },
    imgurClientId: '546c25a59c58ad7',
    adminPassword: 'joelladmin2026'
};

// PRODUCTS DATA - LENGKAP 13 PRODUK
const products = [
    { 
        id: 1, 
        name: 'Panel Pterodactyl', 
        price: 2000, 
        desc: 'Panel hosting premium dengan performa stabil untuk bot dan game server.', 
        icon: 'fa-server', 
        category: 'hosting', 
        badge: 'hot', 
        variants: [
            { name: '1GB RAM', price: 2000, stock: 'Tersedia' }, 
            { name: '2GB RAM', price: 3000, stock: 'Tersedia' },
            { name: '3GB RAM', price: 4000, stock: 'Tersedia' }, 
            { name: '4GB RAM', price: 5000, stock: 'Tersedia' },
            { name: '5GB RAM', price: 6000, stock: 'Tersedia' }, 
            { name: '6GB RAM', price: 7000, stock: 'Tersedia' },
            { name: '7GB RAM', price: 8000, stock: 'Tersedia' }, 
            { name: '8GB RAM', price: 9000, stock: 'Tersedia' },
            { name: '9GB RAM', price: 10000, stock: 'Tersedia' }, 
            { name: '11GB RAM', price: 11000, stock: 'Tersedia' },
            { name: 'Unlimited RAM', price: 13000, stock: 'Limited' }, 
            { name: 'Reseller Panel', price: 16000, stock: 'Tersedia' },
            { name: 'Admin Panel', price: 18000, stock: 'Tersedia' }
        ]
    },
    { 
        id: 2, 
        name: 'Jasa Pembuatan Fitur', 
        price: 5000, 
        desc: 'Custom fitur untuk bot WhatsApp sesuai kebutuhan Anda.', 
        icon: 'fa-microchip', 
        category: 'hosting', 
        badge: 'new', 
        variants: [
            { name: 'Add & Fix Fitur', price: 5000, stock: 'Tersedia' }, 
            { name: 'Auto React Status', price: 15000, stock: 'Tersedia' },
            { name: 'Security IP', price: 25000, stock: 'Tersedia' }, 
            { name: 'Security User+Pass', price: 15000, stock: 'Tersedia' },
            { name: 'Autojoin Saluran', price: 10000, stock: 'Tersedia' }, 
            { name: 'Auto Show JKT48', price: 55000, stock: 'Limited' }
        ]
    },
    { 
        id: 3, 
        name: 'Sewa Bot & Jadibot', 
        price: 10000, 
        desc: 'Bot WhatsApp siap pakai 24/7 tanpa perlu setup.', 
        icon: 'fa-robot', 
        category: 'hosting', 
        variants: [
            { name: '2 Minggu', price: 10000, stock: 'Tersedia' }, 
            { name: '1 Bulan', price: 20000, stock: 'Tersedia' }, 
            { name: 'Lifetime', price: 30000, stock: 'Limited' }
        ]
    },
    { 
        id: 4, 
        name: 'Script Lily Gen 2', 
        price: 30000, 
        desc: 'Script bot WhatsApp 600+ fitur dengan auto react & auto show JKT48.', 
        icon: 'fa-database', 
        category: 'hosting', 
        badge: 'pro', 
        variants: [
            { name: 'No Update', price: 30000, stock: 'Tersedia' }, 
            { name: 'Free 1x Update', price: 35000, stock: 'Tersedia' }, 
            { name: 'Free 2x Update', price: 45000, stock: 'Tersedia' }
        ]
    },
    { 
        id: 5, 
        name: 'Jasa Rename Script', 
        price: 7000, 
        desc: 'Ubah identitas script bot WA dari 30% hingga 100% full rename.', 
        icon: 'fa-pen-fancy', 
        category: 'hosting', 
        variants: [
            { name: 'Rename 30%', price: 7000, stock: 'Tersedia' }, 
            { name: 'Rename 60%', price: 12000, stock: 'Tersedia' },
            { name: 'Rename 80%', price: 15000, stock: 'Tersedia' }, 
            { name: 'Rename 100%', price: 20000, stock: 'Tersedia' }
        ]
    },
    { 
        id: 6, 
        name: 'Domain & Hosting', 
        price: 8000, 
        desc: 'Domain dan hosting website berkualitas dengan panel cPanel.', 
        icon: 'fa-globe', 
        category: 'hosting', 
        variants: [
            { name: 'Domain .my.id 1th', price: 8000, stock: 'Tersedia' }, 
            { name: 'Domain .biz.id 1th', price: 8000, stock: 'Tersedia' },
            { name: 'Domain .xyz 1th', price: 75000, stock: 'Tersedia' }, 
            { name: '.xyz + Hosting', price: 550000, stock: 'Tersedia' }
        ]
    },
    { 
        id: 7, 
        name: 'Bot Multi Device', 
        price: 35000, 
        desc: 'Script bot WhatsApp MD dengan fitur modern dan stabil.', 
        icon: 'fa-code-branch', 
        category: 'script', 
        badge: 'hot', 
        variants: [
            { name: 'Bot MD Basic', price: 35000, stock: 'Tersedia' }, 
            { name: 'Bot MD Premium', price: 75000, stock: 'Tersedia' }, 
            { name: 'Custom Request', price: 0, stock: 'Hubungi' }
        ]
    },
    { 
        id: 8, 
        name: 'Bot RPG', 
        price: 45000, 
        desc: 'Script bot RPG dengan sistem game, inventory, dan leveling.', 
        icon: 'fa-gamepad', 
        category: 'script', 
        variants: [
            { name: 'Bot RPG Basic', price: 45000, stock: 'Tersedia' }, 
            { name: 'Bot RPG Full', price: 85000, stock: 'Tersedia' }, 
            { name: 'Custom Request', price: 0, stock: 'Hubungi' }
        ]
    },
    { 
        id: 9, 
        name: 'Bot Jaga Group', 
        price: 30000, 
        desc: 'Bot keamanan grup dengan welcome, anti-link, dan auto respon.', 
        icon: 'fa-users-cog', 
        category: 'script', 
        variants: [
            { name: 'Jaga Group Basic', price: 30000, stock: 'Tersedia' }, 
            { name: 'Jaga Group + Pushkontak', price: 70000, stock: 'Tersedia' }, 
            { name: 'Custom Request', price: 0, stock: 'Hubungi' }
        ]
    },
    { 
        id: 10, 
        name: 'Bot Downloader', 
        price: 40000, 
        desc: 'Bot convert media, downloader sosmed, dan pembuat sticker.', 
        icon: 'fa-download', 
        category: 'script', 
        badge: 'new', 
        variants: [
            { name: 'Downloader Basic', price: 40000, stock: 'Tersedia' }, 
            { name: 'Convert + Sticker Full', price: 80000, stock: 'Tersedia' }, 
            { name: 'Custom Request', price: 0, stock: 'Hubungi' }
        ]
    },
    { 
        id: 11, 
        name: 'Bot Auto AI', 
        price: 50000, 
        desc: 'Bot AI pintar untuk chat otomatis dan asisten virtual.', 
        icon: 'fa-brain', 
        category: 'script', 
        badge: 'pro', 
        variants: [
            { name: 'AI Basic', price: 50000, stock: 'Tersedia' }, 
            { name: 'AI Premium', price: 95000, stock: 'Tersedia' }, 
            { name: 'Custom Request', price: 0, stock: 'Hubungi' }
        ]
    },
    { 
        id: 12, 
        name: 'Bot Auto Order', 
        price: 55000, 
        desc: 'Bot WhatsApp dengan sistem pembayaran otomatis.', 
        icon: 'fa-credit-card', 
        category: 'script', 
        variants: [
            { name: 'Auto Order Basic', price: 55000, stock: 'Tersedia' }, 
            { name: 'Auto Order Premium', price: 99000, stock: 'Tersedia' }, 
            { name: 'Custom Request', price: 0, stock: 'Hubungi' }
        ]
    },
    { 
        id: 13, 
        name: 'Topup All Game', 
        price: 0, 
        desc: 'Topup diamond, UC, dan voucher game favoritmu.', 
        icon: 'fa-gamepad', 
        category: 'topup', 
        isTopup: true, 
        variants: [{ name: 'Pilih Game', price: 0, stock: 'Tersedia' }] 
    }
];

// TOPUP GAMES
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

// ============================================================
// STATE
// ============================================================
let cart = JSON.parse(localStorage.getItem('joellCart')) || [];
let orders = JSON.parse(localStorage.getItem('joellOrders')) || [];
let currentUser = JSON.parse(localStorage.getItem('joellUser')) || null;
let currentProductId = null;
let selectedVariant = null;
let activePromo = null;
let currentOrderChatId = null;
let isAdminLoggedIn = false;
let currentAdminChatId = null;
let logoClickCount = 0;

// ============================================================
// FIREBASE REAL-TIME DATABASE
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
        });
    }
}

// ============================================================
// GOOGLE LOGIN
// ============================================================
function handleGoogleLogin(response) {
    try {
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
        renderOrdersList();
        renderProfilePage();
    } catch (e) {
        console.error("Login Error:", e);
        showToast('Error', 'Gagal login dengan Google', 'error');
    }
}

// ============================================================
// RENDER FUNCTIONS
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
            <div class="menu-card" data-id="${p.id}" data-topup="${p.isTopup||false}">
                ${badgeHtml}
                <i class="fas ${p.icon}"></i>
                <span>${p.name}</span>
            </div>
        `;
    }).join('');
}

// ============================================================
// EVENT LISTENERS FOR PRODUCT CARDS
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    // Click event untuk semua grid menu
    document.querySelectorAll('.grid-menu').forEach(grid => {
        grid.addEventListener('click', function(e) {
            const card = e.target.closest('.menu-card');
            if (!card) return;
            const id = parseInt(card.dataset.id);
            const product = products.find(p => p.id === id);
            if (!product) return;
            
            if (product.isTopup) {
                const overlay = document.getElementById('topupOverlay');
                if (overlay) overlay.classList.add('open');
                return;
            }
            
            openDetail(id);
        });
    });
});

// ============================================================
// DETAIL MODAL
// ============================================================
function openDetail(productId) {
    const p = products.find(x => x.id === productId);
    if (!p) {
        showToast('Error', 'Produk tidak ditemukan', 'error');
        return;
    }
    currentProductId = p.id;
    selectedVariant = p.variants[0];
    document.getElementById('detailName').textContent = p.name;
    document.getElementById('detailPrice').textContent = 'Rp ' + (p.variants[0].price || 0).toLocaleString();
    document.getElementById('detailDesc').textContent = p.desc;
    const list = document.getElementById('variantList');
    list.innerHTML = p.variants.map((v, i) => {
        const priceText = v.price === 0 ? 'Hubungi Admin' : 'Rp ' + v.price.toLocaleString();
        return `
            <div class="variant-item ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="selectVariant(this, ${i})">
                <span class="vname">${v.name}</span>
                <span class="vprice">${priceText}</span>
                <span class="vstock"><i class="fas fa-check-circle"></i> ${v.stock}</span>
            </div>
        `;
    }).join('');
    document.getElementById('detailOverlay').classList.add('open');
}

function selectVariant(el, index) {
    document.querySelectorAll('.variant-item').forEach(v => v.classList.remove('active'));
    el.classList.add('active');
    const p = products.find(x => x.id === currentProductId);
    if (p) {
        selectedVariant = p.variants[index];
        const priceText = selectedVariant.price === 0 ? 'Hubungi Admin' : 'Rp ' + selectedVariant.price.toLocaleString();
        document.getElementById('detailPrice').textContent = priceText;
    }
}

// ============================================================
// CART FUNCTIONS
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

    document.getElementById('cartSubtotal').textContent = 'Rp ' + subtotal.toLocaleString();
    document.getElementById('cartDiscount').textContent = discount > 0 ? '- Rp ' + discount.toLocaleString() : 'Rp 0';
    document.getElementById('cartShipping').textContent = 'Rp 0';
    document.getElementById('cartTotalDisplay').textContent = 'Rp ' + total.toLocaleString();
    
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

// ============================================================
// BUTTON EVENT LISTENERS
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    // Add to Cart Button
    const addBtn = document.getElementById('addToCartBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            if (!selectedVariant) { showToast('Error', 'Pilih varian dulu', 'error'); return; }
            addToCart(currentProductId, selectedVariant.name, selectedVariant.price);
            document.getElementById('detailOverlay').classList.remove('open');
        });
    }

    // Buy Now Button
    const buyBtn = document.getElementById('buyNowBtn');
    if (buyBtn) {
        buyBtn.addEventListener('click', function() {
            if (!selectedVariant) { showToast('Error', 'Pilih varian dulu', 'error'); return; }
            addToCart(currentProductId, selectedVariant.name, selectedVariant.price);
            document.getElementById('detailOverlay').classList.remove('open');
            document.getElementById('cartOverlay').classList.add('open');
        });
    }

    // Checkout Button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
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
    }

    // Checkout Form Submit
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!cart.length) return;
            
            const orderId = 'JOELL-' + Math.random().toString(36).substr(2, 4).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
            const total = cart.reduce((a, i) => a + i.price * i.qty, 0);
            
            const order = {
                id: orderId,
                userId: currentUser ? currentUser.id : 'guest',
                userName: document.getElementById('coName').value || '',
                userEmail: document.getElementById('coEmail').value || '',
                userPhone: document.getElementById('coPhone').value || '',
                address: document.getElementById('coAddress').value || '',
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
                        text: `Halo ${document.getElementById('coName').value || 'Pelanggan'}! Terima kasih telah memesan. Silakan selesaikan pembayaran Anda.`,
                        time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) 
                    }
                ]
            };
            
            orders.unshift(order);
            localStorage.setItem('joellOrders', JSON.stringify(orders));
            syncOrdersToCloud();
            
            cart = [];
            activePromo = null;
            localStorage.setItem('joellCart', JSON.stringify(cart));
            updateCartUI();
            
            document.getElementById('checkoutOverlay').classList.remove('open');
            
            if (typeof window.openPaymentModal === 'function') {
                setTimeout(() => {
                    window.openPaymentModal(order);
                }, 300);
            } else {
                showToast('Pesanan Dibuat', `ID: ${orderId}. Selesaikan pembayaran.`, 'success', 5000);
                navigateTo('orders');
                setTimeout(() => openOrderChat(orderId), 500);
            }
            renderOrdersList();
        });
    }

    // Clear Cart Button
    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
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
    }

    // Promo Button
    const promoBtn = document.getElementById('promoBtn');
    if (promoBtn) {
        promoBtn.addEventListener('click', function() {
            const code = document.getElementById('promoInput').value.trim().toUpperCase();
            const msgEl = document.getElementById('promoMessage');
            if (!code) { msgEl.textContent = 'Masukkan kode promo'; msgEl.className = 'promo-message error'; return; }
            if (CONFIG.promoCodes[code]) {
                activePromo = { code, ...CONFIG.promoCodes[code] };
                msgEl.textContent = '✅ ' + activePromo.desc + ' berhasil diterapkan!';
                msgEl.className = 'promo-message success';
                showToast('Promo Applied', activePromo.desc, 'success');
                updateCartUI();
            } else {
                activePromo = null;
                msgEl.textContent = '❌ Kode promo tidak valid';
                msgEl.className = 'promo-message error';
            }
        });
    }

    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('joellTheme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.innerHTML = `<i class="fas fa-${savedTheme === 'dark' ? 'sun' : 'moon'}"></i>`;
        themeToggle.addEventListener('click', function() {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('joellTheme', next);
            this.innerHTML = `<i class="fas fa-${next === 'dark' ? 'sun' : 'moon'}"></i>`;
            showToast('Theme Changed', `Switched to ${next} mode`, 'info');
        });
    }

    // Login Button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            document.getElementById('loginOverlay').classList.add('open');
        });
    }

    // Cart Close Button
    const cartCloseBtn = document.getElementById('cartCloseBtn');
    if (cartCloseBtn) {
        cartCloseBtn.addEventListener('click', function() {
            document.getElementById('cartOverlay').classList.remove('open');
        });
    }

    // Login Close Button
    const loginCloseBtn = document.getElementById('loginCloseBtn');
    if (loginCloseBtn) {
        loginCloseBtn.addEventListener('click', function() {
            document.getElementById('loginOverlay').classList.remove('open');
        });
    }

    // Navigation
    document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page === 'cart') {
                document.getElementById('cartOverlay').classList.toggle('open');
                return;
            }
            if (page) {
                navigateTo(page);
            }
        });
    });

    // Back to Top
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            backToTop.classList.toggle('visible', window.scrollY > 300);
        });
        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

// ============================================================
// NAVIGATION
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
        document.getElementById('btnProfileLogoutPage').onclick = function() {
            if (confirm('Apakah Anda yakin ingin keluar?')) {
                currentUser = null; localStorage.removeItem('joellUser');
                updateUserUI(); renderProfilePage();
                showToast('Logout', 'Anda telah keluar', 'info');
            }
        };
        // Init withdraw
        if (typeof initProfileWithdraw === 'function') {
            setTimeout(initProfileWithdraw, 500);
        }
    } else {
        if (userView) userView.style.display = 'none';
        if (guestView) guestView.style.display = 'block';
    }
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
        document.getElementById('loginBtn').addEventListener('click', function() {
            document.getElementById('loginOverlay').classList.add('open');
        });
    }
}

function openProfileSettings() {
    if (!currentUser) return;
    document.getElementById('profileNameInput').value = currentUser.name;
    document.getElementById('profileEmailInput').value = currentUser.email;
    document.getElementById('profilePreview').src = currentUser.picture;
    document.getElementById('profileOverlay').classList.add('open');
}

// ============================================================
// ORDERS
// ============================================================
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
        'pending': 'pending', 'read': 'read', 'processing': 'processing',
        'shipped': 'shipped', 'completed': 'completed'
    };
    const statusLabel = {
        'pending': 'Menunggu', 'read': 'Dibaca', 'processing': 'Diproses',
        'shipped': 'Dikirim', 'completed': 'Selesai'
    };

    container.innerHTML = '<div class="orders-list">' + myOrders.map(o => {
        const itemsText = o.items.map(i => `${i.name} (${i.variant})`).join(', ');
        return `
            <div class="order-card" onclick="openOrderChat('${o.id}')">
                <div class="order-card-header">
                    <span class="order-id">#${o.id}</span>
                    <span class="order-status ${statusClass[o.status] || 'pending'}">${statusLabel[o.status] || o.status}</span>
                </div>
                <div class="order-products">${itemsText}</div>
                <div class="order-meta">
                    <span>${new Date(o.createdAt).toLocaleString('id-ID', {day:'2-digit', month:'short', year:'numeric'})}</span>
                    <span class="order-total">Rp ${o.total.toLocaleString()}</span>
                </div>
            </div>
        `;
    }).join('') + '</div>';
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
        const imgHtml = c.image ? `
            <div class="chat-img-container">
                <img src="${c.image}" alt="chat-img" onclick="window.open('${c.image}', '_blank')">
            </div>` : '';
        
        const avatar = isAdmin ? 
            `<div class="chat-avatar" style="background:var(--accent);"><i class="fas fa-robot"></i></div>` : 
            `<div class="chat-avatar" style="background:var(--purple);">${currentUser ? currentUser.name.charAt(0) : 'U'}</div>`;

        return `
            <div class="chat-row ${isAdmin ? 'admin-row' : 'user-row'}">
                ${avatar}
                <div class="msg ${isAdmin ? 'admin' : 'user'}">
                    ${c.text || ''}
                    ${imgHtml}
                    <span class="time">${c.time}</span>
                </div>
            </div>
        `;
    }).join('');
    container.scrollTop = container.scrollHeight;
}

// ============================================================
// ADMIN
// ============================================================
function enterAdminMode() {
    localStorage.setItem('joellCurrentPage', 'admin');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-admin').classList.add('active');
    document.getElementById('bottomNav').style.display = 'none';
    document.getElementById('adminLoginView').style.display = 'block';
    document.getElementById('adminDashboardView').style.display = 'none';
    window.scrollTo(0,0);
}

function renderAdminOrders() {
    const container = document.getElementById('adminOrdersList');
    if (!container) return;
    
    if (!orders.length) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">Belum ada pesanan</p>';
        return;
    }
    const statusOptions = {
        'pending': 'Menunggu', 'read': 'Dibaca', 'processing': 'Diproses',
        'shipped': 'Dikirim', 'completed': 'Selesai'
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
                    <strong>${o.userName}</strong> · ${o.userEmail} · ${o.userPhone || '-'}
                </div>
                <div class="admin-order-products">${itemsText}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-weight:800;color:var(--accent-light);">Rp ${o.total.toLocaleString()}</span>
                    <button class="admin-chat-btn" onclick="openAdminChat('${o.id}')">
                        <i class="fas fa-comments"></i> Balas Chat
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function updateAdminStats() {
    document.getElementById('adminStatTotal').textContent = orders.length;
    document.getElementById('adminStatPending').textContent = orders.filter(o => o.status === 'pending').length;
    document.getElementById('adminStatProcessing').textContent = orders.filter(o => o.status === 'processing').length;
    document.getElementById('adminStatCompleted').textContent = orders.filter(o => o.status === 'completed').length;
}

function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    order.status = newStatus;
    order.statusLabel = {pending:'Menunggu',read:'Dibaca',processing:'Diproses',shipped:'Dikirim',completed:'Selesai'}[newStatus];
    localStorage.setItem('joellOrders', JSON.stringify(orders));
    syncOrdersToCloud();
    updateAdminStats();
    renderAdminOrders();
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

    renderAdminChatMessages();
    document.getElementById('adminChatOverlay').classList.add('open');
}

function renderAdminChatMessages() {
    const order = orders.find(o => o.id === currentAdminChatId);
    if (!order) return;
    const container = document.getElementById('adminChatMessages');
    if (!container) return;
    
    container.innerHTML = order.chat.map(c => {
        const isAdmin = c.from === 'admin';
        const imgHtml = c.image ? `
            <div class="chat-img-container">
                <img src="${c.image}" alt="chat-img" onclick="window.open('${c.image}', '_blank')">
            </div>` : '';

        const avatar = isAdmin ? 
            `<div class="chat-avatar" style="background:var(--accent);"><i class="fas fa-robot"></i></div>` : 
            `<div class="chat-avatar" style="background:var(--purple);">${order.userName.charAt(0)}</div>`;

        return `
            <div class="chat-row ${isAdmin ? 'user-row' : 'admin-row'}">
                ${avatar}
                <div class="msg ${isAdmin ? 'user' : 'admin'}">
                    ${c.text || ''}
                    ${imgHtml}
                    <span class="time">${c.time}</span>
                </div>
            </div>
        `;
    }).join('');
    container.scrollTop = container.scrollHeight;
}

// ============================================================
// TOAST
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
// SEARCH
// ============================================================
function doSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    const keyword = searchInput.value.toLowerCase().trim();
    const cats = ['hosting', 'script', 'topup'];
    cats.forEach(cat => {
        const filtered = products.filter(p => {
            const matchText = p.name.toLowerCase().includes(keyword) || p.desc.toLowerCase().includes(keyword);
            return p.category === cat && matchText;
        });
        const grid = document.getElementById('grid' + cat.charAt(0).toUpperCase() + cat.slice(1));
        if (grid) grid.innerHTML = renderMenuCards(filtered);
    });
}

// ============================================================
// CLOSE PAYMENT AND OPEN WITHDRAW
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

// ============================================================
// INIT CLOUD SYNC
// ============================================================
initCloudSync();

console.log('✅ JOELL SHOP Script Loaded Successfully!');
