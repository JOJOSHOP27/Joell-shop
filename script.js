// ============================================================
// JOELL SHOP - MAIN SCRIPT (LANJUTAN)
// ============================================================

// ============================================================
// VIEW INVOICE DETAIL - LANJUTAN
// ============================================================
function viewInvoiceDetail(invoiceId) {
    const invoice = invoiceHistory.find(i => i.invoice_id === invoiceId);
    if (!invoice) { showToast('Error', 'Invoice tidak ditemukan', 'error'); return; }
    const overlay = $('paymentOverlay');
    if (!overlay) return;
    $('invoiceId').textContent = invoice.invoice_id;
    $('invoiceTotal').textContent = 'Rp ' + Number(invoice.total || invoice.amount).toLocaleString();
    $('invoiceFee').textContent = 'Rp ' + Number(invoice.fee || 0).toLocaleString();
    if (invoice.expired_at) $('invoiceExpiry').textContent = new Date(invoice.expired_at).toLocaleString('id-ID');
    const statusMap = { 'pending': { label: '⏳ Menunggu', class: 'pending' }, 'paid': { label: '✅ Lunas', class: 'paid' }, 'expired': { label: '❌ Kadaluarsa', class: 'expired' } };
    const status = statusMap[invoice.status] || statusMap['pending'];
    const badge = $('invoiceStatusBadge');
    if (badge) { badge.textContent = status.label; badge.className = 'payment-status-badge ' + status.class; }
    $('paymentDetails').style.display = 'block';
    $('paymentTimer').style.display = 'none';
    $('checkStatusBtn').style.display = 'inline-flex';
    $('copyPaymentLinkBtn').style.display = 'inline-flex';
    
    // Tampilkan QRIS jika ada
    const qrisWrapper = $('qrisImageWrapper');
    const qrisImage = $('qrisImage');
    const qrisPlaceholder = $('qrisPlaceholder');
    if (invoice.qris_image && qrisImage) {
        qrisImage.src = invoice.qris_image + '&t=' + Date.now();
        qrisImage.style.display = 'block';
        qrisImage.style.maxWidth = '280px';
        qrisImage.style.width = '100%';
        qrisImage.style.height = 'auto';
        qrisImage.style.borderRadius = '12px';
        qrisImage.style.background = '#fff';
        qrisImage.style.padding = '12px';
        qrisImage.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
        qrisImage.style.margin = '0 auto';
        if (qrisWrapper) qrisWrapper.style.display = 'block';
        if (qrisPlaceholder) qrisPlaceholder.style.display = 'none';
    }
    currentInvoiceId = invoice.invoice_id;
    overlay.classList.add('open');
}

// ============================================================
// COPY PAYMENT LINK
// ============================================================
function copyPaymentLink() {
    const link = document.querySelector('#paymentDetails .detail-row .value')?.textContent || '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(() => showToast('Berhasil', 'Link pembayaran disalin!', 'success')).catch(() => fallbackCopy(link));
    } else { fallbackCopy(link); }
}
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand('copy'); showToast('Berhasil', 'Link pembayaran disalin!', 'success'); } catch (e) { alert('Link: ' + text); }
    document.body.removeChild(textarea);
}

// ============================================================
// ORDERS FUNCTIONS
// ============================================================
function renderOrders() {
    const container = $('ordersListContainer');
    if (!container) return;
    orders = JSON.parse(localStorage.getItem('joellOrders')) || [];
    if (orders.length === 0) {
        container.innerHTML = `<div class="empty-orders"><i class="fas fa-box-open"></i><h3>Belum ada pesanan</h3><p>Yuk mulai berbelanja!</p></div>`;
        return;
    }
    const statusMap = { 'pending': { label: '⏳ Menunggu', class: 'pending' }, 'processing': { label: '🔄 Diproses', class: 'processing' }, 'completed': { label: '✅ Selesai', class: 'completed' }, 'expired': { label: '❌ Kadaluarsa', class: 'expired' } };
    container.innerHTML = orders.map(order => {
        const status = statusMap[order.status] || statusMap['pending'];
        const items = order.items?.map(i => `${i.name} (${i.variant}) x${i.qty}`).join(', ') || '';
        return `<div class="order-card" onclick="viewOrder('${order.id}')">
            <div class="order-header"><span class="order-id">#${order.id}</span><span class="order-status ${status.class}">${status.label}</span></div>
            <div class="order-items">${items}</div>
            <div class="order-footer"><span class="order-total">Rp ${Number(order.total).toLocaleString()}</span><span class="order-date">${new Date(order.createdAt).toLocaleString('id-ID')}</span></div>
        </div>`;
    }).join('');
}

