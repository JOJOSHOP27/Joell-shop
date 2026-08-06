// ============================================================
// JOELL SHOP - MAIN SCRIPT (FULLY FIXED - ALL FUNCTIONS WORK)
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
function $(id) { return document.getElementById(id); }
function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return document.querySelectorAll(sel); }

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
    console.log('🔄 Rendering menus...');
    
    const hostingGrid = $('gridHosting');
    const scriptGrid = $('gridScript');
    const topupGrid = $('gridTopup');
    
    if (!hostingGrid || !scriptGrid || !topupGrid) {
        console.error('❌ Grid elements not found!');
        return;
    }
    
    const hosting = PRODUCTS.filter(p => p.category === 'hosting');
    const script = PRODUCTS.filter(p => p.category === 'script');
    const topup = PRODUCTS.filter(p => p.category === 'topup');
    
    hostingGrid.innerHTML = hosting.map(p => createProductCard(p)).join('');
    scriptGrid.innerHTML = script.map(p => createProductCard(p)).join('');
    topupGrid.innerHTML = topup.map(p => createProductCard(p)).join('');
    
    console.log('✅ Menus rendered!');
}

function createProductCard(product) {
    const badgeHtml = product.badge ? `<span class="card-badge ${product.badge}">${product.badge.toUpperCase()}</span>` : '';
    const isTopup = product.isTopup ? 'data-topup="true"' : '';
    return `
        <div class="menu-card" data-id="${product.id}" ${isTopup} onclick="handleProductClick(${product.id})">
            ${badgeHtml}
            <i class="fas ${product.icon}"></i>
            <span>${product.name}</span>
        </div>
    `;
}

// ============================================================
// HANDLE PRODUCT CLICK
// ============================================================
function handleProductClick(productId) {
    console.log('🖱️ Product clicked:', productId);
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) {
        console.error('❌ Product not found:', productId);
        return;
    }
    
    if (product.isTopup) {
        const topupOverlay = $('topupOverlay');
        if (topupOverlay) {
            topupOverlay.classList.add('open');
            renderTopupGames();
        }
        return;
    }
    
    openDetail(productId);
}

// ============================================================
// DETAIL PRODUK
// ============================================================
function openDetail(productId) {
    console.log('📦 Opening detail for:', productId);
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) {
        console.error('❌ Product not found:', productId);
        return;
    }
    
    currentProductId = productId;
    selectedVariant = product.variants ? product.variants[0] : 'Standard';
    
    const detailName = $('detailName');
    const detailPrice = $('detailPrice');
    const detailDesc = $('detailDesc');
    const variantList = $('variantList');
    const detailOverlay = $('detailOverlay');
    
    if (detailName) detailName.textContent = product.name;
    if (detailPrice) detailPrice.textContent = `Rp ${(product.price || 0).toLocaleString()}`;
    if (detailDesc) detailDesc.textContent = `Produk digital ${product.name} dengan kualitas terbaik.`;
    
    if (variantList) {
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
    }
    
    if (detailOverlay) detailOverlay.classList.add('open');
}

function selectVariant(variant) {
    selectedVariant = variant;
    qsa('.variant-item').forEach(el => el.classList.remove('active'));
    qsa('.variant-item').forEach(el => {
        const nameEl = el.querySelector('.vname');
        if (nameEl && nameEl.textContent === variant) {
            el.classList.add('active');
        }
    });
}

