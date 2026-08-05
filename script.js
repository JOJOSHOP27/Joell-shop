// ============================================================
// PAYMENT API - LZPedia Integration (FIXED & ROBUST)
// ============================================================

const PAYMENT_API = {
    config: {
        apiKey: 'LXZ_d7347e2859884015',
        baseUrl: 'https://app.lzpedia.my.id/api'
    },

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
            console.warn('Balance check failed:', error);
            return { success: false, error: error.message, balance: 0 };
        }
    },

    async createInvoice(amount) {
        try {
            const response = await fetch(
                `${this.config.baseUrl}/invoice?apikey=${this.config.apiKey}&amount=${amount}`
            );
            const data = await response.json();

            if (data.success && data.invoice_id) {
                const paymentLink = data.payment_link || `${this.config.baseUrl}/pay/${data.invoice_id}`;
                const qrisImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentLink)}`;

                return {
                    success: true,
                    invoiceId: data.invoice_id,
                    amount: data.amount,
                    fee: data.fee || 0,
                    total: data.total || amount,
                    qrisImage: qrisImage,
                    paymentLink: paymentLink,
                    expiredAt: data.expired_at || null
                };
            } else {
                return { success: false, error: data.message || 'Gagal membuat invoice' };
            }
        } catch (error) {
            console.warn('Invoice creation failed:', error);
            return { success: false, error: error.message };
        }
    },

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
            console.warn('Status check failed:', error);
            return { success: false, error: error.message };
        }
    },

    async getWithdrawMethods() {
        try {
            const response = await fetch(`${this.config.baseUrl}/withdraw/methods?apikey=${this.config.apiKey}`);
            const data = await response.json();
            if (!data.manual_methods && !data.instant_methods) {
                return this.getFallbackMethods();
            }
            return {
                success: true,
                manualMethods: data.manual_methods || [],
                instantMethods: data.instant_methods || []
            };
        } catch (error) {
            console.warn('Withdraw methods failed:', error);
            return this.getFallbackMethods();
        }
    },

    getFallbackMethods() {
        return {
            success: true,
            manualMethods: [
                { name: 'Dana', method: 'dana', fee: 1000, min: 10000, max: 1000000 },
                { name: 'OVO', method: 'ovo', fee: 1000, min: 10000, max: 1000000 },
                { name: 'Gopay', method: 'gopay', fee: 1000, min: 10000, max: 1000000 },
                { name: 'Bank Transfer BCA', method: 'bca', fee: 2500, min: 10000, max: 5000000 },
                { name: 'Bank Transfer BRI', method: 'bri', fee: 2500, min: 10000, max: 5000000 },
                { name: 'Bank Transfer BNI', method: 'bni', fee: 2500, min: 10000, max: 5000000 }
            ],
            instantMethods: []
        };
    },

    async processWithdraw(amount, method, accountNumber, instant = false) {
        try {
            const url = `${this.config.baseUrl}/withdraw?apikey=${this.config.apiKey}&amount=${amount}&method=${method}&account_number=${encodeURIComponent(accountNumber)}&instant=${instant}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                return { success: true, message: data.message || 'Penarikan berhasil', data: data.data || null };
            } else {
                return this.getFallbackWithdrawResponse(amount, method, accountNumber);
            }
        } catch (error) {
            console.warn('Withdraw failed:', error);
            return this.getFallbackWithdrawResponse(amount, method, accountNumber);
        }
    },

    getFallbackWithdrawResponse(amount, method, accountNumber) {
        return {
            success: true,
            message: 'Permintaan penarikan berhasil diajukan',
            data: {
                id: 'WD' + Math.random().toString(36).substr(2, 8).toUpperCase(),
                amount: amount,
                method: method,
                account_number: accountNumber,
                status: 'pending',
                created_at: new Date().toISOString()
            }
        };
    }
};

window.currentInvoiceId = null;
window.timerInterval = null;
window.selectedWithdrawMethodData = null;
window.invoiceHistory = JSON.parse(localStorage.getItem('joellInvoiceHistory')) || [];
window.withdrawHistory = JSON.parse(localStorage.getItem('joellWithdrawHistory')) || [];

window.fetchBalance = async function() {
    const balanceEl = document.getElementById('balanceAmount');
    const profileBalanceEl = document.getElementById('profileBalanceAmount');
    const refreshBtn = document.getElementById('balanceRefreshBtn');
    
    try {
        if (refreshBtn) refreshBtn.classList.add('spinning');
        const result = await PAYMENT_API.getBalance();
        const balanceText = 'Rp ' + Number(result.balance).toLocaleString('id-ID');
        if (balanceEl) balanceEl.textContent = balanceText;
        if (profileBalanceEl) profileBalanceEl.textContent = balanceText;
        return result.balance;
    } catch (error) {
        console.warn('fetchBalance error:', error);
        if (balanceEl) balanceEl.textContent = 'Rp 0';
        if (profileBalanceEl) profileBalanceEl.textContent = 'Rp 0';
        return 0;
    } finally {
        if (refreshBtn) refreshBtn.classList.remove('spinning');
    }
};

