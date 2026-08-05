// ============================================================
// JOELL SHOP - MAIN SCRIPT (FIXED)
// ============================================================

// ============================================================
// DATA PRODUK
// ============================================================
const PRODUCTS = [
    // HOSTING
    { id: 1, name: 'Panel Pterodactyl', icon: 'fa-server', category: 'hosting', badge: 'hot', price: 25000, variants: ['4GB RAM', '8GB RAM', '16GB RAM'] },
    { id: 2, name: 'Jasa Pembuatan Fitur', icon: 'fa-microchip', category: 'hosting', badge: 'new', price: 50000, variants: ['Basic', 'Premium', 'Enterprise'] },
    { id: 3, name: 'Sewa Bot & Jadibot', icon: 'fa-robot', category: 'hosting', price: 15000, variants: ['1 Bulan', '3 Bulan', '6 Bulan'] },
    { id: 4, name: 'Script Lily Gen 2', icon: 'fa-database', category: 'hosting', badge: 'pro', price: 75000, variants: ['Full', 'Lite'] },
    { id: 5, name: 'Jasa Rename Script', icon: 'fa-pen-fancy', category: 'hosting', price: 35000, variants: ['Standard', 'Express'] },
    { id: 6, name: 'Domain & Hosting', icon: 'fa-globe', category: 'hosting', price: 45000, variants: ['.com', '.id', '.org'] },
    // SCRIPT
    { id: 7, name: 'Bot Multi Device', icon: 'fa-code-branch', category: 'script', badge: 'hot', price: 55000, variants: ['Baileys', 'WebJS'] },
    { id: 8, name: 'Bot RPG', icon: 'fa-gamepad', category: 'script', price: 65000, variants: ['Standard', 'Premium'] },
    { id: 9, name: 'Bot Jaga Group', icon: 'fa-users-cog', category: 'script', price: 30000, variants: ['Basic', 'Pro'] },
    { id: 10, name: 'Bot Downloader', icon: 'fa-download', category: 'script', badge: 'new', price: 40000, variants: ['Standard', 'Premium'] },
    { id: 11, name: 'Bot Auto AI', icon: 'fa-brain', category: 'script', badge: 'pro', price: 80000, variants: ['GPT-3', 'GPT-4'] },
    { id: 12, name: 'Bot Auto Order', icon: 'fa-credit-card', category: 'script', price: 45000, variants: ['Basic', 'Advanced'] },
    // TOPUP
    { id: 13, name: 'Topup All Game', icon: 'fa-gamepad', category: 'topup', isTopup: true }
];

// ============================================================
// STATE
// ============================================================
let cart = JSON.parse(localStorage.getItem('joellCart')) || [];
let currentUser = JSON.parse(localStorage.getItem('joellUser')) || null;
let orders = JSON.parse(localStorage.getItem('joellOrders')) || [];
let invoiceHistory = JSON.parse(localStorage.getItem('joellInvoiceHistory')) || [];
let selectedVariant = null;
let currentProductId = null;

// ============================================================
// DOM REFS
// ============================================================
const $ = (id) => document.getElementById(id);
const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => document.querySelectorAll(sel);