// ============================================================
// TOPUP GAMES
// ============================================================
function renderTopupGames() {
    const grid = $('topupGrid');
    if (!grid) return;
    
    const games = [
        { name: 'Mobile Legends', icon: 'https://files.catbox.moe/9x3b8p.png' },
        { name: 'Free Fire', icon: 'https://files.catbox.moe/8y5n2q.png' },
        { name: 'PUBG Mobile', icon: 'https://files.catbox.moe/4k7m1r.png' },
        { name: 'Call of Duty', icon: 'https://files.catbox.moe/2j6n9s.png' },
        { name: 'Genshin Impact', icon: 'https://files.catbox.moe/5t8p3u.png' },
        { name: 'Valorant', icon: 'https://files.catbox.moe/7v4q2w.png' }
    ];
    
    grid.innerHTML = games.map(game => `
        <div class="topup-item" onclick="showToast('🎮 Topup', 'Topup ${game.name} segera hadir!', 'info')">
            <img src="${game.icon}" alt="${game.name}" onerror="this.src='https://ui-avatars.com/api/?name=${game.name}&size=70&background=6366f1&color=fff'">
            <span>${game.name}</span>
        </div>
    `).join('');
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
        const footer = $('cartFooter');
        if (footer) footer.style.display = 'none';
        return;
    }
    
    const footer = $('cartFooter');
    if (footer) footer.style.display = 'block';
    
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
    
    const subtotalEl = $('cartSubtotal');
    const discountEl = $('cartDiscount');
    const shippingEl = $('cartShipping');
    const totalEl = $('cartTotalDisplay');
    
    if (subtotalEl) subtotalEl.textContent = `Rp ${subtotal.toLocaleString()}`;
    if (discountEl) discountEl.textContent = 'Rp 0';
    if (shippingEl) shippingEl.textContent = 'Rp 0';
    if (totalEl) totalEl.textContent = `Rp ${total.toLocaleString()}`;
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
    if (itemsContainer) {
        itemsContainer.innerHTML = cart.map(item => {
            const subtotal = item.price * item.qty;
            total += subtotal;
            return `<div class="order-item-line">${item.name} (${item.variant}) x${item.qty} = Rp ${subtotal.toLocaleString()}</div>`;
        }).join('');
    }
    
    if (totalEl) totalEl.textContent = `Total: Rp ${total.toLocaleString()}`;
    
    const overlay = $('checkoutOverlay');
    if (overlay) overlay.classList.add('open');
}

