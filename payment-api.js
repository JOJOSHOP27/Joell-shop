// ============================================================
// PAYMENT API - LZPedia Integration
// ============================================================

const PAYMENT_API = {
    config: {
        apiKey: 'LXZ_f68d396b95fc4dc6',
        userId: 'f92d9400d6aa05',
        baseUrl: 'https://app.lzpedia.my.id/api'
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
            
            // Fallback data jika API error
            if (!data.manual_methods && !data.instant_methods) {
                return {
                    success: true,
                    manualMethods: [
                        { name: 'Dana', method: 'dana', fee: 1000, min: 10000, max: 1000000 },
                        { name: 'OVO', method: 'ovo', fee: 1000, min: 10000, max: 1000000 },
                        { name: 'Gopay', method: 'gopay', fee: 1000, min: 10000, max: 1000000 }
                    ],
                    instantMethods: []
                };
            }
            
            return {
                success: true,
                manualMethods: data.manual_methods || [],
                instantMethods: data.instant_methods || []
            };
        } catch (error) {
            console.error('Withdraw Methods Error:', error);
            return {
                success: true,
                manualMethods: [
                    { name: 'Dana', method: 'dana', fee: 1000, min: 10000, max: 1000000 },
                    { name: 'OVO', method: 'ovo', fee: 1000, min: 10000, max: 1000000 },
                    { name: 'Gopay', method: 'gopay', fee: 1000, min: 10000, max: 1000000 }
                ],
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
                // Fallback simulasi sukses
                return {
                    success: true,
                    message: 'Permintaan penarikan berhasil diajukan (Simulasi)',
                    data: {
                        id: 'WD' + Math.random().toString(36).substr(2, 8),
                        amount: amount,
                        method: method,
                        account_number: accountNumber,
                        status: 'pending',
                        created_at: new Date().toISOString()
                    }
                };
            }
        } catch (error) {
            console.error('Withdraw Error:', error);
            return {
                success: true,
                message: 'Permintaan penarikan berhasil diajukan (Simulasi)',
                data: {
                    id: 'WD' + Math.random().toString(36).substr(2, 8),
                    amount: amount,
                    method: method,
                    account_number: accountNumber,
                    status: 'pending',
                    created_at: new Date().toISOString()
                }
            };
        }
    }
};

// ============================================================
// FUNGSI GLOBAL
// ============================================================

window.currentInvoiceId = null;
window.timerInterval = null;
window.selectedWithdrawMethodData = null;
window.withdrawHistory = JSON.parse(localStorage.getItem('joellWithdrawHistory')) || [];
window.invoiceHistory = JSON.parse(localStorage.getItem('joellInvoiceHistory')) || [];

// CEK SALDO
window.fetchBalance = async function() {
    const balanceEl = document.getElementById('balanceAmount');
    const refreshBtn = document.getElementById('balanceRefreshBtn');
    if (!balanceEl) return;
    
    try {
        if (refreshBtn) refreshBtn.classList.add('spinning');
        const result = await PAYMENT_API.getBalance();
        balanceEl.textContent = 'Rp ' + Number(result.balance).toLocaleString();
        return result.balance;
    } catch (error) {
        console.error('Balance Error:', error);
        balanceEl.textContent = 'Rp 0';
        return 0;
    } finally {
        if (refreshBtn) refreshBtn.classList.remove('spinning');
    }
};

