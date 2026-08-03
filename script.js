// ============================================================
// PAYMENT SYSTEM - INTEGRASI API LZPEDIA
// ============================================================

const PAYMENT_CONFIG = {
    apiKey: 'LXZ_f68d396b95fc4dc6',
    userId: 'f92d9400d6aa05',
    baseUrl: 'https://app.lzpedia.my.id/api'
};

let currentInvoiceId = null;
let timerInterval = null;
let selectedWithdrawMethodData = null;
let withdrawHistory = JSON.parse(localStorage.getItem('joellWithdrawHistory')) || [];
let invoiceHistory = JSON.parse(localStorage.getItem('joellInvoiceHistory')) || [];

// ============================================================
// 1. CEK SALDO
// ============================================================
async function fetchBalance() {
    const balanceEl = document.getElementById('balanceAmount');
    const refreshBtn = document.getElementById('balanceRefreshBtn');
    if (!balanceEl) return;
    
    try {
        if (refreshBtn) refreshBtn.classList.add('spinning');
        const response = await fetch(`${PAYMENT_CONFIG.baseUrl}/balance?apikey=${PAYMENT_CONFIG.apiKey}`);
        const data = await response.json();
        
        if (data.balance !== undefined) {
            balanceEl.textContent = 'Rp ' + Number(data.balance).toLocaleString();
            return data.balance;
        }
    } catch (error) {
        console.error('Balance Error:', error);
        balanceEl.textContent = 'Rp 0';
    } finally {
        if (refreshBtn) refreshBtn.classList.remove('spinning');
    }
    return 0;
}