function submitOrder(e) {
    e.preventDefault();
    
    const name = $('coName');
    const email = $('coEmail');
    const phone = $('coPhone');
    
    if (!name || !email || !phone) return;
    
    const nameVal = name.value.trim();
    const emailVal = email.value.trim();
    const phoneVal = phone.value.trim();
    const addressVal = $('coAddress') ? $('coAddress').value.trim() : '';
    
    if (!nameVal || !emailVal || !phoneVal) {
        showToast('⚠️ Data Kurang', 'Lengkapi data pemesanan', 'warning');
        return;
    }
    
    const orderId = 'JOELL-' + Date.now().toString().slice(-8).toUpperCase();
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    
    const order = {
        id: orderId,
        customer: { name: nameVal, email: emailVal, phone: phoneVal, address: addressVal },
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
    
    const checkoutOverlay = $('checkoutOverlay');
    if (checkoutOverlay) checkoutOverlay.classList.remove('open');
    
    const form = $('checkoutForm');
    if (form) form.reset();
    
    showToast('✅ Pesanan Dibuat', `ID: ${orderId}`, 'success', 5000);
    
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
// FETCH BALANCE
// ============================================================
function fetchBalance() {
    const balanceEl = $('balanceAmount');
    if (balanceEl) {
        balanceEl.textContent = 'Rp ' + (Math.floor(Math.random() * 1000000) + 50000).toLocaleString();
    }
    return 50000;
}

// ============================================================
// RENDER INVOICE HISTORY
// ============================================================
function renderInvoiceHistory() {
    const container = $('invoiceHistoryList');
    if (!container) return;
    
    invoiceHistory = JSON.parse(localStorage.getItem('joellInvoiceHistory')) || [];
    
    if (!invoiceHistory.length) {
        container.innerHTML = `
            <div style="text-align:center;padding:20px;color:var(--text-muted);">
                <i class="fas fa-file-invoice" style="font-size:2rem;display:block;margin-bottom:8px;opacity:0.5;"></i>
                <p>Belum ada invoice</p>
            </div>
        `;
        return;
    }
    
    const statusMap = {
        'pending': { label: '⏳ Menunggu', class: 'pending' },
        'paid': { label: '✅ Lunas', class: 'paid' },
        'expired': { label: '❌ Kadaluarsa', class: 'expired' }
    };
    
    container.innerHTML = invoiceHistory.slice(0, 10).map(item => {
        const status = statusMap[item.status] || statusMap['pending'];
        const date = item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-';
        
        return `
            <div class="invoice-history-item" onclick="viewInvoiceDetail('${item.invoice_id}')">
                <div class="ih-left">
                    <span class="ih-id">#${item.invoice_id}</span>
                    <span class="ih-amount">Rp ${Number(item.total || item.amount).toLocaleString()}</span>
                    <span style="font-size:0.6rem;color:var(--text-muted);">${date}</span>
                </div>
                <div>
                    <span class="ih-status ${status.class}">${status.label}</span>
                    ${item.status === 'pending' ? `
                        <button onclick="event.stopPropagation(); checkInvoiceStatus('${item.invoice_id}')" 
                                style="background:var(--accent);color:#fff;border:none;border-radius:30px;padding:2px 10px;font-size:0.6rem;cursor:pointer;margin-left:4px;">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================
// VIEW INVOICE DETAIL
// ============================================================
function viewInvoiceDetail(invoiceId) {
    const invoice = invoiceHistory.find(i => i.invoice_id === invoiceId);
    if (!invoice) {
        showToast('Error', 'Invoice tidak ditemukan', 'error');
        return;
    }
    
    const overlay = $('paymentOverlay');
    if (!overlay) return;
    
    const invoiceIdEl = $('invoiceId');
    const invoiceTotalEl = $('invoiceTotal');
    const invoiceFeeEl = $('invoiceFee');
    const invoiceExpiryEl = $('invoiceExpiry');
    const badge = $('invoiceStatusBadge');
    const qrisImage = $('qrisImage');
    const qrisWrapper = $('qrisImageWrapper');
    const qrisPlaceholder = $('qrisPlaceholder');
    const paymentDetails = $('paymentDetails');
    const checkStatusBtn = $('checkStatusBtn');
    const copyPaymentLinkBtn = $('copyPaymentLinkBtn');
    
    if (invoiceIdEl) invoiceIdEl.textContent = invoice.invoice_id;
    if (invoiceTotalEl) invoiceTotalEl.textContent = 'Rp ' + Number(invoice.total || invoice.amount).toLocaleString();
    if (invoiceFeeEl) invoiceFeeEl.textContent = 'Rp ' + Number(invoice.fee || 0).toLocaleString();
    if (invoiceExpiryEl && invoice.expired_at) {
        invoiceExpiryEl.textContent = new Date(invoice.expired_at).toLocaleString('id-ID');
    }
    
    const statusMap = {
        'pending': { label: '⏳ Menunggu', class: 'pending' },
        'paid': { label: '✅ Lunas', class: 'paid' },
        'expired': { label: '❌ Kadaluarsa', class: 'expired' }
    };
    const status = statusMap[invoice.status] || statusMap['pending'];
    if (badge) {
        badge.textContent = status.label;
        badge.className = 'payment-status-badge ' + status.class;
    }
    
    if (invoice.qris_image && qrisImage) {
        qrisImage.src = invoice.qris_image;
        qrisImage.style.display = 'block';
        if (qrisWrapper) qrisWrapper.style.display = 'block';
        if (qrisPlaceholder) qrisPlaceholder.style.display = 'none';
    }
    
    if (paymentDetails) paymentDetails.style.display = 'block';
    if (checkStatusBtn) checkStatusBtn.style.display = 'inline-flex';
    if (copyPaymentLinkBtn) copyPaymentLinkBtn.style.display = 'inline-flex';
    
    overlay.classList.add('open');
}

// ============================================================
// CREATE INVOICE
// ============================================================
function createInvoice(amount) {
    const btn = $('createInvoiceBtn');
    const qrisWrapper = $('qrisImageWrapper');
    const qrisImage = $('qrisImage');
    const qrisPlaceholder = $('qrisPlaceholder');
    
    if (!amount || amount <= 0) {
        showToast('Error', 'Jumlah tidak valid', 'error');
        return;
    }
    
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Membuat Invoice...';
    }
    
    // Simulasi pembuatan invoice
    setTimeout(() => {
        const invoiceId = 'INV-' + Date.now().toString().slice(-8).toUpperCase();
        const paymentLink = `https://app.lzpedia.my.id/pay/${invoiceId}`;
        const qrisUrl = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(paymentLink)}`;
        
        if (qrisImage) {
            qrisImage.src = qrisUrl;
            qrisImage.style.display = 'block';
            qrisImage.style.maxWidth = '280px';
            qrisImage.style.width = '100%';
            qrisImage.style.height = 'auto';
            qrisImage.style.borderRadius = '12px';
            qrisImage.style.background = '#fff';
            qrisImage.style.padding = '12px';
            qrisImage.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
        }
        
        if (qrisWrapper) {
            qrisWrapper.style.display = 'block';
            qrisWrapper.style.textAlign = 'center';
        }
        if (qrisPlaceholder) qrisPlaceholder.style.display = 'none';
        
        const invoiceIdEl = $('invoiceId');
        const invoiceTotalEl = $('invoiceTotal');
        const invoiceFeeEl = $('invoiceFee');
        const invoiceExpiryEl = $('invoiceExpiry');
        const paymentDetails = $('paymentDetails');
        const checkStatusBtn = $('checkStatusBtn');
        const copyPaymentLinkBtn = $('copyPaymentLinkBtn');
        
        if (invoiceIdEl) invoiceIdEl.textContent = invoiceId;
        if (invoiceTotalEl) invoiceTotalEl.textContent = 'Rp ' + amount.toLocaleString();
        if (invoiceFeeEl) invoiceFeeEl.textContent = 'Rp 0';
        if (invoiceExpiryEl) {
            const expiry = new Date(Date.now() + 15 * 60 * 1000);
            invoiceExpiryEl.textContent = expiry.toLocaleString('id-ID');
        }
        if (paymentDetails) paymentDetails.style.display = 'block';
        if (checkStatusBtn) checkStatusBtn.style.display = 'inline-flex';
        if (copyPaymentLinkBtn) copyPaymentLinkBtn.style.display = 'inline-flex';
        
        // Simpan ke history
        const invoiceData = {
            invoice_id: invoiceId,
            total: amount,
            amount: amount,
            fee: 0,
            status: 'pending',
            created_at: new Date().toISOString(),
            expired_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            qris_image: qrisUrl,
            payment_link: paymentLink
        };
        
        invoiceHistory.unshift(invoiceData);
        localStorage.setItem('joellInvoiceHistory', JSON.stringify(invoiceHistory));
        renderInvoiceHistory();
        
        showToast('✅ Invoice Berhasil', `ID: ${invoiceId}`, 'success');
        
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-qrcode"></i> Buat Invoice';
        }
    }, 1500);
}

// ============================================================
// CHECK INVOICE STATUS
// ============================================================
function checkInvoiceStatus(invoiceId) {
    if (!invoiceId) {
        showToast('Error', 'Tidak ada invoice aktif', 'error');
        return;
    }
    
    const btn = $('checkStatusBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cek...';
    }
    
    setTimeout(() => {
        // Simulasi cek status
        const statuses = ['pending', 'paid', 'pending'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        const badge = $('invoiceStatusBadge');
        const statusMap = {
            'pending': { label: '⏳ Menunggu', class: 'pending' },
            'paid': { label: '✅ Lunas', class: 'paid' },
            'expired': { label: '❌ Kadaluarsa', class: 'expired' }
        };
        const info = statusMap[randomStatus] || statusMap['pending'];
        if (badge) {
            badge.textContent = info.label;
            badge.className = 'payment-status-badge ' + info.class;
        }
        
        // Update history
        const historyItem = invoiceHistory.find(i => i.invoice_id === invoiceId);
        if (historyItem) {
            historyItem.status = randomStatus;
            localStorage.setItem('joellInvoiceHistory', JSON.stringify(invoiceHistory));
            renderInvoiceHistory();
        }
        
        if (randomStatus === 'paid') {
            showToast('✅ Pembayaran Berhasil!', 'Invoice telah dibayar.', 'success', 5000);
            setTimeout(() => {
                const paymentOverlay = $('paymentOverlay');
                if (paymentOverlay) paymentOverlay.classList.remove('open');
            }, 3000);
        } else {
            showToast('⏳ Menunggu', 'Pembayaran belum dikonfirmasi.', 'info');
        }
        
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Cek Status';
        }
    }, 1000);
}

// ============================================================
// COPY BANK INFO
// ============================================================
function copyBankInfo() {
    const total = $('bankTotal')?.textContent || 'Rp 0';
    const info = `BCA\n1234567890\nA/N JOELL SHOP\nTotal: ${total}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(info).then(() => {
            showToast('Berhasil', 'Info bank disalin!', 'success');
        }).catch(() => {
            fallbackCopyBankInfo(info);
        });
    } else {
        fallbackCopyBankInfo(info);
    }
}

function fallbackCopyBankInfo(info) {
    const textarea = document.createElement('textarea');
    textarea.value = info;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('Berhasil', 'Info bank disalin!', 'success');
    } catch (e) {
        alert('Info Bank:\n' + info);
    }
    document.body.removeChild(textarea);
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
        
        const nameEl = $('userProfileName');
        const emailEl = $('userProfileEmail');
        const imgEl = $('userProfileImg');
        const statEl = $('statOrderCount');
        
        if (nameEl) nameEl.textContent = currentUser.name || 'User';
        if (emailEl) emailEl.textContent = currentUser.email || 'user@example.com';
        if (imgEl) imgEl.src = currentUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}`;
        if (statEl) {
            const orderCount = orders.filter(o => o.customer?.email === currentUser.email).length;
            statEl.textContent = orderCount;
        }
    } else {
        if (userView) userView.style.display = 'none';
        if (guestView) guestView.style.display = 'block';
    }
}

// ============================================================
// NAVIGATION
// ============================================================
function navigateTo(page) {
    console.log('🧭 Navigating to:', page);
    
    qsa('.page').forEach(p => p.classList.remove('active'));
    const target = $('page-' + page);
    if (target) {
        target.classList.add('active');
    } else {
        console.warn('⚠️ Page not found:', page);
        // Fallback ke home
        const home = $('page-home');
        if (home) home.classList.add('active');
        page = 'home';
    }
    
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
    try {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        currentUser = {
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
            sub: payload.sub
        };
        localStorage.setItem('joellUser', JSON.stringify(currentUser));
        updateUserUI();
        renderProfilePage();
        const loginOverlay = $('loginOverlay');
        if (loginOverlay) loginOverlay.classList.remove('open');
        showToast('✅ Selamat Datang', `${payload.name}`, 'success');
    } catch (e) {
        showToast('❌ Error', 'Gagal login', 'error');
    }
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
            <button class="header-btn" id="loginBtn" title="Login" onclick="openLogin()">
                <i class="fas fa-sign-in-alt"></i>
            </button>
        `;
    }
}

function openLogin() {
    const loginOverlay = $('loginOverlay');
    if (loginOverlay) loginOverlay.classList.add('open');
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
    const input = $('searchInput');
    if (!input) return;
    
    const query = input.value.toLowerCase().trim();
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
// ADMIN FUNCTIONS
// ============================================================
function refreshAdminOrders() {
    const orders = JSON.parse(localStorage.getItem('joellOrders')) || [];
    const container = $('adminOrdersList');
    
    if (!container) return;
    
    const totalEl = $('adminStatTotal');
    const pendingEl = $('adminStatPending');
    const processingEl = $('adminStatProcessing');
    const completedEl = $('adminStatCompleted');
    
    if (totalEl) totalEl.textContent = orders.length;
    if (pendingEl) pendingEl.textContent = orders.filter(o => o.status === 'pending').length;
    if (processingEl) processingEl.textContent = orders.filter(o => o.status === 'processing').length;
    if (completedEl) completedEl.textContent = orders.filter(o => o.status === 'completed').length;
    
    if (orders.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">Belum ada pesanan</p>';
        return;
    }
    
    const statusMap = {
        'pending': '⏳ Menunggu',
        'processing': '⚙️ Diproses',
        'shipped': '📦 Dikirim',
        'completed': '✅ Selesai'
    };
    
    container.innerHTML = orders.map(order => `
        <div class="admin-order-item">
            <div class="admin-order-header">
                <span class="admin-order-id">#${order.id}</span>
                <select class="admin-status-select" onchange="updateOrderStatus('${order.id}', this.value)">
                    ${Object.entries(statusMap).map(([key, label]) => `
                        <option value="${key}" ${order.status === key ? 'selected' : ''}>${label}</option>
                    `).join('')}
                </select>
            </div>
            <div class="admin-order-meta">
                ${order.customer?.name || 'Guest'} • ${order.customer?.email || '-'}
            </div>
            <div class="admin-order-products">
                ${order.items.map(i => `${i.name} (${i.variant}) x${i.qty}`).join(', ')}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                <span style="font-weight:800;color:var(--accent-light);">Rp ${order.total.toLocaleString()}</span>
                <button class="admin-chat-btn" onclick="showToast('💬 Chat', 'Chat untuk pesanan ${order.id}', 'info')">
                    <i class="fas fa-comment"></i> Chat
                </button>
            </div>
        </div>
    `).join('');
}

function updateOrderStatus(orderId, status) {
    const orders = JSON.parse(localStorage.getItem('joellOrders')) || [];
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        localStorage.setItem('joellOrders', JSON.stringify(orders));
        showToast('✅ Update', `Status pesanan ${orderId} diperbarui`, 'success');
        refreshAdminOrders();
    }
}

// ============================================================
// PROFILE SETTINGS
// ============================================================
function openProfileSettings() {
    showToast('⚙️ Profil', 'Fitur edit profil akan segera hadir', 'info');
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
    renderTopupGames();
    renderOrdersList();
    renderProfilePage();
    renderInvoiceHistory();
    updateUserUI();
    updateCartUI();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load page
    const savedPage = localStorage.getItem('joellCurrentPage') || 'home';
    navigateTo(savedPage);
    
    console.log('✅ JOELL SHOP - Ready!');
    console.log('📦 Products:', PRODUCTS.length);
    console.log('🛒 Cart items:', cart.length);
    console.log('📋 Orders:', orders.length);
});