// ============================================================
// TOAST SYSTEM
// ============================================================
function showToast(title, message, type = 'info', duration = 3000) {
    const container = $('toastContainer');
    if (!container) {
        console.log(`📢 ${type.toUpperCase()}: ${title} - ${message}`);
        return;
    }
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = 'toast';
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
// RENDER MENU PRODUK
// ============================================================
function renderMenus() {
    const hostingGrid = $('gridHosting');
    const scriptGrid = $('gridScript');
    const topupGrid = $('gridTopup');
    
    if (!hostingGrid || !scriptGrid || !topupGrid) return;
    
    const hosting = PRODUCTS.filter(p => p.category === 'hosting');
    const script = PRODUCTS.filter(p => p.category === 'script');
    const topup = PRODUCTS.filter(p => p.category === 'topup');
    
    hostingGrid.innerHTML = hosting.map(p => createProductCard(p)).join('');
    scriptGrid.innerHTML = script.map(p => createProductCard(p)).join('');
    topupGrid.innerHTML = topup.map(p => createProductCard(p)).join('');
}

function createProductCard(product) {
    const badgeHtml = product.badge ? `<span class="card-badge ${product.badge}">${product.badge.toUpperCase()}</span>` : '';
    return `
        <div class="menu-card" data-id="${product.id}" onclick="openDetail(${product.id})">
            ${badgeHtml}
            <i class="fas ${product.icon}"></i>
            <span>${product.name}</span>
        </div>
    `;
}

// ============================================================
// DETAIL PRODUK
// ============================================================
function openDetail(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    
    if (product.isTopup) {
        $('topupOverlay').classList.add('open');
        return;
    }
    
    currentProductId = productId;
    selectedVariant = product.variants ? product.variants[0] : 'Standard';
    
    $('detailName').textContent = product.name;
    $('detailPrice').textContent = `Rp ${(product.price || 0).toLocaleString()}`;
    $('detailDesc').textContent = `Produk digital ${product.name} dengan kualitas terbaik.`;
    
    const variantList = $('variantList');
    if (product.variants && product.variants.length > 0) {
        variantList.innerHTML = product.variants.map(v => `
            <div class="variant-item ${v === selectedVariant ? 'active' : ''}" onclick="selectVariant('${v}')">
                <span class="vname">${v}</span>
                <span class="vprice">Rp ${(product.price || 0).toLocaleString()}</span>
            </div>
        `).join('');
        variantList.style.display = 'grid';
    } else {
        variantList.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">Tersedia</p>';
        variantList.style.display = 'block';
    }
    
    $('detailOverlay').classList.add('open');
}

function selectVariant(variant) {
    selectedVariant = variant;
    qsa('.variant-item').forEach(el => el.classList.remove('active'));
    qsa('.variant-item').forEach(el => {
        if (el.querySelector('.vname')?.textContent === variant) {
            el.classList.add('active');
        }
    });
}

// ============================================================
// CART FUNCTIONS
// ============================================================
function addToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    
    const existing = cart.find(item => item.id === productId && item.variant === selectedVariant);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            variant: selectedVariant || 'Standard',
            price: product.price || 0,
            qty: 1
        });
    }
    
    localStorage.setItem('joellCart', JSON.stringify(cart));
    updateCartUI();
    showToast('✅ Ditambahkan', `${product.name} masuk keranjang!`, 'success');
}

function updateCartUI() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const badge = $('navCartBadge');
    if (badge) badge.textContent = count;
    
    const totalBadge = $('cartBadgeTotal');
    if (totalBadge) totalBadge.textContent = count;
    
    const itemsContainer = $('cartItems');
    if (!itemsContainer) return;
    
    if (cart.length === 0) {
        itemsContainer.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-bag"></i>
                <h3>Keranjang Kosong</h3>
                <p>Mulai belanja sekarang!</p>
            </div>
        `;
        $('cartFooter').style.display = 'none';
        return;
    }
    
    $('cartFooter').style.display = 'block';
    
    itemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="item-icon"><i class="fas fa-cube"></i></div>
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-variant">${item.variant}</div>
                <div class="item-price">Rp ${(item.price * item.qty).toLocaleString()}</div>
            </div>
            <div class="item-actions">
                <div class="qty-control">
                    <button onclick="updateQty(${index}, -1)"><i class="fas fa-minus"></i></button>
                    <span class="qty-num">${item.qty}</span>
                    <button onclick="updateQty(${index}, 1)"><i class="fas fa-plus"></i></button>
                </div>
                <button class="item-remove" onclick="removeFromCart(${index})"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
    `).join('');
    
    updateCartSummary();
}

function updateQty(index, delta) {
    if (index < 0 || index >= cart.length) return;
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    localStorage.setItem('joellCart', JSON.stringify(cart));
    updateCartUI();
}

function removeFromCart(index) {
    if (index < 0 || index >= cart.length) return;
    cart.splice(index, 1);
    localStorage.setItem('joellCart', JSON.stringify(cart));
    updateCartUI();
    showToast('🗑️ Dihapus', 'Item dihapus dari keranjang', 'info');
}

function clearCart() {
    if (cart.length === 0) return;
    cart = [];
    localStorage.setItem('joellCart', JSON.stringify(cart));
    updateCartUI();
    showToast('🗑️ Kosong', 'Keranjang dibersihkan', 'info');
}

function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const total = subtotal;
    
    $('cartSubtotal').textContent = `Rp ${subtotal.toLocaleString()}`;
    $('cartDiscount').textContent = 'Rp 0';
    $('cartShipping').textContent = 'Rp 0';
    $('cartTotalDisplay').textContent = `Rp ${total.toLocaleString()}`;
}

// ============================================================
// CHECKOUT
// ============================================================
function openCheckout() {
    if (cart.length === 0) {
        showToast('⚠️ Kosong', 'Keranjang masih kosong', 'warning');
        return;
    }
    
    const itemsContainer = $('checkoutItems');
    const totalEl = $('checkoutTotal');
    
    let total = 0;
    itemsContainer.innerHTML = cart.map(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        return `<div class="order-item-line">${item.name} (${item.variant}) x${item.qty} = Rp ${subtotal.toLocaleString()}</div>`;
    }).join('');
    
    totalEl.textContent = `Total: Rp ${total.toLocaleString()}`;
    $('checkoutOverlay').classList.add('open');
}