function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) { showToast('Error', 'Pesanan tidak ditemukan', 'error'); return; }
    showToast('📦 Order Detail', `ID: ${order.id}\nTotal: Rp ${Number(order.total).toLocaleString()}\nStatus: ${order.status}`, 'info', 5000);
}

// ============================================================
// GOOGLE LOGIN
// ============================================================
function handleGoogleLogin(response) {
    if (!response || !response.credential) { showToast('Error', 'Login Gagal', 'error'); return; }
    try {
        const payload = parseJwt(response.credential);
        if (!payload) throw new Error('Invalid token');
        currentUser = {
            id: payload.sub,
            name: payload.name || 'User',
            email: payload.email || 'user@example.com',
            picture: payload.picture || 'https://ui-avatars.com/api/?name=User',
            verified: payload.email_verified || false
        };
        localStorage.setItem('joellUser', JSON.stringify(currentUser));
        updateUserUI();
        showToast('✅ Login Berhasil', `Selamat datang ${currentUser.name}!`, 'success');
        $('loginOverlay').classList.remove('open');
    } catch (error) {
        console.error('Login Error:', error);
        showToast('Error', 'Login Gagal', 'error');
    }
}

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) { return null; }
}

function updateUserUI() {
    const userSection = $('userSection');
    const loginBtn = $('loginBtn');
    if (!userSection) return;
    if (currentUser) {
        userSection.innerHTML = `<div class="user-avatar" onclick="toggleUserMenu()"><img src="${currentUser.picture || 'https://ui-avatars.com/api/?name=User'}" alt="avatar" width="32" height="32" style="border-radius:50%;border:2px solid var(--accent);cursor:pointer;"></div>`;
        // Update profile page
        const profileView = $('userProfileView');
        const guestView = $('guestProfileView');
        if (profileView) profileView.style.display = 'block';
        if (guestView) guestView.style.display = 'none';
        $('userProfileName').textContent = currentUser.name || 'User';
        $('userProfileEmail').textContent = currentUser.email || 'user@example.com';
        $('userProfileImg').src = currentUser.picture || 'https://ui-avatars.com/api/?name=User';
        const orderCount = orders.filter(o => o.customer?.email === currentUser.email).length;
        $('statOrderCount').textContent = orderCount;
    } else {
        userSection.innerHTML = `<button class="header-btn" id="loginBtn"><i class="fas fa-sign-in-alt"></i></button>`;
        document.getElementById('loginBtn')?.addEventListener('click', () => $('loginOverlay').classList.add('open'));
        const profileView = $('userProfileView');
        const guestView = $('guestProfileView');
        if (profileView) profileView.style.display = 'none';
        if (guestView) guestView.style.display = 'block';
    }
}

// ============================================================
// NAVIGATION
// ============================================================
function navigateTo(page) {
    qsa('.page').forEach(p => p.classList.remove('active'));
    const target = $(`page-${page}`);
    if (target) target.classList.add('active');
    qsa('.nav-item').forEach(n => n.classList.remove('active'));
    const navBtn = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navBtn) navBtn.classList.add('active');
    if (page === 'orders') renderOrders();
    if (page === 'profile') updateUserUI();
}

// ============================================================
// PROFILE SETTINGS
// ============================================================
function openProfileSettings() {
    if (!currentUser) { showToast('⚠️ Login Dulu', 'Silakan login terlebih dahulu', 'warning'); return; }
    showToast('✏️ Edit Profil', 'Fitur edit profil segera hadir!', 'info');
}

// ============================================================
// TOGGLE USER MENU
// ============================================================
function toggleUserMenu() {
    // Simple logout confirmation
    Swal.fire({
        title: 'Apakah Anda yakin?',
        text: 'Ingin keluar dari akun?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6366f1',
        confirmButtonText: 'Keluar',
        cancelButtonText: 'Batal'
    }).then(result => {
        if (result.isConfirmed) {
            logoutUser();
        }
    });
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('joellUser');
    updateUserUI();
    showToast('👋 Logout', 'Anda telah keluar dari akun', 'info');
    navigateTo('home');
}