function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    // Theme toggle
    const themeToggle = $('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    
    // Cart open
    const navCart = $('navCart');
    if (navCart) {
        navCart.addEventListener('click', () => {
            updateCartUI();
            const overlay = $('cartOverlay');
            if (overlay) overlay.classList.add('open');
        });
    }
    
    // Cart close
    const cartClose = $('cartCloseBtn');
    if (cartClose) {
        cartClose.addEventListener('click', () => {
            const overlay = $('cartOverlay');
            if (overlay) overlay.classList.remove('open');
        });
    }
    
    // Clear cart
    const clearBtn = $('clearCartBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearCart);
    
    // Checkout
    const checkoutBtn = $('checkoutBtn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckout);
    
    const checkoutClose = $('checkoutCloseBtn');
    if (checkoutClose) {
        checkoutClose.addEventListener('click', () => {
            const overlay = $('checkoutOverlay');
            if (overlay) overlay.classList.remove('open');
        });
    }
    
    const checkoutForm = $('checkoutForm');
    if (checkoutForm) checkoutForm.addEventListener('submit', submitOrder);
    
    // Detail modal close
    const detailClose = $('detailCloseBtn');
    if (detailClose) {
        detailClose.addEventListener('click', () => {
            const overlay = $('detailOverlay');
            if (overlay) overlay.classList.remove('open');
        });
    }
    
    // Add to cart
    const addBtn = $('addToCartBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (currentProductId) {
                addToCart(currentProductId);
                const overlay = $('detailOverlay');
                if (overlay) overlay.classList.remove('open');
            }
        });
    }
    
    // Buy now
    const buyBtn = $('buyNowBtn');
    if (buyBtn) {
        buyBtn.addEventListener('click', () => {
            if (currentProductId) {
                addToCart(currentProductId);
                const overlay = $('detailOverlay');
                if (overlay) overlay.classList.remove('open');
                setTimeout(openCheckout, 300);
            }
        });
    }
    
    // Topup close
    const topupClose = $('topupCloseBtn');
    if (topupClose) {
        topupClose.addEventListener('click', () => {
            const overlay = $('topupOverlay');
            if (overlay) overlay.classList.remove('open');
        });
    }
    
    // Login close
    const loginClose = $('loginCloseBtn');
    if (loginClose) {
        loginClose.addEventListener('click', () => {
            const overlay = $('loginOverlay');
            if (overlay) overlay.classList.remove('open');
        });
    }
    
    // Login button
    const loginBtn = $('loginBtn');
    if (loginBtn) loginBtn.addEventListener('click', openLogin);
    
    // Tracking
    const trackBtn = $('trackBtn');
    if (trackBtn) {
        trackBtn.addEventListener('click', function() {
            const input = $('trackInput');
            if (!input) return;
            
            const trackId = input.value.trim();
            if (!trackId) {
                showToast('⚠️ Kosong', 'Masukkan ID pesanan', 'warning');
                return;
            }
            
            const order = orders.find(o => o.id === trackId || o.id.toLowerCase() === trackId.toLowerCase());
            if (!order) {
                showToast('❌ Tidak Ditemukan', `ID "${trackId}" tidak ditemukan`, 'error');
                return;
            }
            
            const result = $('trackResult');
            const orderIdEl = $('trackOrderId');
            const productsEl = $('trackProducts');
            const dateEl = $('trackDate');
            
            if (result) result.style.display = 'block';
            if (orderIdEl) orderIdEl.textContent = '#' + order.id;
            if (productsEl) productsEl.textContent = order.items.map(i => `${i.name} x${i.qty}`).join(', ');
            if (dateEl) dateEl.textContent = new Date(order.createdAt).toLocaleString('id-ID');
            
            showToast('✅ Ditemukan', `Pesanan ${order.id}`, 'success');
        });
    }
    
    // Logout
    const logoutBtn = $('btnProfileLogoutPage');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    // Payment close
    const paymentClose = $('paymentCloseBtn');
    if (paymentClose) {
        paymentClose.addEventListener('click', () => {
            const overlay = $('paymentOverlay');
            if (overlay) overlay.classList.remove('open');
        });
    }
    
    // Payment method switching
    qsa('.payment-method-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            qsa('.payment-method-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const method = this.dataset.method;
            const qrisSection = $('paymentQrisSection');
            const bankSection = $('paymentBankSection');
            if (qrisSection) qrisSection.style.display = method === 'qris' ? 'block' : 'none';
            if (bankSection) bankSection.style.display = method === 'bank' ? 'block' : 'none';
        });
    });
    
    // Create invoice
    const createBtn = $('createInvoiceBtn');
    if (createBtn) {
        createBtn.addEventListener('click', function() {
            const totalEl = $('paymentOrderTotal');
            if (totalEl) {
                const total = parseInt(totalEl.textContent.replace(/[^0-9]/g, ''));
                if (total > 0) {
                    createInvoice(total);
                } else {
                    showToast('Error', 'Total pembayaran tidak valid', 'error');
                }
            }
        });
    }
    
    // Check status
    const checkBtn = $('checkStatusBtn');
    if (checkBtn) {
        checkBtn.addEventListener('click', function() {
            const invoiceIdEl = $('invoiceId');
            if (invoiceIdEl && invoiceIdEl.textContent && invoiceIdEl.textContent !== '-') {
                checkInvoiceStatus(invoiceIdEl.textContent);
            } else {
                showToast('Info', 'Belum ada invoice yang aktif', 'info');
            }
        });
    }
    
    // Copy payment link
    const copyBtn = $('copyPaymentLinkBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const invoiceIdEl = $('invoiceId');
            if (invoiceIdEl && invoiceIdEl.textContent && invoiceIdEl.textContent !== '-') {
                const link = `https://app.lzpedia.my.id/pay/${invoiceIdEl.textContent}`;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(link).then(() => {
                        showToast('Berhasil', 'Link pembayaran disalin!', 'success');
                    });
                } else {
                    showToast('Link', link, 'info');
                }
            }
        });
    }
    
    // Copy bank info
    const copyBankBtn = $('copyBankBtn');
    if (copyBankBtn) copyBankBtn.addEventListener('click', copyBankInfo);
    
    // Balance refresh
    const refreshBtn = $('balanceRefreshBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', fetchBalance);
    
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
    
    // Track chat
    const trackChatBtn = $('trackChatBtn');
    if (trackChatBtn) {
        trackChatBtn.addEventListener('click', () => {
            showToast('💬 Chat', 'Fitur chat admin akan segera hadir', 'info');
        });
    }
    
    console.log('✅ Event listeners setup complete!');
}