function submitOrder(e) {
    e.preventDefault();
    
    const name = $('coName').value.trim();
    const email = $('coEmail').value.trim();
    const phone = $('coPhone').value.trim();
    const address = $('coAddress').value.trim();
    
    if (!name || !email || !phone) {
        showToast('⚠️ Data Kurang', 'Lengkapi data pemesanan', 'warning');
        return;
    }
    
    const orderId = 'JOELL-' + Date.now().toString().slice(-8).toUpperCase();
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    
    const order = {
        id: orderId,
        customer: { name, email, phone, address },
        items: cart.map(item => ({ ...item })),
        total: total,
        status: 'pending',
        createdAt: new Date().toISOString(),
        chat: []
    };
    
    orders.unshift(order);
    localStorage.setItem('joellOrders', JSON.stringify(orders));
    
    cart = [];
    localStorage.setItem('joellCart', JSON.stringify(cart));
    updateCartUI();
    
    $('checkoutOverlay').classList.remove('open');
    $('checkoutForm').reset();
    
    showToast('✅ Pesanan Dibuat', `ID: ${orderId}`, 'success', 5000);
    
    // Buka payment modal
    setTimeout(() => {
        openPaymentModal(order);
    }, 500);
}

// ============================================================
// PAYMENT MODAL
// ============================================================
function openPaymentModal(orderData) {
    const overlay = $('paymentOverlay');
    if (!overlay) return;
    
    const itemsContainer = $('paymentOrderItems');
    const totalEl = $('paymentOrderTotal');
    const bankTotal = $('bankTotal');
    
    let total = 0;
    const items = orderData?.items || cart;
    
    if (itemsContainer) {
        itemsContainer.innerHTML = items.map(item => {
            const subtotal = item.price * item.qty;
            total += subtotal;
            return `<div class="order-item-line">${item.name} (${item.variant}) x${item.qty} = Rp ${subtotal.toLocaleString()}</div>`;
        }).join('');
    }
    
    if (totalEl) totalEl.textContent = 'Total: Rp ' + total.toLocaleString();
    if (bankTotal) bankTotal.textContent = 'Rp ' + total.toLocaleString();
    
    // Reset UI
    const qrisWrapper = $('qrisImageWrapper');
    if (qrisWrapper) qrisWrapper.style.display = 'none';
    const paymentDetails = $('paymentDetails');
    if (paymentDetails) paymentDetails.style.display = 'none';
    const paymentTimer = $('paymentTimer');
    if (paymentTimer) paymentTimer.style.display = 'none';
    const checkStatusBtn = $('checkStatusBtn');
    if (checkStatusBtn) checkStatusBtn.style.display = 'none';
    const copyPaymentLinkBtn = $('copyPaymentLinkBtn');
    if (copyPaymentLinkBtn) copyPaymentLinkBtn.style.display = 'none';
    
    const qrisPlaceholder = $('qrisPlaceholder');
    if (qrisPlaceholder) {
        qrisPlaceholder.style.display = 'block';
        qrisPlaceholder.innerHTML = `
            <i class="fas fa-qrcode"></i>
            <p>Klik tombol "Buat Invoice" untuk mendapatkan QRIS</p>
            <small>Pastikan koneksi internet stabil</small>
        `;
    }
    
    const qrisImage = $('qrisImage');
    if (qrisImage) qrisImage.src = '';
    
    overlay.classList.add('open');
    renderInvoiceHistory();
    fetchBalance();
}