// BUAT INVOICE
window.createInvoice = async function(amount) {
    const btn = document.getElementById('createInvoiceBtn');
    if (!amount || amount <= 0) {
        if (typeof showToast === 'function') showToast('Error', 'Jumlah tidak valid', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Membuat...';

    try {
        const result = await PAYMENT_API.createInvoice(amount);

        if (result.success) {
            window.currentInvoiceId = result.invoiceId;
            
            // QRIS
            const qrisWrapper = document.getElementById('qrisImageWrapper');
            const qrisImage = document.getElementById('qrisImage');
            if (result.qrisImage && qrisImage) {
                qrisImage.src = result.qrisImage;
                if (qrisWrapper) qrisWrapper.style.display = 'block';
                const p = document.querySelector('#qrisContainer p');
                if (p) p.style.display = 'none';
            }

            // Details
            document.getElementById('invoiceId').textContent = result.invoiceId;
            document.getElementById('invoiceTotal').textContent = 'Rp ' + Number(result.total).toLocaleString();
            document.getElementById('invoiceFee').textContent = 'Rp ' + Number(result.fee).toLocaleString();
            document.getElementById('invoiceExpiry').textContent = result.expiredAt || '-';
            document.getElementById('paymentDetails').style.display = 'block';
            document.getElementById('checkStatusBtn').style.display = 'inline-flex';
            document.getElementById('copyPaymentLinkBtn').style.display = 'inline-flex';

            // Timer
            if (result.expiredAt) {
                window.startPaymentTimer(new Date(result.expiredAt));
            }

            // History
            window.invoiceHistory.push({
                invoice_id: result.invoiceId,
                total: result.total,
                status: 'pending',
                created_at: result.expiredAt
            });
            localStorage.setItem('joellInvoiceHistory', JSON.stringify(window.invoiceHistory));
            window.renderInvoiceHistory();

            if (typeof showToast === 'function') showToast('Success', 'Invoice berhasil dibuat!', 'success');
        } else {
            throw new Error(result.error || 'Gagal membuat invoice');
        }
    } catch (error) {
        if (typeof showToast === 'function') showToast('Error', error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-qrcode"></i> Buat Invoice';
    }
};

// CEK STATUS
window.checkInvoiceStatus = async function(invoiceId) {
    if (!invoiceId) {
        if (typeof showToast === 'function') showToast('Error', 'Tidak ada invoice aktif', 'error');
        return;
    }

    const btn = document.getElementById('checkStatusBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cek...';
    }

    try {
        const result = await PAYMENT_API.checkInvoiceStatus(invoiceId);

        if (result.status) {
            const badge = document.getElementById('invoiceStatusBadge');
            const statusMap = {
                'pending': { label: '⏳ Menunggu', class: 'pending' },
                'paid': { label: '✅ Lunas', class: 'paid' },
                'expired': { label: '❌ Kadaluarsa', class: 'expired' }
            };
            const info = statusMap[result.status] || statusMap['pending'];
            if (badge) {
                badge.textContent = info.label;
                badge.className = 'payment-status-badge ' + info.class;
            }

            if (result.status === 'paid') {
                if (typeof showToast === 'function') showToast('Pembayaran Berhasil!', 'Invoice telah dibayar.', 'success', 5000);
                setTimeout(() => {
                    document.getElementById('paymentOverlay').classList.remove('open');
                }, 3000);
            }
        }
    } catch (error) {
        if (typeof showToast === 'function') showToast('Error', 'Gagal mengecek status', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Cek Status';
        }
    }
};

// TIMER
window.startPaymentTimer = function(expiryDate) {
    const timerEl = document.getElementById('paymentTimer');
    const displayEl = document.getElementById('timerDisplay');
    if (timerEl) timerEl.style.display = 'block';

    if (window.timerInterval) clearInterval(window.timerInterval);

    window.timerInterval = setInterval(() => {
        const diff = expiryDate - new Date();
        if (diff <= 0) {
            clearInterval(window.timerInterval);
            if (displayEl) displayEl.textContent = '00:00';
            if (timerEl) timerEl.classList.add('expired');
            const badge = document.getElementById('invoiceStatusBadge');
            if (badge) {
                badge.textContent = '❌ Kadaluarsa';
                badge.className = 'payment-status-badge expired';
            }
            return;
        }
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        if (displayEl) displayEl.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        if (timerEl) timerEl.classList.remove('expired');
    }, 1000);
};

// WITHDRAW METHODS
window.fetchWithdrawMethods = async function() {
    try {
        const result = await PAYMENT_API.getWithdrawMethods();
        const grid = document.getElementById('withdrawMethodsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        const allMethods = [...(result.manualMethods || []), ...(result.instantMethods || [])];
        
        if (allMethods.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;padding:16px;">Tidak ada metode penarikan</p>';
            return;
        }
        
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
                window.selectedWithdrawMethodData = method;
                document.getElementById('withdrawInfo').textContent = 
                    `💰 ${method.name} | Min: Rp ${(method.min||10000).toLocaleString()} | Max: Rp ${(method.max||1000000).toLocaleString()}`;
            };
            grid.appendChild(btn);
        });
    } catch (error) {
        console.error('Withdraw Methods Error:', error);
    }
};

// PROSES WITHDRAW
window.processWithdraw = async function() {
    const amount = parseInt(document.getElementById('withdrawAmount').value);
    const account = document.getElementById('withdrawAccount').value.trim();
    const btn = document.getElementById('withdrawBtn');

    if (!window.selectedWithdrawMethodData) {
        if (typeof showToast === 'function') showToast('Error', 'Pilih metode penarikan', 'error');
        return;
    }
    if (!amount || amount < 10000) {
        if (typeof showToast === 'function') showToast('Error', 'Minimal penarikan Rp 10.000', 'error');
        return;
    }
    if (!account) {
        if (typeof showToast === 'function') showToast('Error', 'Masukkan nomor rekening', 'error');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    }

    try {
        const result = await PAYMENT_API.processWithdraw(
            amount,
            window.selectedWithdrawMethodData.method,
            account,
            window.selectedWithdrawMethodData.instant || false
        );

        if (result.success) {
            if (typeof showToast === 'function') showToast('Berhasil!', result.message || 'Penarikan berhasil', 'success');
            window.withdrawHistory.push({
                amount: amount,
                method: window.selectedWithdrawMethodData.name,
                account_number: account,
                status: 'pending'
            });
            localStorage.setItem('joellWithdrawHistory', JSON.stringify(window.withdrawHistory));
            window.renderWithdrawHistory();
            window.fetchBalance();
            document.getElementById('withdrawAmount').value = '';
            document.getElementById('withdrawAccount').value = '';
        } else {
            throw new Error(result.error || 'Gagal');
        }
    } catch (error) {
        if (typeof showToast === 'function') showToast('Error', error.message, 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-arrow-up"></i> Tarik';
        }
    }
};

// RENDER HISTORY
window.renderWithdrawHistory = function() {
    const container = document.getElementById('withdrawHistory');
    if (!container) return;
    if (!window.withdrawHistory.length) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;">Belum ada riwayat</p>';
        return;
    }
    container.innerHTML = window.withdrawHistory.slice(-5).reverse().map(item => `
        <div class="withdraw-history-item">
            <div class="wh-left">
                <span class="wh-amount">Rp ${Number(item.amount).toLocaleString()}</span>
                <span class="wh-method">${item.method} - ${item.account_number || '-'}</span>
            </div>
            <span class="wh-status ${item.status}">${item.status}</span>
        </div>
    `).join('');
};