// ============================================================
// SOUND TOGGLE FOR VIDEO
// ============================================================
function initSoundToggle() {
    const btn = $('soundToggle');
    const video = document.querySelector('.hero-video');
    if (!btn || !video) return;
    let muted = true;
    btn.addEventListener('click', function() {
        muted = !muted;
        video.muted = muted;
        this.innerHTML = muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    });
}

// ============================================================
// TYPING EFFECT
// ============================================================
function initTypingEffect() {
    const el = $('typingText');
    if (!el) return;
    const texts = ['Bisnis Anda!', 'Bot WhatsApp!', 'Hosting Cepat!', 'Script Bot!', 'Topup Game!'];
    let index = 0;
    let charIndex = 0;
    let isDeleting = false;
    function type() {
        const current = texts[index];
        if (isDeleting) {
            el.textContent = current.substring(0, charIndex--);
            if (charIndex < 0) { isDeleting = false; index = (index + 1) % texts.length; setTimeout(type, 1000); return; }
            setTimeout(type, 50);
        } else {
            el.textContent = current.substring(0, charIndex++);
            if (charIndex > current.length) { isDeleting = true; setTimeout(type, 2000); return; }
            setTimeout(type, 100);
        }
    }
    type();
}

// ============================================================
// COUNTDOWN TIMER
// ============================================================
function initCountdown() {
    let target = new Date();
    target.setHours(target.getHours() + 4);
    target.setMinutes(32);
    target.setSeconds(15);
    setInterval(() => {
        const diff = target - new Date();
        if (diff <= 0) return;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        $('cdHours').textContent = String(h).padStart(2, '0');
        $('cdMinutes').textContent = String(m).padStart(2, '0');
        $('cdSeconds').textContent = String(s).padStart(2, '0');
    }, 1000);
}