// ============================================================
// RENDER ORDERS
// ============================================================
function renderOrdersList() {
    const container = $('ordersListContainer');
    if (!container) return;
    
    orders = JSON.parse(localStorage.getItem('joellOrders')) || [];
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-box-open"></i>
                <h3>Belum ada pesanan</h3>
                <p>Yuk mulai berbelanja!</p>
            </div>
        `;
        return;
    }
    
    const statusMap = {
        'pending': { label: '⏳ Menunggu', class: 'pending' },
        'processing': { label: '⚙️ Diproses', class: 'processing' },
        'shipped': { label: '📦 Dikirim', class: 'shipped' },
        'completed': { label: '✅ Selesai', class: 'completed' }
    };
    
    container.innerHTML = `
        <div class="orders-list">
            ${orders.map(order => {
                const status = statusMap[order.status] || statusMap['pending'];
                const date = new Date(order.createdAt).toLocaleString('id-ID');
                const itemsText = order.items.map(i => `${i.name} x${i.qty}`).join(', ');
                
                return `
                    <div class="order-card" onclick="viewOrder('${order.id}')">
                        <div class="order-card-header">
                            <span class="order-id">#${order.id}</span>
                            <span class="order-status ${status.class}">${status.label}</span>
                        </div>
                        <div class="order-products">${itemsText}</div>
                        <div class="order-meta">
                            <span>${date}</span>
                            <span class="order-total">Rp ${order.total.toLocaleString()}</span>
                        </div>
                        ${order.chat && order.chat.length > 0 ? `
                            <div class="order-msg-badge">
                                <i class="fas fa-comment-dots"></i>
                                <span>Chat dari admin</span>
                                <span class="msg-dot"></span>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function viewOrder(orderId) {
    showToast('📦 Detail', `ID: ${orderId}`, 'info');
}

// ============================================================
// RENDER PROFILE
// ============================================================
function renderProfilePage() {
    const userView = $('userProfileView');
    const guestView = $('guestProfileView');
    
    if (currentUser) {
        if (userView) userView.style.display = 'block';
        if (guestView) guestView.style.display = 'none';
        
        $('userProfileName').textContent = currentUser.name || 'User';
        $('userProfileEmail').textContent = currentUser.email || 'user@example.com';
        $('userProfileImg').src = currentUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}`;
        
        const orderCount = orders.filter(o => o.customer?.email === currentUser.email).length;
        $('statOrderCount').textContent = orderCount;
    } else {
        if (userView) userView.style.display = 'none';
        if (guestView) guestView.style.display = 'block';
    }
}

// ============================================================
// NAVIGATION
// ============================================================
function navigateTo(page) {
    qsa('.page').forEach(p => p.classList.remove('active'));
    const target = $('page-' + page);
    if (target) target.classList.add('active');
    
    qsa('.bottom-nav .nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) item.classList.add('active');
    });
    
    localStorage.setItem('joellCurrentPage', page);
    
    if (page === 'orders') renderOrdersList();
    if (page === 'profile') renderProfilePage();
}

// ============================================================
// GOOGLE LOGIN
// ============================================================
function handleGoogleLogin(response) {
    const payload = jwtDecode(response.credential);
    currentUser = {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        sub: payload.sub
    };
    localStorage.setItem('joellUser', JSON.stringify(currentUser));
    updateUserUI();
    renderProfilePage();
    $('loginOverlay').classList.remove('open');
    showToast('✅ Selamat Datang', `${payload.name}`, 'success');
}

function updateUserUI() {
    const section = $('userSection');
    if (!section) return;
    
    if (currentUser) {
        section.innerHTML = `
            <div class="user-chip" onclick="navigateTo('profile')">
                <img src="${currentUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}`}" alt="user">
                <span class="user-name">${currentUser.name || 'User'}</span>
            </div>
        `;
    } else {
        section.innerHTML = `
            <button class="header-btn" id="loginBtn" title="Login" onclick="$('loginOverlay').classList.add('open')">
                <i class="fas fa-sign-in-alt"></i>
            </button>
        `;
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('joellUser');
    updateUserUI();
    renderProfilePage();
    showToast('👋 Logout', 'Anda telah keluar', 'info');
}

// ============================================================
// SEARCH
// ============================================================
function doSearch() {
    const query = $('searchInput').value.toLowerCase().trim();
    if (!query) {
        showToast('🔍 Cari', 'Masukkan kata kunci', 'info');
        return;
    }
    
    const results = PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
    );
    
    if (results.length === 0) {
        showToast('🔍 Tidak Ditemukan', `"${query}" tidak ditemukan`, 'warning');
        return;
    }
    
    const names = results.map(p => p.name).join(', ');
    showToast('🔍 Hasil Pencarian', `Ditemukan: ${names}`, 'success');
}

// ============================================================
// THEME TOGGLE
// ============================================================
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('joellTheme', next);
    
    const icon = qs('#themeToggle i');
    if (icon) {
        icon.className = next === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 JOELL SHOP - Initializing...');
    
    // Load theme
    const savedTheme = localStorage.getItem('joellTheme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeIcon = qs('#themeToggle i');
    if (themeIcon) {
        themeIcon.className = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Load user
    const savedUser = localStorage.getItem('joellUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    
    // Render everything
    renderMenus();
    renderOrdersList();
    renderProfilePage();
    updateUserUI();
    updateCartUI();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load page
    const savedPage = localStorage.getItem('joellCurrentPage') || 'home';
    navigateTo(savedPage);
    
    console.log('✅ JOELL SHOP - Ready!');
});

function setupEventListeners() {
    // Theme toggle
    $('themeToggle')?.addEventListener('click', toggleTheme);
    
    // Cart open/close
    $('navCart')?.addEventListener('click', () => {
        updateCartUI();
        $('cartOverlay').classList.add('open');
    });
    $('cartCloseBtn')?.addEventListener('click', () => {
        $('cartOverlay').classList.remove('open');
    });
    
    // Clear cart
    $('clearCartBtn')?.addEventListener('click', clearCart);
    
    // Checkout
    $('checkoutBtn')?.addEventListener('click', openCheckout);
    $('checkoutCloseBtn')?.addEventListener('click', () => {
        $('checkoutOverlay').classList.remove('open');
    });
    $('checkoutForm')?.addEventListener('submit', submitOrder);
    
    // Detail modal
    $('detailCloseBtn')?.addEventListener('click', () => {
        $('detailOverlay').classList.remove('open');
    });
    $('addToCartBtn')?.addEventListener('click', () => {
        if (currentProductId) {
            addToCart(currentProductId);
            $('detailOverlay').classList.remove('open');
        }
    });
    $('buyNowBtn')?.addEventListener('click', () => {
        if (currentProductId) {
            addToCart(currentProductId);
            $('detailOverlay').classList.remove('open');
            setTimeout(openCheckout, 300);
        }
    });
    
    // Topup modal
    $('topupCloseBtn')?.addEventListener('click', () => {
        $('topupOverlay').classList.remove('open');
    });
    
    // Login modal
    $('loginCloseBtn')?.addEventListener('click', () => {
        $('loginOverlay').classList.remove('open');
    });
    
    // Tracking
    $('trackBtn')?.addEventListener('click', function() {
        const input = $('trackInput').value.trim();
        if (!input) {
            showToast('⚠️ Kosong', 'Masukkan ID pesanan', 'warning');
            return;
        }
        
        const order = orders.find(o => o.id === input || o.id.toLowerCase() === input.toLowerCase());
        if (!order) {
            showToast('❌ Tidak Ditemukan', `ID "${input}" tidak ditemukan`, 'error');
            return;
        }
        
        $('trackResult').style.display = 'block';
        $('trackOrderId').textContent = '#' + order.id;
        $('trackProducts').textContent = order.items.map(i => `${i.name} x${i.qty}`).join(', ');
        $('trackDate').textContent = new Date(order.createdAt).toLocaleString('id-ID');
        
        showToast('✅ Ditemukan', `Pesanan ${order.id}`, 'success');
    });
    
    // Logout
    $('btnProfileLogoutPage')?.addEventListener('click', logout);
    
    // Payment close
    $('paymentCloseBtn')?.addEventListener('click', () => {
        $('paymentOverlay').classList.remove('open');
    });
    
    // Payment method switching
    qsa('.payment-method-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            qsa('.payment-method-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const method = this.dataset.method;
            $('paymentQrisSection').style.display = method === 'qris' ? 'block' : 'none';
            $('paymentBankSection').style.display = method === 'bank' ? 'block' : 'none';
        });
    });
    
    // Back to top
    const backBtn = $('backToTop');
    if (backBtn) {
        window.addEventListener('scroll', () => {
            backBtn.classList.toggle('visible', window.scrollY > 300);
        });
        backBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Login button
    $('loginBtn')?.addEventListener('click', () => {
        $('loginOverlay').classList.add('open');
    });
}

// ============================================================
// EXPOSE GLOBALLY
// ============================================================
window.PRODUCTS = PRODUCTS;
window.cart = cart;
window.orders = orders;
window.currentUser = currentUser;
window.selectedVariant = selectedVariant;
window.currentProductId = currentProductId;

window.renderMenus = renderMenus;
window.openDetail = openDetail;
window.selectVariant = selectVariant;
window.addToCart = addToCart;
window.updateCartUI = updateCartUI;
window.updateQty = updateQty;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.openCheckout = openCheckout;
window.submitOrder = submitOrder;
window.openPaymentModal = openPaymentModal;
window.renderOrdersList = renderOrdersList;
window.renderProfilePage = renderProfilePage;
window.navigateTo = navigateTo;
window.handleGoogleLogin = handleGoogleLogin;
window.updateUserUI = updateUserUI;
window.logout = logout;
window.doSearch = doSearch;
window.toggleTheme = toggleTheme;
window.showToast = showToast;
window.fetchBalance = fetchBalance;
window.renderInvoiceHistory = renderInvoiceHistory;