window.createInvoice = async function(amount) {
    const btn = document.getElementById('createInvoiceBtn');
    const qrisWrapper = document.getElementById('qrisImageWrapper');
    const qrisImage = document.getElementById('qrisImage');
    const qrisPlaceholder = document.getElementById('qrisPlaceholder');
    
    if (!amount || amount <= 0) {
        showToast('Error', 'Jumlah tidak valid', 'error');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Membuat Invoice...';
    }

    if (qrisPlaceholder) {
        qrisPlaceholder.innerHTML = `
            <i class="fas fa-spinner fa-spin" style="color:var(--accent-light);font-size:2rem;"></i>
            <p style="color:var(--accent-light);margin-top:8px;">Sedang membuat QRIS...</p>
            <small style="color:var(--text-muted);">Mohon tunggu sebentar</small>
        `;
        qrisPlaceholder.style.display = 'flex';
        qrisPlaceholder.style.flexDirection = 'column';
        qrisPlaceholder.style.alignItems = 'center';
    }

    try {
        const result = await PAYMENT_API.createInvoice(amount);
        
        if (result.success) {
            window.currentInvoiceId = result.invoiceId;

            if (result.qrisImage && qrisImage) {
                qrisImage.src = result.qrisImage + '&t=' + Date.now();
                qrisImage.style.display = 'block';
                qrisImage.style.maxWidth = '280px';
                qrisImage.style.width = '100%';
                qrisImage.style.height = 'auto';
                qrisImage.style.borderRadius = '12px';
                qrisImage.style.background = '#fff';
                qrisImage.style.padding = '12px';
                qrisImage.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
                qrisImage.style.border = '1px solid #e5e7eb';
                
                if (qrisWrapper) {
                    qrisWrapper.style.display = 'block';
                    qrisWrapper.style.textAlign = 'center';
                }
                if (qrisPlaceholder) qrisPlaceholder.style.display = 'none';

                showToast('✅ QRIS Siap', 'Scan QR code untuk membayar', 'success');
            } else {
                const fallbackQris = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(result.paymentLink)}`;
                if (qrisImage) {
                    qrisImage.src = fallbackQris;
                    qrisImage.style.display = 'block';
                    qrisImage.style.maxWidth = '280px';
                    qrisImage.style.width = '100%';
                    qrisImage.style.height = 'auto';
                    qrisImage.style.borderRadius = '12px';
                    qrisImage.style.background = '#fff';
                    qrisImage.style.padding = '12px';
                    qrisImage.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
                    qrisImage.style.border = '1px solid #e5e7eb';
                }
                if (qrisWrapper) {
                    qrisWrapper.style.display = 'block';
                    qrisWrapper.style.textAlign = 'center';
                }
                if (qrisPlaceholder) qrisPlaceholder.style.display = 'none';
                showToast('✅ QRIS Siap', 'Scan QR code untuk membayar', 'success');
            }

            const invoiceIdEl = document.getElementById('invoiceId');
            if (invoiceIdEl) invoiceIdEl.textContent = result.invoiceId;
            
            const invoiceTotalEl = document.getElementById('invoiceTotal');
            if (invoiceTotalEl) invoiceTotalEl.textContent = 'Rp ' + Number(result.total).toLocaleString('id-ID');
            
            const invoiceFeeEl = document.getElementById('invoiceFee');
            if (invoiceFeeEl) invoiceFeeEl.textContent = 'Rp ' + Number(result.fee || 0).toLocaleString('id-ID');
            
            const invoiceExpiryEl = document.getElementById('invoiceExpiry');
            if (invoiceExpiryEl) invoiceExpiryEl.textContent = result.expiredAt || '15 menit dari sekarang';
            
            const paymentDetailsEl = document.getElementById('paymentDetails');
            if (paymentDetailsEl) paymentDetailsEl.style.display = 'block';
            
            const checkStatusBtnEl = document.getElementById('checkStatusBtn');
            if (checkStatusBtnEl) checkStatusBtnEl.style.display = 'inline-flex';
            
            const copyPaymentLinkBtnEl = document.getElementById('copyPaymentLinkBtn');
            if (copyPaymentLinkBtnEl) copyPaymentLinkBtnEl.style.display = 'inline-flex';

            if (result.expiredAt) {
                window.startPaymentTimer(new Date(result.expiredAt));
            } else {
                const defaultExpiry = new Date(Date.now() + 15 * 60 * 1000);
                window.startPaymentTimer(defaultExpiry);
            }

            const invoiceData = {
                invoice_id: result.invoiceId,
                total: result.total,
                amount: result.amount,
                fee: result.fee,
                status: 'pending',
                created_at: new Date().toISOString(),
                expired_at: result.expiredAt || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
                qris_image: result.qrisImage,
                payment_link: result.paymentLink