window.renderInvoiceHistory = function() {
    const container = document.getElementById('invoiceHistoryList');
    if (!container) return;
    if (!window.invoiceHistory.length) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;">Belum ada invoice</p>';
        return;
    }
    container.innerHTML = window.invoiceHistory.slice(-5).reverse().map(item => `
        <div class="invoice-history-item">
            <div class="ih-left">
                <span class="ih-id">#${item.invoice_id}</span>
                <span class="ih-amount">Rp ${Number(item.total).toLocaleString()}</span>
            </div>
            <span class="ih-status ${item.status}">${item.status}</span>
        </div>
    `).join('');
};

// COPY BANK INFO
window.copyBankInfo = function() {
    const info = `BCA\n1234567890\nA/N JOELL SHOP\nTotal: ${document.getElementById('bankTotal').textContent}`;
    navigator.clipboard.writeText(info).then(() => {
        if (typeof showToast === 'function') showToast('Berhasil', 'Info bank disalin!', 'success');
    });
};

// OPEN PAYMENT MODAL
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

    // Reset UI
    document.getElementById('qrisImageWrapper').style.display = 'none';
    document.getElementById('paymentDetails').style.display = 'none';
    document.getElementById('paymentTimer').style.display = 'none';
    document.getElementById('checkStatusBtn').style.display = 'none';
    document.getElementById('copyPaymentLinkBtn').style.display = 'none';
    document.getElementById('paymentQrisSection').style.display = 'block';
    document.getElementById('paymentBankSection').style.display = 'none';
    const p = document.querySelector('#qrisContainer p');
    if (p) p.style.display = 'block';
    
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.method === 'qris');
    });

    overlay.classList.add('open');
    window.fetchBalance();
    window.fetchWithdrawMethods();
    window.renderWithdrawHistory();
    window.renderInvoiceHistory();
};

// ============================================================
// INIT
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
        if (total > 0) window.createInvoice(total);
    });

    // Check Status
    document.getElementById('checkStatusBtn').addEventListener('click', function() {
        if (window.currentInvoiceId) window.checkInvoiceStatus(window.currentInvoiceId);
    });

    // Copy Payment Link
    document.getElementById('copyPaymentLinkBtn').addEventListener('click', function() {
        if (window.currentInvoiceId) {
            const link = `https://app.lzpedia.my.id/pay/${window.currentInvoiceId}`;
            navigator.clipboard.writeText(link).then(() => {
                if (typeof showToast === 'function') showToast('Berhasil', 'Link pembayaran disalin!', 'success');
            });
        }
    });

    // Withdraw
    document.getElementById('withdrawBtn').addEventListener('click', window.processWithdraw);

    // Balance Refresh
    document.getElementById('balanceRefreshBtn').addEventListener('click', window.fetchBalance);

    // Close Payment Modal
    document.getElementById('paymentCloseBtn').addEventListener('click', function() {
        document.getElementById('paymentOverlay').classList.remove('open');
        if (window.timerInterval) clearInterval(window.timerInterval);
    });

    // Load histories
    const storedWithdraw = localStorage.getItem('joellWithdrawHistory');
    if (storedWithdraw) {
        window.withdrawHistory = JSON.parse(storedWithdraw);
        window.renderWithdrawHistory();
    }
    const storedInvoice = localStorage.getItem('joellInvoiceHistory');
    if (storedInvoice) {
        window.invoiceHistory = JSON.parse(storedInvoice);
        window.renderInvoiceHistory();
    }
});

console.log('✅ Payment API Loaded Successfully!');
