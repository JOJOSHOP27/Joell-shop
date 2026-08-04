// ============================================================
// PAYMENT API - LZPedia Integration
// ============================================================

const PAYMENT_API = {
    // Konfigurasi
    config: {
        apiKey: 'LXZ_f68d396b95fc4dc6',
        userId: 'f92d9400d6aa05',
        baseUrl: 'https://app.lzpedia.my.id/api'
    },

    // Headers untuk semua request
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'X-API-Key': this.config.apiKey
        };
    },

    // ============================================================
    // 1. CEK SALDO
    // ============================================================
    async getBalance() {
        try {
            const response = await fetch(`${this.config.baseUrl}/balance?apikey=${this.config.apiKey}`);
            const data = await response.json();
            return {
                success: true,
                balance: data.balance || 0,
                username: data.username || '',
                email: data.email || ''
            };
        } catch (error) {
            console.error('Balance Error:', error);
            return {
                success: false,
                error: error.message,
                balance: 0
            };
        }
    },

    // ============================================================
    // 2. BUAT INVOICE
    // ============================================================
    async createInvoice(amount) {
        try {
            const response = await fetch(
                `${this.config.baseUrl}/invoice?apikey=${this.config.apiKey}&amount=${amount}`
            );
            const data = await response.json();
            
            if (data.success && data.invoice_id) {
                return {
                    success: true,
                    invoiceId: data.invoice_id,
                    amount: data.amount,
                    fee: data.fee,
                    total: data.total,
                    qrisImage: data.qris_image || null,
                    paymentLink: data.payment_link || null,
                    expiredAt: data.expired_at || null
                };
            } else {
                return {
                    success: false,
                    error: data.message || 'Gagal membuat invoice'
                };
            }
        } catch (error) {
            console.error('Invoice Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // ============================================================
    // 3. CEK STATUS INVOICE
    // ============================================================
    async checkInvoiceStatus(invoiceId) {
        try {
            const response = await fetch(
                `${this.config.baseUrl}/invoice/status?apikey=${this.config.apiKey}&invoice_id=${invoiceId}`
            );
            const data = await response.json();
            
            return {
                success: true,
                invoiceId: data.invoice_id,
                amount: data.amount,
                fee: data.fee,
                total: data.total,
                status: data.status || 'pending',
                qrisImage: data.qris_image || null,
                paymentLink: data.payment_link || null,
                expiredAt: data.expired_at || null,
                createdAt: data.created_at || null
            };
        } catch (error) {
            console.error('Status Check Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // ============================================================
    // 4. METODE WITHDRAW
    // ============================================================
    async getWithdrawMethods() {
        try {
            const response = await fetch(
                `${this.config.baseUrl}/withdraw/methods?apikey=${this.config.apiKey}`
            );
            const data = await response.json();
            
            return {
                success: true,
                manualMethods: data.manual_methods || [],
                instantMethods: data.instant_methods || []
            };
        } catch (error) {
            console.error('Withdraw Methods Error:', error);
            return {
                success: false,
                error: error.message,
                manualMethods: [],
                instantMethods: []
            };
        }
    },

    // ============================================================
    // 5. PROSES WITHDRAW
    // ============================================================
    async processWithdraw(amount, method, accountNumber, instant = false) {
        try {
            const url = `${this.config.baseUrl}/withdraw?apikey=${this.config.apiKey}&amount=${amount}&method=${method}&account_number=${encodeURIComponent(accountNumber)}&instant=${instant}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                return {
                    success: true,
                    message: data.message || 'Penarikan berhasil',
                    data: data.data || null
                };
            } else {
                return {
                    success: false,
                    error: data.message || 'Gagal melakukan penarikan'
                };
            }
        } catch (error) {
            console.error('Withdraw Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // ============================================================
    // 6. CEK STATUS WITHDRAW
    // ============================================================
    async checkWithdrawStatus(withdrawId) {
        try {
            const response = await fetch(
                `${this.config.baseUrl}/withdraw/status?apikey=${this.config.apiKey}&id=${withdrawId}`
            );
            const data = await response.json();
            
            return {
                success: true,
                id: data.id,
                amount: data.amount,
                fee: data.fee,
                method: data.method,
                accountNumber: data.account_number,
                status: data.status || 'pending',
                instant: data.instant || false,
                adminNote: data.admin_note || null,
                createdAt: data.created_at || null,
                completedAt: data.completed_at || null
            };
        } catch (error) {
            console.error('Withdraw Status Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};

// ============================================================
// EXPORT UNTUK DIGUNAKAN
// ============================================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PAYMENT_API;
}

// ============================================================
// GLOBAL FUNCTIONS UNTUK DIPANGGIL DARI HTML
// ============================================================

// Fungsi global untuk cek saldo
window.fetchBalance = async function() {
    const balanceEl = document.getElementById('balanceAmount');
    const refreshBtn = document.getElementById('balanceRefreshBtn');
    if (!balanceEl) return;
    
    try {
        if (refreshBtn) refreshBtn.classList.add('spinning');
        const result = await PAYMENT_API.getBalance();
        
        if (result.success) {
            balanceEl.textContent = 'Rp ' + Number(result.balance).toLocaleString();
            return result.balance;
        } else {
            throw new Error(result.error || 'Gagal mengambil saldo');
        }
    } catch (error) {
        console.error('Balance Error:', error);
        balanceEl.textContent = 'Rp 0';
        if (typeof showToast === 'function') {
            showToast('Error', 'Gagal mengambil saldo', 'error');
        }
        return 0;
    } finally {
        if (refreshBtn) refreshBtn.classList.remove('spinning');
    }
};

// Fungsi global untuk buat invoice
window.createInvoice = async function(amount) {
    const btn = document.getElementById('createInvoiceBtn');
    const qrisContainer = document.getElementById('qrisContainer');
    const qrisImageWrapper = document.getElementById('qrisImageWrapper');
    const qrisImage = document.getElementById('qrisImage');
    const details = document.getElementById('paymentDetails');
    const timer = document.getElementById('paymentTimer');
    const checkBtn = document.getElementById('checkStatusBtn');
    const copyBtn = document.getElementById('copyPaymentLinkBtn');

    if (!amount || amount <= 0) {
        if (typeof showToast === 'function') {
            showToast('Error', 'Jumlah pembayaran tidak valid', 'error');
        }
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Membuat Invoice...';

    try {
        const result = await PAYMENT_API.createInvoice(amount);

        if (result.success) {
            window.currentInvoiceId = result.invoiceId;
            
            // Display QRIS
            if (result.qrisImage && qrisImage) {
                qrisImage.src = result.qrisImage;
                if (qrisImageWrapper) qrisImageWrapper.style.display = 'block';
                if (qrisContainer && qrisContainer.querySelector('p')) {
                    qrisContainer.querySelector('p').style.display = 'none';
                }
            }

            // Display details
            const invoiceIdEl = document.getElementById('invoiceId');
            const invoiceTotalEl = document.getElementById('invoiceTotal');
            const invoiceFeeEl = document.getElementById('invoiceFee');
            const invoiceExpiryEl = document.getElementById('invoiceExpiry');
            
            if (invoiceIdEl) invoiceIdEl.textContent = result.invoiceId;
            if (invoiceTotalEl) invoiceTotalEl.textContent = 'Rp ' + Number(result.total).toLocaleString();
            if (invoiceFeeEl) invoiceFeeEl.textContent = 'Rp ' + Number(result.fee).toLocaleString();
            if (invoiceExpiryEl) invoiceExpiryEl.textContent = result.expiredAt || '-';
            
            if (details) details.style.display = 'block';
            if (checkBtn) checkBtn.style.display = 'inline-flex';
            if (copyBtn) copyBtn.style.display = 'inline-flex';

            // Start timer
            if (result.expiredAt) {
                const expiry = new Date(result.expiredAt);
                startPaymentTimer(expiry);
            }

            // Save to history
            addInvoiceToHistory(result);

            if (typeof showToast === 'function') {
                showToast('Success', 'Invoice berhasil dibuat!', 'success');
            }
        } else {
            throw new Error(result.error || 'Gagal membuat invoice');
        }
    } catch (error) {
        console.error('Invoice Error:', error);
        if (typeof showToast === 'function') {
            showToast('Error', error.message || 'Gagal membuat invoice', 'error');
        }
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-qrcode"></i> Buat Invoice';
    }
};

// Fungsi global untuk cek status invoice
window.checkInvoiceStatus = async function(invoiceId) {
    if (!invoiceId) {
        if (typeof showToast === 'function') {
            showToast('Error', 'Tidak ada invoice yang aktif', 'error');
        }
        return;
    }

    const checkBtn = document.getElementById('checkStatusBtn');
    if (checkBtn) {
        checkBtn.disabled = true;
        checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cek...';
    }

    try {
        const result = await PAYMENT_API.checkInvoiceStatus(invoiceId);

        if (result.success) {
            updateInvoiceStatus(result.status);
            
            // Update history
            if (typeof window.invoiceHistory !== 'undefined') {
                const historyItem = window.invoiceHistory.find(h => h.invoice_id === invoiceId);
                if (historyItem) {
                    historyItem.status = result.status;
                    localStorage.setItem('joellInvoiceHistory', JSON.stringify(window.invoiceHistory));
                    if (typeof renderInvoiceHistory === 'function') renderInvoiceHistory();
                }
            }
            
            if (result.status === 'paid') {
                if (typeof showToast === 'function') {
                    showToast('Pembayaran Berhasil!', 'Invoice telah dibayar. Pesanan akan diproses.', 'success', 5000);
                }
                setTimeout(() => {
                    const overlay = document.getElementById('paymentOverlay');
                    if (overlay) overlay.classList.remove('open');
                }, 3000);
            } else if (result.status === 'expired') {
                if (typeof showToast === 'function') {
                    showToast('Invoice Kadaluarsa', 'Invoice sudah kadaluarsa. Buat invoice baru.', 'warning');
                }
            }
        } else {
            throw new Error(result.error || 'Gagal mengecek status');
        }
    } catch (error) {
        console.error('Status Check Error:', error);
        if (typeof showToast === 'function') {
            showToast('Error', error.message || 'Gagal mengecek status', 'error');
        }
    } finally {
        if (checkBtn) {
            checkBtn.disabled = false;
            checkBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Cek Status';
        }
    }
};

// Fungsi global untuk update status invoice
window.updateInvoiceStatus = function(status) {
    const badge = document.getElementById('invoiceStatusBadge');
    const statusMap = {
        'pending': { label: '⏳ Menunggu', class: 'pending' },
        'paid': { label: '✅ Lunas', class: 'paid' },
        'expired': { label: '❌ Kadaluarsa', class: 'expired' },
        'failed': { label: '❌ Gagal', class: 'failed' }
    };
    const info = statusMap[status] || statusMap['pending'];
    if (badge) {
        badge.textContent = info.label;
        badge.className = 'payment-status-badge ' + info.class;
    }
};

// Fungsi global untuk timer payment
window.startPaymentTimer = function(expiryDate) {
    const timerEl = document.getElementById('paymentTimer');
    const displayEl = document.getElementById('timerDisplay');
    if (timerEl) timerEl.style.display = 'block';

    if (window.timerInterval) clearInterval(window.timerInterval);

    window.timerInterval = setInterval(() => {
        const now = new Date();
        const diff = expiryDate - now;

        if (diff <= 0) {
            clearInterval(window.timerInterval);
            if (displayEl) displayEl.textContent = '00:00';
            if (timerEl) timerEl.classList.add('expired');
            updateInvoiceStatus('expired');
            return;
        }

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        if (displayEl) {
            displayEl.textContent = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
        }
        if (timerEl) timerEl.classList.remove('expired');
    }, 1000);
};

// Fungsi global untuk fetch withdraw methods
window.fetchWithdrawMethods = async function() {
    try {
        const result = await PAYMENT_API.getWithdrawMethods();
        
        const grid = document.getElementById('withdrawMethodsGrid');
        if (!grid) return;
        
        grid.innerHTML = '';

        const allMethods = [...(result.manualMethods || []), ...(result.instantMethods || [])];
        
        if (allMethods.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;text-align:center;grid-column:1/-1;">Tidak ada metode penarikan</p>';
            return;
        }
        
        allMethods.forEach(method => {
            const btn = document.createElement('button');
            btn.className = 'withdraw-method-item';
            btn.dataset.method = method.method;
            btn.dataset.fee = method.fee || 0;
            btn.dataset.min = method.min || 10000;
            btn.dataset.max = method.max || 1000000;
            btn.innerHTML = `
                <i class="fas fa-wallet"></i>
                ${method.name}
                <span class="method-name">${method.instant ? '⚡ Instant' : '🔄 Manual'}</span>
            `;
            btn.onclick = () => window.selectWithdrawMethod(btn, method);
            grid.appendChild(btn);
        });

        return allMethods;
    } catch (error) {
        console.error('Withdraw Methods Error:', error);
        if (typeof showToast === 'function') {
            showToast('Error', 'Gagal mengambil metode withdraw', 'error');
        }
        return [];
    }
};

// Fungsi global untuk select withdraw method
window.selectWithdrawMethod = function(btn, method) {
    document.querySelectorAll('.withdraw-method-item').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');
    window.selectedWithdrawMethodData = method;
    
    const info = document.getElementById('withdrawInfo');
    if (info) {
        info.textContent = `💰 ${method.name} | Biaya: Rp ${(method.fee || 0).toLocaleString()} | Min: Rp ${(method.min || 10000).toLocaleString()} | Max: Rp ${(method.max || 1000000).toLocaleString()}`;
    }
};

// Fungsi global untuk proses withdraw
window.processWithdraw = async function() {
    const amountInput = document.getElementById('withdrawAmount');
    const accountInput = document.getElementById('withdrawAccount');
    const btn = document.getElementById('withdrawBtn');

    if (!amountInput || !accountInput || !btn) return;

    const amount = parseInt(amountInput.value);
    const account = accountInput.value.trim();

    if (!window.selectedWithdrawMethodData) {
        if (typeof showToast === 'function') {
            showToast('Error', 'Pilih metode penarikan terlebih dahulu', 'error');
        }
        return;
    }

    if (!amount || amount <= 0) {
        if (typeof showToast === 'function') {
            showToast('Error', 'Masukkan jumlah yang valid', 'error');
        }
        return;
    }

    if (amount < (window.selectedWithdrawMethodData.min || 10000)) {
        if (typeof showToast === 'function') {
            showToast('Error', `Minimal penarikan Rp ${(window.selectedWithdrawMethodData.min || 10000).toLocaleString()}`, 'error');
        }
        return;
    }

    if (amount > (window.selectedWithdrawMethodData.max || 1000000)) {
        if (typeof showToast === 'function') {
            showToast('Error', `Maksimal penarikan Rp ${(window.selectedWithdrawMethodData.max || 1000000).toLocaleString()}`, 'error');
        }
        return;
    }

    if (!account) {
        if (typeof showToast === 'function') {
            showToast('Error', 'Masukkan nomor rekening/e-wallet', 'error');
        }
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

    try {
        const result = await PAYMENT_API.processWithdraw(
            amount,
            window.selectedWithdrawMethodData.method,
            account,
            window.selectedWithdrawMethodData.instant || false
        );

        if (result.success) {
            if (typeof showToast === 'function') {
                showToast('Berhasil!', result.message || 'Permintaan penarikan berhasil', 'success');
            }
            amountInput.value = '';
            accountInput.value = '';
            if (typeof fetchBalance === 'function') fetchBalance();
            addWithdrawToHistory(result);
        } else {
            throw new Error(result.error || 'Gagal melakukan penarikan');
        }
    } catch (error) {
        console.error('Withdraw Error:', error);
        if (typeof showToast === 'function') {
            showToast('Error', error.message || 'Gagal melakukan penarikan', 'error');
        }
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-arrow-up"></i> Tarik';
    }
};

// Fungsi global untuk add withdraw history
window.addWithdrawToHistory = function(result) {
    if (result.data) {
        if (typeof window.withdrawHistory === 'undefined') {
            window.withdrawHistory = JSON.parse(localStorage.getItem('joellWithdrawHistory')) || [];
        }
        window.withdrawHistory.push({
            amount: result.data.amount,
            method: result.data.method,
            account_number: result.data.account_number,
            status: result.data.status || 'pending',
            created_at: result.data.created_at || new Date().toISOString()
        });
        localStorage.setItem('joellWithdrawHistory', JSON.stringify(window.withdrawHistory));
        if (typeof renderWithdrawHistory === 'function') renderWithdrawHistory();
    }
};

// Fungsi global untuk render withdraw history
window.renderWithdrawHistory = function() {
    const container = document.getElementById('withdrawHistory');
    if (!container) return;
    
    if (typeof window.withdrawHistory === 'undefined') {
        window.withdrawHistory = JSON.parse(localStorage.getItem('joellWithdrawHistory')) || [];
    }
    
    if (!window.withdrawHistory.length) {
        container.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;text-align:center;">Belum ada riwayat penarikan</p>';
        return;
    }

    container.innerHTML = window.withdrawHistory.slice(-5).reverse().map(item => `
        <div class="withdraw-history-item">
            <div class="wh-left">
                <span class="wh-amount">Rp ${Number(item.amount).toLocaleString()}</span>
                <span class="wh-method">${item.method} - ${item.account_number || '-'}</span>
            </div>
            <span class="wh-status ${item.status || 'pending'}">${item.status || 'Pending'}</span>
        </div>
    `).join('');
};

// Fungsi global untuk add invoice history
window.addInvoiceToHistory = function(data) {
    if (typeof window.invoiceHistory === 'undefined') {
        window.invoiceHistory = JSON.parse(localStorage.getItem('joellInvoiceHistory')) || [];
    }
    window.invoiceHistory.push({
        invoice_id: data.invoiceId,
        amount: data.amount,
        total: data.total,
        status: 'pending',
        created_at: data.expiredAt || new Date().toISOString()
    });
    localStorage.setItem('joellInvoiceHistory', JSON.stringify(window.invoiceHistory));
    if (typeof renderInvoiceHistory === 'function') renderInvoiceHistory();
};

// Fungsi global untuk render invoice history
window.renderInvoiceHistory = function() {
    const container = document.getElementById('invoiceHistoryList');
    if (!container) return;

    if (typeof window.invoiceHistory === 'undefined') {
        window.invoiceHistory = JSON.parse(localStorage.getItem('joellInvoiceHistory')) || [];
    }

    if (!window.invoiceHistory.length) {
        container.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;text-align:center;">Belum ada invoice</p>';
        return;
    }

    container.innerHTML = window.invoiceHistory.slice(-5).reverse().map(item => `
        <div class="invoice-history-item">
            <div class="ih-left">
                <span class="ih-id">#${item.invoice_id}</span>
                <span class="ih-amount">Rp ${Number(item.total || item.amount).toLocaleString()}</span>
            </div>
            <span class="ih-status ${item.status || 'pending'}">${item.status || 'Pending'}</span>
        </div>
    `).join('');
};

// Fungsi global untuk copy bank info
window.copyBankInfo = function() {
    const bankTotal = document.getElementById('bankTotal');
    const info = `BCA\n1234567890\nA/N JOELL SHOP\nTotal: ${bankTotal ? bankTotal.textContent : ''}`;
    navigator.clipboard.writeText(info).then(() => {
        if (typeof showToast === 'function') {
            showToast('Berhasil', 'Info bank disalin!', 'success');
        }
    }).catch(() => {
        if (typeof showToast === 'function') {
            showToast('Gagal', 'Gagal menyalin', 'error');
        }
    });
};

// Fungsi global untuk open payment modal
window.openPaymentModal = function(orderData) {
    const overlay = document.getElementById('paymentOverlay');
    if (!overlay) return;
    
    // Set order items
    const itemsContainer = document.getElementById('paymentOrderItems');
    const totalEl = document.getElementById('paymentOrderTotal');
    const bankTotal = document.getElementById('bankTotal');
    
    let total = 0;
    if (orderData && orderData.items) {
        if (itemsContainer) {
            itemsContainer.innerHTML = orderData.items.map(item => `
                <div class="order-item-line">${item.name} (${item.variant}) x${item.qty} = Rp ${(item.price * item.qty).toLocaleString()}</div>
            `).join('');
        }
        total = orderData.total || orderData.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    } else {
        // Fallback: use cart
        const cart = JSON.parse(localStorage.getItem('joellCart')) || [];
        if (itemsContainer) {
            itemsContainer.innerHTML = cart.map(item => `
                <div class="order-item-line">${item.name} (${item.variant}) x${item.qty} = Rp ${(item.price * item.qty).toLocaleString()}</div>
            `).join('');
        }
        total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    }
    
    if (totalEl) totalEl.textContent = 'Total: Rp ' + total.toLocaleString();
    if (bankTotal) bankTotal.textContent = 'Rp ' + total.toLocaleString();
    
    // Reset payment UI
    const qrisWrapper = document.getElementById('qrisImageWrapper');
    const details = document.getElementById('paymentDetails');
    const timer = document.getElementById('paymentTimer');
    const checkBtn = document.getElementById('checkStatusBtn');
    const copyBtn = document.getElementById('copyPaymentLinkBtn');
    const qrisContainer = document.getElementById('qrisContainer');
    
    if (qrisWrapper) qrisWrapper.style.display = 'none';
    if (details) details.style.display = 'none';
    if (timer) timer.style.display = 'none';
    if (checkBtn) checkBtn.style.display = 'none';
    if (copyBtn) copyBtn.style.display = 'none';
    
    const qrisSection = document.getElementById('paymentQrisSection');
    const bankSection = document.getElementById('paymentBankSection');
    if (qrisSection) qrisSection.style.display = 'block';
    if (bankSection) bankSection.style.display = 'none';
    
    // Reset method buttons
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.method === 'qris');
    });
    
    // Reset QRIS container placeholder
    if (qrisContainer) {
        const p = qrisContainer.querySelector('p');
        if (p) p.style.display = 'block';
    }
    
    // Store order data for payment
    overlay.dataset.orderData = JSON.stringify(orderData || {});
    overlay.dataset.total = total;
    
    overlay.classList.add('open');
    
    // Fetch balance and withdraw methods
    if (typeof fetchBalance === 'function') fetchBalance();
    if (typeof fetchWithdrawMethods === 'function') fetchWithdrawMethods();
    if (typeof renderWithdrawHistory === 'function') renderWithdrawHistory();
    if (typeof renderInvoiceHistory === 'function') renderInvoiceHistory();
};

// ============================================================
// INIT PAYMENT SYSTEM
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    // Load histories
    const storedWithdraw = localStorage.getItem('joellWithdrawHistory');
    if (storedWithdraw) {
        try {
            window.withdrawHistory = JSON.parse(storedWithdraw);
            if (typeof renderWithdrawHistory === 'function') renderWithdrawHistory();
        } catch(e) {}
    }
    const storedInvoice = localStorage.getItem('joellInvoiceHistory');
    if (storedInvoice) {
        try {
            window.invoiceHistory = JSON.parse(storedInvoice);
            if (typeof renderInvoiceHistory === 'function') renderInvoiceHistory();
        } catch(e) {}
    }

    // Payment method switching
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.payment-method-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const method = this.dataset.method;
            const qrisSection = document.getElementById('paymentQrisSection');
            const bankSection = document.getElementById('paymentBankSection');
            if (qrisSection) qrisSection.style.display = method === 'qris' ? 'block' : 'none';
            if (bankSection) bankSection.style.display = method === 'bank' ? 'block' : 'none';
        });
    });

    // Create Invoice
    const createBtn = document.getElementById('createInvoiceBtn');
    if (createBtn) {
        createBtn.addEventListener('click', function() {
            const totalEl = document.getElementById('paymentOrderTotal');
            if (totalEl) {
                const total = parseInt(totalEl.textContent.replace(/[^0-9]/g, ''));
                if (total > 0 && typeof window.createInvoice === 'function') {
                    window.createInvoice(total);
                } else {
                    if (typeof showToast === 'function') {
                        showToast('Error', 'Total pembayaran tidak valid', 'error');
                    }
                }
            }
        });
    }

    // Check Status
    const checkBtn = document.getElementById('checkStatusBtn');
    if (checkBtn) {
        checkBtn.addEventListener('click', function() {
            if (window.currentInvoiceId && typeof window.checkInvoiceStatus === 'function') {
                window.checkInvoiceStatus(window.currentInvoiceId);
            }
        });
    }

    // Copy Payment Link
    const copyBtn = document.getElementById('copyPaymentLinkBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            if (window.currentInvoiceId) {
                const link = `https://app.lzpedia.my.id/pay/${window.currentInvoiceId}`;
                navigator.clipboard.writeText(link).then(() => {
                    if (typeof showToast === 'function') {
                        showToast('Berhasil', 'Link pembayaran disalin!', 'success');
                    }
                }).catch(() => {
                    if (typeof showToast === 'function') {
                        showToast('Gagal', 'Gagal menyalin link', 'error');
                    }
                });
            }
        });
    }

    // Withdraw
    const withdrawBtn = document.getElementById('withdrawBtn');
    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', function() {
            if (typeof window.processWithdraw === 'function') window.processWithdraw();
        });
    }

    // Balance Refresh
    const refreshBtn = document.getElementById('balanceRefreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            if (typeof window.fetchBalance === 'function') window.fetchBalance();
        });
    }

    // Close Payment Modal
    const closeBtn = document.getElementById('paymentCloseBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            const overlay = document.getElementById('paymentOverlay');
            if (overlay) overlay.classList.remove('open');
            if (window.timerInterval) clearInterval(window.timerInterval);
        });
    }

    // Load initial data
    if (typeof window.fetchBalance === 'function') window.fetchBalance();
    if (typeof window.fetchWithdrawMethods === 'function') window.fetchWithdrawMethods();
});

console.log('✅ Payment API Loaded Successfully!');
console.log('🔑 API Key:', PAYMENT_API.config.apiKey);
console.log('👤 User ID:', PAYMENT_API.config.userId);