// ============================================================
// 2. BUAT INVOICE
// ============================================================
async function createInvoice(amount) {
    const btn = document.getElementById('createInvoiceBtn');
    if (!amount || amount <= 0) {
        showToast('Error', 'Jumlah pembayaran tidak valid', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Membuat...';

    try {
        const response = await fetch(`${PAYMENT_CONFIG.baseUrl}/invoice?apikey=${PAYMENT_CONFIG.apiKey}&amount=${amount}`);
        const data = await response.json();

        if (data.success && data.invoice_id) {
            currentInvoiceId = data.invoice_id;
            
            // QRIS
            const qrisWrapper = document.getElementById('qrisImageWrapper');
            const qrisImage = document.getElementById('qrisImage');
            if (data.qris_image) {
                qrisImage.src = data.qris_image;
                qrisWrapper.style.display = 'block';
                document.querySelector('#qrisContainer p').style.display = 'none';
            }

            // Details
            document.getElementById('invoiceId').textContent = data.invoice_id;
            document.getElementById('invoiceTotal').textContent = 'Rp ' + Number(data.total).toLocaleString();
            document.getElementById('invoiceFee').textContent = 'Rp ' + Number(data.fee).toLocaleString();
            document.getElementById('invoiceExpiry').textContent = data.expired_at || '-';
            document.getElementById('paymentDetails').style.display = 'block';
            document.getElementById('checkStatusBtn').style.display = 'inline-flex';
            document.getElementById('copyPaymentLinkBtn').style.display = 'inline-flex';

            // Timer
            if (data.expired_at) {
                startPaymentTimer(new Date(data.expired_at));
            }

            // History
            invoiceHistory.push({
                invoice_id: data.invoice_id,
                total: data.total,
                status: 'pending',
                created_at: data.expired_at
            });
            localStorage.setItem('joellInvoiceHistory', JSON.stringify(invoiceHistory));
            renderInvoiceHistory();

            showToast('Success', 'Invoice berhasil dibuat!', 'success');
        } else {
            throw new Error(data.message || 'Gagal membuat invoice');
        }
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-qrcode"></i> Buat Invoice';
    }
}

// ============================================================
// 3. CEK STATUS INVOICE
// ============================================================
async function checkInvoiceStatus(invoiceId) {
    if (!invoiceId) {
        showToast('Error', 'Tidak ada invoice aktif', 'error');
        return;
    }

    const btn = document.getElementById('checkStatusBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cek...';

    try {
        const response = await fetch(`${PAYMENT_CONFIG.baseUrl}/invoice/status?apikey=${PAYMENT_CONFIG.apiKey}&invoice_id=${invoiceId}`);
        const data = await response.json();

        if (data.status) {
            const badge = document.getElementById('invoiceStatusBadge');
            const statusMap = {
                'pending': { label: '⏳ Menunggu', class: 'pending' },
                'paid': { label: '✅ Lunas', class: 'paid' },
                'expired': { label: '❌ Kadaluarsa', class: 'expired' }
            };
            const info = statusMap[data.status] || statusMap['pending'];
            badge.textContent = info.label;
            badge.className = 'payment-status-badge ' + info.class;

            if (data.status === 'paid') {
                showToast('Pembayaran Berhasil!', 'Invoice telah dibayar.', 'success', 5000);
                setTimeout(() => {
                    document.getElementById('paymentOverlay').classList.remove('open');
                }, 3000);
            }
        }
    } catch (error) {
        showToast('Error', 'Gagal mengecek status', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sync-alt"></i> Cek Status';
    }
}

// ============================================================
// 4. PAYMENT TIMER
// ============================================================
function startPaymentTimer(expiryDate) {
    const timerEl = document.getElementById('paymentTimer');
    const displayEl = document.getElementById('timerDisplay');
    timerEl.style.display = 'block';

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const diff = expiryDate - new Date();
        if (diff <= 0) {
            clearInterval(timerInterval);
            displayEl.textContent = '00:00';
            timerEl.classList.add('expired');
            document.getElementById('invoiceStatusBadge').textContent = '❌ Kadaluarsa';
            document.getElementById('invoiceStatusBadge').className = 'payment-status-badge expired';
            return;
        }
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        displayEl.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        timerEl.classList.remove('expired');
    }, 1000);
}

// ============================================================
// 5. WITHDRAW METHODS
// ============================================================
async function fetchWithdrawMethods() {
    try {
        const response = await fetch(`${PAYMENT_CONFIG.baseUrl}/withdraw/methods?apikey=${PAYMENT_CONFIG.apiKey}`);
        const data = await response.json();
        
        const grid = document.getElementById('withdrawMethodsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        const allMethods = [...(data.manual_methods || []), ...(data.instant_methods || [])];
        
        allMethods.forEach(method => {
            const btn = document.createElement('button');
            btn.className = 'withdraw-method-item';
            btn.dataset.method = method.method;
            btn.innerHTML = `
                <i class="fas fa-wallet"></i>
                ${method.name}
                <span class="method-name">${method.instant ? '⚡ Instant' : '🔄 Manual'}</span>
            `;
            btn.onclick = () => {
                document.querySelectorAll('.withdraw-method-item').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                selectedWithdrawMethodData = method;
                document.getElementById('withdrawInfo').textContent = 
                    `💰 ${method.name} | Min: Rp ${(method.min||10000).toLocaleString()} | Max: Rp ${(method.max||1000000).toLocaleString()}`;
            };
            grid.appendChild(btn);
        });
    } catch (error) {
        console.error('Withdraw Methods Error:', error);
    }
}

// ============================================================
// 6. PROSES WITHDRAW
// ============================================================
async function processWithdraw() {
    const amount = parseInt(document.getElementById('withdrawAmount').value);
    const account = document.getElementById('withdrawAccount').value.trim();
    const btn = document.getElementById('withdrawBtn');

    if (!selectedWithdrawMethodData) {
        showToast('Error', 'Pilih metode penarikan', 'error');
        return;
    }
    if (!amount || amount < 10000) {
        showToast('Error', 'Minimal penarikan Rp 10.000', 'error');
        return;
    }
    if (!account) {
        showToast('Error', 'Masukkan nomor rekening', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

    try {
        const url = `${PAYMENT_CONFIG.baseUrl}/withdraw?apikey=${PAYMENT_CONFIG.apiKey}&amount=${amount}&method=${selectedWithdrawMethodData.method}&account_number=${encodeURIComponent(account)}&instant=${selectedWithdrawMethodData.instant||false}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            showToast('Berhasil!', data.message || 'Penarikan berhasil', 'success');
            withdrawHistory.push({
                amount: amount,
                method: selectedWithdrawMethodData.name,
                account_number: account,
                status: 'pending'
            });
            localStorage.setItem('joellWithdrawHistory', JSON.stringify(withdrawHistory));
            renderWithdrawHistory();
            fetchBalance();
            document.getElementById('withdrawAmount').value = '';
            document.getElementById('withdrawAccount').value = '';
        } else {
            throw new Error(data.message || 'Gagal');
        }
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-arrow-up"></i> Tarik';
    }
}

// ============================================================
// 7. RENDER HISTORY
// ============================================================
function renderWithdrawHistory() {
    const container = document.getElementById('withdrawHistory');
    if (!container) return;
    if (!withdrawHistory.length) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;">Belum ada riwayat</p>';
        return;
    }
    container.innerHTML = withdrawHistory.slice(-5).reverse().map(item => `
        <div class="withdraw-history-item">
            <div class="wh-left">
                <span class="wh-amount">Rp ${Number(item.amount).toLocaleString()}</span>
                <span class="wh-method">${item.method} - ${item.account_number || '-'}</span>
            </div>
            <span class="wh-status ${item.status}">${item.status}</span>
        </div>
    `).join('');
}

function renderInvoiceHistory() {
    const container = document.getElementById('invoiceHistoryList');
    if (!container) return;
    if (!invoiceHistory.length) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;">Belum ada invoice</p>';
        return;
    }
    container.innerHTML = invoiceHistory.slice(-5).reverse().map(item => `
        <div class="invoice-history-item">
            <div class="ih-left">
                <span class="ih-id">#${item.invoice_id}</span>
                <span class="ih-amount">Rp ${Number(item.total).toLocaleString()}</span>
            </div>
            <span class="ih-status ${item.status}">${item.status}</span>
        </div>
    `).join('');
}

// ============================================================
// 8. COPY BANK INFO
// ============================================================
function copyBankInfo() {
    const info = `BCA\n1234567890\nA/N JOELL SHOP\nTotal: ${document.getElementById('bankTotal').textContent}`;
    navigator.clipboard.writeText(info).then(() => {
        showToast('Berhasil', 'Info bank disalin!', 'success');
    });
}

// ============================================================
// 9. OPEN PAYMENT MODAL
// ============================================================
function openPaymentModal(orderData) {
    const overlay = document.getElementById('paymentOverlay');
    if (!overlay) return;

    // Set order items
    const itemsContainer = document.getElementById('paymentOrderItems');
    const totalEl = document.getElementById('paymentOrderTotal');
    const bankTotal = document.getElementById('bankTotal');
    
    let total = 0;
    if (orderData && orderData.items) {
        itemsContainer.innerHTML = orderData.items.map(item => `
            <div class="order-item-line">${item.name} (${item.variant}) x${item.qty} = Rp ${(item.price * item.qty).toLocaleString()}</div>
        `).join('');
        total = orderData.total || orderData.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    } else {
        const cart = JSON.parse(localStorage.getItem('joellCart')) || [];
        itemsContainer.innerHTML = cart.map(item => `
            <div class="order-item-line">${item.name} (${item.variant}) x${item.qty} = Rp ${(item.price * item.qty).toLocaleString()}</div>
        `).join('');
        total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    }
    
    totalEl.textContent = 'Total: Rp ' + total.toLocaleString();
    bankTotal.textContent = 'Rp ' + total.toLocaleString();

    // Reset UI
    document.getElementById('qrisImageWrapper').style.display = 'none';
    document.getElementById('paymentDetails').style.display = 'none';
    document.getElementById('paymentTimer').style.display = 'none';
    document.getElementById('checkStatusBtn').style.display = 'none';
    document.getElementById('copyPaymentLinkBtn').style.display = 'none';
    document.getElementById('paymentQrisSection').style.display = 'block';
    document.getElementById('paymentBankSection').style.display = 'none';
    document.querySelector('#qrisContainer p').style.display = 'block';
    
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.method === 'qris');
    });

    overlay.classList.add('open');
    fetchBalance();
    fetchWithdrawMethods();
    renderWithdrawHistory();
    renderInvoiceHistory();
}

// ============================================================
// 10. EVENT LISTENERS
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    // Payment method switching
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.payment-method-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const method = this.dataset.method;
            document.getElementById('paymentQrisSection').style.display = method === 'qris' ? 'block' : 'none';
            document.getElementById('paymentBankSection').style.display = method === 'bank' ? 'block' : 'none';
        });
    });

    // Create Invoice
    document.getElementById('createInvoiceBtn').addEventListener('click', function() {
        const total = parseInt(document.getElementById('paymentOrderTotal').textContent.replace(/[^0-9]/g, ''));
        if (total > 0) createInvoice(total);
    });

    // Check Status
    document.getElementById('checkStatusBtn').addEventListener('click', function() {
        if (currentInvoiceId) checkInvoiceStatus(currentInvoiceId);
    });

    // Copy Payment Link
    document.getElementById('copyPaymentLinkBtn').addEventListener('click', function() {
        if (currentInvoiceId) {
            const link = `https://app.lzpedia.my.id/pay/${currentInvoiceId}`;
            navigator.clipboard.writeText(link).then(() => {
                showToast('Berhasil', 'Link pembayaran disalin!', 'success');
            });
        }
    });

    // Withdraw
    document.getElementById('withdrawBtn').addEventListener('click', processWithdraw);

    // Balance Refresh
    document.getElementById('balanceRefreshBtn').addEventListener('click', fetchBalance);

    // Close Payment Modal
    document.getElementById('paymentCloseBtn').addEventListener('click', function() {
        document.getElementById('paymentOverlay').classList.remove('open');
        if (timerInterval) clearInterval(timerInterval);
    });

    // Load histories
    const storedWithdraw = localStorage.getItem('joellWithdrawHistory');
    if (storedWithdraw) {
        withdrawHistory = JSON.parse(storedWithdraw);
        renderWithdrawHistory();
    }
    const storedInvoice = localStorage.getItem('joellInvoiceHistory');
    if (storedInvoice) {
        invoiceHistory = JSON.parse(storedInvoice);
        renderInvoiceHistory();
    }
});

// ============================================================
// 11. MODIFIKASI CHECKOUT UNTUK PAKAI PAYMENT MODAL
// ============================================================
// Override checkout form submission
const originalCheckoutSubmit = document.getElementById('checkoutForm')?.submit;
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
                { step: 'Pesanan Selesai', desc: 'Detail produk dikirim', time: '-', completed: false }
            ],
            chat: [{ 
                from: 'admin', 
                text: `Halo ${document.getElementById('coName').value}! Terima kasih telah memesan. Silakan selesaikan pembayaran Anda.`,
                time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) 
            }]
        };
        
        orders.unshift(order);
        localStorage.setItem('joellOrders', JSON.stringify(orders));
        broadcastOrders();
        
        const cartItems = [...cart];
        cart = [];
        activePromo = null;
        localStorage.setItem('joellCart', JSON.stringify(cart));
        updateCartUI();
        
        document.getElementById('checkoutOverlay').classList.remove('open');
        openPaymentModal(order);
        showToast('Pesanan Dibuat', `ID: ${orderId}. Selesaikan pembayaran.`, 'success', 5000);
        renderOrdersList();
    });
}