// ============================================================
// PARTICLES BACKGROUND
// ============================================================
function initParticles() {
    const canvas = document.getElementById('particlesCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;
    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    resize();
    class Particle {
        constructor() { this.reset(); }
        reset() { this.x = Math.random() * w; this.y = Math.random() * h; this.size = Math.random() * 2 + 0.5; this.speedX = (Math.random() - 0.5) * 0.5; this.speedY = (Math.random() - 0.5) * 0.5; this.opacity = Math.random() * 0.5 + 0.1; }
        update() { this.x += this.speedX; this.y += this.speedY; if (this.x < 0 || this.x > w) this.speedX *= -1; if (this.y < 0 || this.y > h) this.speedY *= -1; }
        draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`; ctx.fill(); }
    }
    for (let i = 0; i < 80; i++) particles.push(new Particle());
    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => { p.update(); p.draw(); });
        // Draw lines between close particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - dist / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// ============================================================
// SEARCH PRODUCTS
// ============================================================
function initSearch() {
    const input = $('searchInput');
    const btn = $('searchBtn');
    if (!input || !btn) return;
    function search() {
        const query = input.value.toLowerCase().trim();
        if (!query) { renderMenus(); return; }
        const results = PRODUCTS.filter(p => p.name.toLowerCase().includes(query) || p.category.includes(query));
        const grids = ['gridHosting', 'gridScript', 'gridTopup'];
        grids.forEach(id => {
            const grid = $(id);
            if (!grid) return;
            if (id === 'gridTopup') {
                grid.innerHTML = results.filter(p => p.category === 'topup').map(p => createProductCard(p)).join('');
            } else if (id === 'gridHosting') {
                grid.innerHTML = results.filter(p => p.category === 'hosting').map(p => createProductCard(p)).join('');
            } else if (id === 'gridScript') {
                grid.innerHTML = results.filter(p => p.category === 'script').map(p => createProductCard(p)).join('');
            }
        });
        if (results.length === 0) {
            showToast('🔍 Tidak Ditemukan', 'Produk tidak ditemukan', 'info');
        }
    }
    btn.addEventListener('click', search);
    input.addEventListener('keyup', e => { if (e.key === 'Enter') search(); });
}

// ============================================================
// BACK TO TOP
// ============================================================
function initBackToTop() {
    const btn = $('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { btn.classList.add('visible'); } else { btn.classList.remove('visible'); }
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ============================================================
// REFRESH ADMIN ORDERS (dipanggil dari admin.html)
// ============================================================
function refreshAdminOrders() {
    const orders = JSON.parse(localStorage.getItem('joellOrders')) || [];
    const container = $('adminOrdersList');
    if (!container) return;
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const processing = orders.filter(o => o.status === 'processing').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    $('adminStatTotal').textContent = total;
    $('adminStatPending').textContent = pending;
    $('adminStatProcessing').textContent = processing;
    $('adminStatCompleted').textContent = completed;
    if (orders.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);"><i class="fas fa-inbox" style="font-size:3rem;display:block;margin-bottom:12px;opacity:0.5;"></i><p>Belum ada pesanan</p></div>`;
        return;
    }
    const statusMap = { 'pending': { label: '⏳ Menunggu', class: 'pending' }, 'processing': { label: '🔄 Diproses', class: 'processing' }, 'completed': { label: '✅ Selesai', class: 'completed' }, 'expired': { label: '❌ Kadaluarsa', class: 'expired' } };
    container.innerHTML = orders.map(order => {
        const status = statusMap[order.status] || statusMap['pending'];
        return `<div class="admin-order-card" style="background:var(--bg-secondary);border-radius:var(--radius-xs);padding:14px;margin-bottom:10px;border:1px solid var(--border-subtle);">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                <span style="font-family:var(--font-mono);font-weight:700;color:var(--accent-light);">#${order.id}</span>
                <span class="order-status ${status.class}">${status.label}</span>
            </div>
            <div style="font-size:0.85rem;color:var(--text-secondary);margin:6px 0;">${order.items?.map(i => `${i.name} (${i.variant}) x${i.qty}`).join(', ') || '-'}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;color:var(--text-muted);">
                <span>Rp ${Number(order.total).toLocaleString()}</span>
                <span>${new Date(order.createdAt).toLocaleString('id-ID')}</span>
            </div>
            <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;">
                <button onclick="updateOrderStatus('${order.id}','processing')" class="admin-action-btn" style="background:var(--orange);color:#fff;border:none;border-radius:30px;padding:4px 14px;font-size:0.7rem;cursor:pointer;">Proses</button>
                <button onclick="updateOrderStatus('${order.id}','completed')" class="admin-action-btn" style="background:var(--green);color:#fff;border:none;border-radius:30px;padding:4px 14px;font-size:0.7rem;cursor:pointer;">Selesai</button>
                <button onclick="deleteOrder('${order.id}')" class="admin-action-btn" style="background:var(--red);color:#fff;border:none;border-radius:30px;padding:4px 14px;font-size:0.7rem;cursor:pointer;">Hapus</button>
            </div>
        </div>`;
    }).join('');
}

function updateOrderStatus(orderId, status) {
    const orders = JSON.parse(localStorage.getItem('joellOrders')) || [];
    const order = orders.find(o => o.id === orderId);
    if (order) { order.status = status; localStorage.setItem('joellOrders', JSON.stringify(orders)); refreshAdminOrders(); showToast('✅ Status Updated', `Order ${orderId} -> ${status}`, 'success'); }
}

function deleteOrder(orderId) {
    Swal.fire({ title: 'Hapus Pesanan?', text: `Order ${orderId} akan dihapus permanen`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6366f1', confirmButtonText: 'Hapus', cancelButtonText: 'Batal' }).then(result => {
        if (result.isConfirmed) {
            let orders = JSON.parse(localStorage.getItem('joellOrders')) || [];
            orders = orders.filter(o => o.id !== orderId);
            localStorage.setItem('joellOrders', JSON.stringify(orders));
            refreshAdminOrders();
            showToast('🗑️ Dihapus', `Order ${orderId} dihapus`, 'info');
        }
    });
}

// ============================================================
// THEME TOGGLE
// ============================================================
function initTheme() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    const savedTheme = localStorage.getItem('joellTheme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const icon = toggle.querySelector('i');
    if (icon) icon.className = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    toggle.addEventListener('click', function() {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', next);
        localStorage.setItem('joellTheme', next);
        const ic = this.querySelector('i');
        if (ic) ic.className = next === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    });
}

// ============================================================
// ADMIN LOGIN HANDLER (di admin.html)
// ============================================================
function initAdminLogin() {
    const loginBtn = document.getElementById('adminLoginBtn');
    const passwordInput = document.getElementById('adminPasswordInput');
    if (loginBtn && passwordInput) {
        loginBtn.addEventListener('click', function() {
            const pass = passwordInput.value;
            if (pass === 'admin123') {
                sessionStorage.setItem('joellAdminLoggedIn', 'true');
                document.getElementById('adminLoginView').style.display = 'none';
                document.getElementById('adminDashboardView').style.display = 'block';
                refreshAdminOrders();
                showToast('✅ Login Berhasil', 'Selamat datang Admin', 'success');
            } else {
                showToast('❌ Password Salah', 'Coba lagi', 'error');
            }
        });
        passwordInput.addEventListener('keyup', e => { if (e.key === 'Enter') loginBtn.click(); });
    }
    if (sessionStorage.getItem('joellAdminLoggedIn') === 'true') {
        const loginView = document.getElementById('adminLoginView');
        const dashView = document.getElementById('adminDashboardView');
        if (loginView) loginView.style.display = 'none';
        if (dashView) dashView.style.display = 'block';
        refreshAdminOrders();
    }
}

// ============================================================
// EVENT LISTENERS - INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initTheme();
    initParticles();
    initTypingEffect();
    initCountdown();
    initSoundToggle();
    initSearch();
    initBackToTop();

    // Load user
    currentUser = JSON.parse(localStorage.getItem('joellUser')) || null;
    updateUserUI();
    renderMenus();
    updateCartUI();
    renderOrders();

    // Nav buttons
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.dataset.page;
            if (page) navigateTo(page);
        });
    });

    // Cart open
    document.getElementById('navCart')?.addEventListener('click', function() {
        $('cartOverlay').classList.add('open');
        updateCartUI();
    });
    document.getElementById('cartCloseBtn')?.addEventListener('click', function() {
        $('cartOverlay').classList.remove('open');
    });
    document.getElementById('cartOverlay')?.addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('open');
    });

    // Checkout
    document.getElementById('checkoutBtn')?.addEventListener('click', openCheckout);
    document.getElementById('checkoutCloseBtn')?.addEventListener('click', function() {
        $('checkoutOverlay').classList.remove('open');
    });
    document.getElementById('checkoutOverlay')?.addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('open');
    });
    document.getElementById('checkoutForm')?.addEventListener('submit', submitOrder);

    // Detail modal
    document.getElementById('detailCloseBtn')?.addEventListener('click', function() {
        $('detailOverlay').classList.remove('open');
    });
    document.getElementById('detailOverlay')?.addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('open');
    });
    document.getElementById('addToCartBtn')?.addEventListener('click', function() {
        if (currentProductId) { addToCart(currentProductId); $('detailOverlay').classList.remove('open'); }
    });
    document.getElementById('buyNowBtn')?.addEventListener('click', function() {
        if (currentProductId) {
            const product = PRODUCTS.find(p => p.id === currentProductId);
            if (product) {
                const existing = cart.find(item => item.id === product.id && item.variant === selectedVariant);
                if (existing) { existing.qty += 1; } else { cart.push({ id: product.id, name: product.name, variant: selectedVariant || 'Standard', price: product.price || 0, qty: 1 }); }
                localStorage.setItem('joellCart', JSON.stringify(cart));
                updateCartUI();
                $('detailOverlay').classList.remove('open');
                setTimeout(openCheckout, 300);
            }
        }
    });

    // Topup modal
    document.getElementById('topupCloseBtn')?.addEventListener('click', function() {
        $('topupOverlay').classList.remove('open');
    });
    document.getElementById('topupOverlay')?.addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('open');
    });

    // Login modal
    document.getElementById('loginCloseBtn')?.addEventListener('click', function() {
        $('loginOverlay').classList.remove('open');
    });
    document.getElementById('loginOverlay')?.addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('open');
    });
    document.getElementById('guestLoginBtn')?.addEventListener('click', function() {
        $('loginOverlay').classList.add('open');
    });

    // Payment modal
    document.getElementById('paymentCloseBtn')?.addEventListener('click', function() {
        $('paymentOverlay').classList.remove('open');
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    });
    document.getElementById('paymentOverlay')?.addEventListener('click', function(e) {
        if (e.target === this) { this.classList.remove('open'); if (timerInterval) { clearInterval(timerInterval); timerInterval = null; } }
    });

    // Payment methods
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.payment-method-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const method = this.dataset.method;
            document.getElementById('paymentQrisSection').style.display = method === 'qris' ? 'block' : 'none';
            document.getElementById('paymentBankSection').style.display = method === 'bank' ? 'block' : 'none';
        });
    });

    // Create invoice
    document.getElementById('createInvoiceBtn')?.addEventListener('click', function() {
        const totalText = $('paymentOrderTotal')?.textContent || '0';
        const amount = parseInt(totalText.replace(/[^0-9]/g, '')) || 0;
        if (amount <= 0) { showToast('Error', 'Jumlah tidak valid', 'error'); return; }
        createInvoice(amount);
    });

    // Check status
    document.getElementById('checkStatusBtn')?.addEventListener('click', function() {
        if (currentInvoiceId) checkInvoiceStatus(currentInvoiceId);
        else showToast('Error', 'Tidak ada invoice aktif', 'error');
    });

    // Copy payment link
    document.getElementById('copyPaymentLinkBtn')?.addEventListener('click', copyPaymentLink);

    // Copy bank info
    document.getElementById('copyBankBtn')?.addEventListener('click', copyBankInfo);

    // Refresh balance
    document.getElementById('balanceRefreshBtn')?.addEventListener('click', fetchBalance);

    // Clear cart
    document.getElementById('clearCartBtn')?.addEventListener('click', clearCart);

    // Profile menu items
    document.getElementById('profileMenuOrders')?.addEventListener('click', function() {
        navigateTo('orders');
    });
    document.getElementById('profileMenuEdit')?.addEventListener('click', openProfileSettings);
    document.getElementById('profileMenuSupport')?.addEventListener('click', function() {
        window.open('https://wa.me/6281234567890', '_blank');
    });
    document.getElementById('btnProfileLogoutPage')?.addEventListener('click', logoutUser);

    // Tracking
    document.getElementById('trackBtn')?.addEventListener('click', function() {
        const input = $('trackInput');
        const id = input?.value.trim();
        if (!id) { showToast('⚠️ Masukkan ID', 'Masukkan ID pesanan yang valid', 'warning'); return; }
        const order = orders.find(o => o.id === id);
        if (order) {
            $('trackResult').style.display = 'block';
            $('trackOrderId').textContent = '#' + order.id;
            const statusMap = { 'pending': { label: '⏳ Menunggu', class: 'pending' }, 'processing': { label: '🔄 Diproses', class: 'processing' }, 'completed': { label: '✅ Selesai', class: 'completed' }, 'expired': { label: '❌ Kadaluarsa', class: 'expired' } };
            const status = statusMap[order.status] || statusMap['pending'];
            $('trackStatusBadge').innerHTML = `<i class="fas fa-circle"></i> ${status.label}`;
            $('trackStatusBadge').className = 'order-status ' + status.class;
            $('trackProducts').textContent = order.items?.map(i => `${i.name} (${i.variant}) × ${i.qty}`).join(', ') || '-';
            $('trackDate').textContent = new Date(order.createdAt).toLocaleString('id-ID');
            showToast('🔍 Ditemukan', `Pesanan ${order.id} ditemukan`, 'success');
        } else {
            showToast('❌ Tidak Ditemukan', `ID ${id} tidak ditemukan`, 'error');
            $('trackResult').style.display = 'none';
        }
    });
    document.getElementById('trackInput')?.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') document.getElementById('trackBtn')?.click();
    });
    document.getElementById('trackChatBtn')?.addEventListener('click', function() {
        window.open('https://wa.me/6281234567890', '_blank');
    });

    // Logo click for admin (5x)
    let logoClickCount = 0;
    let logoClickTimer = null;
    document.getElementById('logoArea')?.addEventListener('click', function() {
        logoClickCount++;
        if (logoClickTimer) clearTimeout(logoClickTimer);
        logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 3000);
        if (logoClickCount >= 5) {
            logoClickCount = 0;
            window.location.href = 'admin.html';
        }
    });

    // Admin init (if on admin page)
    initAdminLogin();

    // Check auto-login (Google One Tap)
    if (window.google && window.google.accounts && window.google.accounts.id) {
        // Auto prompt disabled, handled by button
    }

    console.log('🚀 JOELL SHOP LOADED!');
    console.log(`📦 ${PRODUCTS.length} products loaded`);
    console.log(`🛒 ${cart.length} items in cart`);
    console.log(`📋 ${orders.length} orders total`);
});