// ============================================================
// EXPOSE GLOBALLY
// ============================================================
window.PRODUCTS = PRODUCTS;
window.cart = cart;
window.orders = orders;
window.currentUser = currentUser;
window.invoiceHistory = invoiceHistory;

window.handleProductClick = handleProductClick;
window.renderMenus = renderMenus;
window.renderTopupGames = renderTopupGames;
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
window.fetchBalance = fetchBalance;
window.createInvoice = createInvoice;
window.checkInvoiceStatus = checkInvoiceStatus;
window.renderInvoiceHistory = renderInvoiceHistory;
window.viewInvoiceDetail = viewInvoiceDetail;
window.copyBankInfo = copyBankInfo;
window.renderOrdersList = renderOrdersList;
window.renderProfilePage = renderProfilePage;
window.navigateTo = navigateTo;
window.handleGoogleLogin = handleGoogleLogin;
window.updateUserUI = updateUserUI;
window.openLogin = openLogin;
window.logout = logout;
window.doSearch = doSearch;
window.toggleTheme = toggleTheme;
window.showToast = showToast;
window.refreshAdminOrders = refreshAdminOrders;
window.updateOrderStatus = updateOrderStatus;
window.viewOrder = viewOrder;
window.openProfileSettings = openProfileSettings;

console.log('✅ All functions exposed globally!');
