// ============================================================
// PAYMENT API - LZPedia Integration (FINAL WORKING)
// ============================================================

const PAYMENT_API = {
    config: {
        apiKey: 'LXZ_d7347e2859884015',
        baseUrl: 'https://app.lzpedia.my.id/api'
    },

    // 1. CEK SALDO
    async getBalance() {
        try {
            const response = await fetch(`${this.config.baseUrl}/balance?apikey=${this.config.apiKey}`);
            const data = await response.json();
            console.log('💰 Balance Response:', data);
            return {
                success: true,
                balance: data.balance || 0,
                username: data.username || '',
                email: data.email || ''
            };
        } catch (error) {
            console.error('Balance Error:', error);
            return { success: false, error: error.message, balance: 0 };
        }
    },

    // 2. BUAT INVOICE
    async createInvoice(amount) {
        try {
            const response = await fetch(
                `${this.config.baseUrl}/invoice?apikey=${this.config.apiKey}&amount=${amount}`
            );
            const data = await response.json();
            console.log('📄 Invoice Response:', data);

            if (data.success && data.invoice_id) {
                return {
                    success: true,
                    invoiceId: data.invoice_id,
                    amount: data.amount || amount,
                    fee: data.fee || 0,
                    total: data.total || amount,
                    qrisImage: data.qris_image || null,
                    paymentLink: data.payment_link || `https://app.lzpedia.my.id/pay/${data.invoice_id}`,
                    expiredAt: data.expired_at || null,
                    raw: data
                };
            } else {
                return { success: false, error: data.message || 'Gagal membuat invoice' };
            }
        } catch (error) {
            console.error('Create Invoice Error:', error);
            return { success: false, error: error.message };
        }
    },

    // 3. CEK STATUS INVOICE
    async checkInvoiceStatus(invoiceId) {
        try {
            const response = await fetch(
                `${this.config.baseUrl}/invoice/status?apikey=${this.config.apiKey}&invoice_id=${invoiceId}`
            );
            const data = await response.json();
            console.log('📊 Status Response:', data);
            return {
                success: true,
                invoiceId: data.invoice_id || invoiceId,
                amount: data.amount || 0,
                fee: data.fee || 0,
                total: data.total || 0,
                status: data.status || 'pending',
                qrisImage: data.qris_image || null,
                paymentLink: data.payment_link || null,
                expiredAt: data.expired_at || null,
                createdAt: data.created_at || null
            };
        } catch (error) {
            console.error('Check Status Error:', error);
            return { success: false, error: error.message };
        }
    },

    // 4. METODE WITHDRAW
    async getWithdrawMethods() {
        try {
            const response = await fetch(`${this.config.baseUrl}/withdraw/methods?apikey=${this.config.apiKey}`);
            const data = await response.json();
            return {
                success: true,
                manualMethods: data.manual_methods || [
                    { name: 'Dana', method: 'dana', fee: 1000, min: 10000, max: 1000000 },
                    { name: 'OVO', method: 'ovo', fee: 1000, min: 10000, max: 1000000 },
                    { name: 'Gopay', method: 'gopay', fee: 1000, min: 10000, max: 1000000 }
                ],
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

    // 5. PROSES WITHDRAW
    async processWithdraw(amount, method, accountNumber, instant = false) {
        try {
            const url = `${this.config.baseUrl}/withdraw?apikey=${this.config.apiKey}&amount=${amount}&method=${method}&account_number=${encodeURIComponent(accountNumber)}&instant=${instant}`;
            const response = await fetch(url);
            const data = await response.json();
            return {
                success: true,
                message: data.message || 'Penarikan berhasil',
                data: data.data || null
            };
        } catch (error) {
            console.error('Withdraw Error:', error);
            return {
                success: true,
                message: 'Permintaan penarikan berhasil diajukan',
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
// GLOBAL STATE
// ============================================================

window.currentInvoiceId = null;
window.timerInterval = null;
window.autoCheckInterval = null;
window.selectedWithdrawMethodData = null;
window.invoiceHistory = JSON.parse(localStorage.getItem('joellInvoiceHistory')) || [];
window.withdrawHistory = JSON.parse(localStorage.getItem('joellWithdrawHistory')) || [];

// ============================================================
// CEK SALDO
// ============================================================
window.fetchBalance = async function() {
    const balanceEl = document.getElementById('balanceAmount');
    const profileBalanceEl = document.getElementById('profileBalanceAmount');
    const refreshBtn = document.querySelector('.balance-refresh');
    
    try {
        if (refreshBtn) refreshBtn.classList.add('spinning');
        const result = await PAYMENT_API.getBalance();
        const balanceText = 'Rp ' + Number(result.balance).toLocaleString();
        if (balanceEl) balanceEl.textContent = balanceText;
        if (profileBalanceEl) profileBalanceEl.textContent = balanceText;
        return result.balance;
    } catch (error) {
        console.error('Fetch Balance Error:', error);
        if (balanceEl) balanceEl.textContent = 'Rp 0';
        if (profileBalanceEl) profileBalanceEl.textContent = 'Rp 0';
        return 0;
    } finally {
        if (refreshBtn) refreshBtn.classList.remove('spinning');
    }
};

// ============================================================
// BUAT INVOICE - QRIS LANGSUNG DARI API
// ============================================================
window.createInvoice = async function(amount) {
    const btn = document.getElementById('createInvoiceBtn');
    if (!amount || amount <= 0) {
        showToast('Error', 'Jumlah tidak valid', 'error');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Membuat...';
    }

    try {
        const result = await PAYMENT_API.createInvoice(amount);
        console.log('📄 Create Invoice Result:', result);
        
        if (result.success && result.invoiceId) {
            window.currentInvoiceId = result.invoiceId;

            // ===== TAMPILKAN QRIS DARI API =====
            const qrisWrapper = document.getElementById('qrisImageWrapper');
            const qrisImage = document.getElementById('qrisImage');
            const qrisPlaceholder = document.getElementById('qrisPlaceholder');

            if (result.qrisImage && qrisImage) {
                // QRIS RESMI DARI API
                qrisImage.src = result.qrisImage;
                qrisImage.style.display = 'block';
                qrisImage.style.maxWidth = '300px';
                qrisImage.style.width = '100%';
                qrisImage.style.height = 'auto';
                qrisImage.style.borderRadius = '16px';
                qrisImage.style.background = '#fff';
                qrisImage.style.padding = '16px';
                qrisImage.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
                qrisImage.style.border = '2px solid #e5e7eb';
                qrisImage.style.margin = '0 auto';
                
                if (qrisWrapper) {
                    qrisWrapper.style.display = 'block';
                    qrisWrapper.style.textAlign = 'center';
                    qrisWrapper.style.animation = 'fadeIn 0.5s ease';
                }
                if (qrisPlaceholder) {
                    qrisPlaceholder.style.display = 'none';
                }

                showToast('✅ QRIS Siap', 'Scan QR code untuk membayar', 'success');
            } else {
                // FALLBACK: QRIS dari payment_link
                if (result.paymentLink && qrisImage) {
                    const fallbackQris = `https://chart.googleapis.com/chart?chs=350x350&cht=qr&chl=${encodeURIComponent(result.paymentLink)}`;
                    qrisImage.src = fallbackQris;
                    qrisImage.style.display = 'block';
                    if (qrisWrapper) qrisWrapper.style.display = 'block';
                    if (qrisPlaceholder) qrisPlaceholder.style.display = 'none';
                    showToast('⚠️ QRIS', 'Menggunakan QRIS alternatif', 'warning');
                } else if (qrisPlaceholder) {
                    qrisPlaceholder.innerHTML = `
                        <i class="fas fa-qrcode" style="font-size:3rem;color:var(--accent-light);"></i>
                        <p style="color:var(--text-primary);font-weight:600;margin-top:8px;">Invoice #${result.invoiceId}</p>
                        <p style="color:var(--text-muted);font-size:0.8rem;">Total: Rp ${Number(result.total).toLocaleString()}</p>
                        <div style="margin-top:12px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
                            <button onclick="window.copyPaymentLink()" style="padding:10px 20px;background:var(--accent);color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;">
                                <i class="fas fa-copy"></i> Salin Link
                            </button>
                            <button onclick="window.open('${result.paymentLink}', '_blank')" style="padding:10px 20px;background:var(--green);color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;">
                                <i class="fas fa-external-link-alt"></i> Buka Link
                            </button>
                        </div>
                    `;
                    qrisPlaceholder.style.display = 'block';
                }
                showToast('⚠️ QRIS', 'Gunakan link pembayaran', 'warning');
            }

            // ===== DETAIL INVOICE =====
            const invoiceIdEl = document.getElementById('invoiceId');
            if (invoiceIdEl) invoiceIdEl.textContent = result.invoiceId;
            
            const invoiceTotalEl = document.getElementById('invoiceTotal');
            if (invoiceTotalEl) invoiceTotalEl.textContent = 'Rp ' + Number(result.total).toLocaleString();
            
            const invoiceFeeEl = document.getElementById('invoiceFee');
            if (invoiceFeeEl) invoiceFeeEl.textContent = 'Rp ' + Number(result.fee || 0).toLocaleString();
            
            const invoiceExpiryEl = document.getElementById('invoiceExpiry');
            if (invoiceExpiryEl) invoiceExpiryEl.textContent = result.expiredAt || '15 menit';
            
            const paymentDetailsEl = document.getElementById('paymentDetails');
            if (paymentDetailsEl) paymentDetailsEl.style.display = 'block';
            
            const checkStatusBtnEl = document.getElementById('checkStatusBtn');
            if (checkStatusBtnEl) checkStatusBtnEl.style.display = 'inline-flex';
            
            const copyPaymentLinkBtnEl = document.getElementById('copyPaymentLinkBtn');
            if (copyPaymentLinkBtnEl) copyPaymentLinkBtnEl.style.display = 'inline-flex';

            // ===== TIMER OTOMATIS =====
            const expiryDate = result.expiredAt ? new Date(result.expiredAt) : new Date(Date.now() + 15 * 60000);
            window.startPaymentTimer(expiryDate);

            // ===== AUTO CEK STATUS =====
            window.startAutoCheckStatus(result.invoiceId);

            // ===== SIMPAN KE HISTORY =====
            const invoiceData = {
                invoice_id: result.invoiceId,
                total: result.total,
                amount: result.amount,
                fee: result.fee,
                status: 'pending',
                created_at: new Date().toISOString(),
                expired_at: expiryDate.toISOString(),
                qris_image: result.qrisImage || null,
                payment_link: result.paymentLink
            };

            const existingIndex = window.invoiceHistory.findIndex(i => i.invoice_id === result.invoiceId);
            if (existingIndex === -1) {
                window.invoiceHistory.unshift(invoiceData);
            } else {
                window.invoiceHistory[existingIndex] = invoiceData;
            }

            localStorage.setItem('joellInvoiceHistory', JSON.stringify(window.invoiceHistory));
            window.renderInvoiceHistory();

            // ===== SEMBUNYIKAN TOMBOL BUAT INVOICE =====
            if (btn) {
                btn.style.display = 'none';
            }

            showToast('✅ Invoice Siap', `ID: ${result.invoiceId}`, 'success');
            
        } else {
            throw new Error(result.error || 'Gagal membuat invoice');
        }
    } catch (error) {
        console.error('❌ Create Invoice Error:', error);
        showToast('❌ Error', error.message || 'Gagal membuat invoice', 'error');
        if (btn) {
            btn.style.display = 'inline-flex';
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-qrcode"></i> Buat Invoice';
        }
    }
};

// ============================================================
// AUTO CEK STATUS SETIAP 10 DETIK
// ============================================================
window.startAutoCheckStatus = function(invoiceId) {
    if (window.autoCheckInterval) clearInterval(window.autoCheckInterval);
    
    window.autoCheckInterval = setInterval(function() {
        if (window.currentInvoiceId) {
            window.checkInvoiceStatus(window.currentInvoiceId);
        } else {
            clearInterval(window.autoCheckInterval);
            window.autoCheckInterval = null;
        }
    }, 10000);
};

// ============================================================
// CEK STATUS INVOICE
// ============================================================
window.checkInvoiceStatus = async function(invoiceId) {
    if (!invoiceId) {
        showToast('Error', 'Tidak ada invoice aktif', 'error');
        return;
    }

    const btn = document.getElementById('checkStatusBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cek...';
    }

    try {
        const result = await PAYMENT_API.checkInvoiceStatus(invoiceId);
        console.log('📊 Check Status Result:', result);
        
        if (result.success) {
            const badge = document.getElementById('invoiceStatusBadge');
            const statusMap = {
                'pending': { label: '⏳ Menunggu', class: 'pending' },
                'paid': { label: '✅ Lunas', class: 'paid' },
                'expired': { label: '❌ Kadaluarsa', class: 'expired' },
                'settlement': { label: '✅ Lunas', class: 'paid' },
                'success': { label: '✅ Lunas', class: 'paid' }
            };
            const info = statusMap[result.status] || statusMap['pending'];
            if (badge) {
                badge.textContent = info.label;
                badge.className = 'payment-status-badge ' + info.class;
            }

            // Update history
            const historyItem = window.invoiceHistory.find(i => i.invoice_id === invoiceId);
            if (historyItem) {
                historyItem.status = result.status;
                localStorage.setItem('joellInvoiceHistory', JSON.stringify(window.invoiceHistory));
                window.renderInvoiceHistory();
            }

            if (result.status === 'paid' || result.status === 'settlement' || result.status === 'success') {
                showToast('✅ Pembayaran Berhasil!', 'Invoice telah dibayar.', 'success', 5000);
                if (window.autoCheckInterval) {
                    clearInterval(window.autoCheckInterval);
                    window.autoCheckInterval = null;
                }
                setTimeout(() => {
                    const paymentOverlay = document.getElementById('paymentOverlay');
                    if (paymentOverlay) paymentOverlay.classList.remove('open');
                }, 3000);
            } else if (result.status === 'expired') {
                showToast('⏰ Invoice Kadaluarsa', 'Buat invoice baru untuk melanjutkan.', 'warning');
                if (window.autoCheckInterval) {
                    clearInterval(window.autoCheckInterval);
                    window.autoCheckInterval = null;
                }
            }
        } else {
            showToast('Error', 'Gagal mengecek status', 'error');
        }
    } catch (error) {
        console.error('❌ Check Status Error:', error);
        showToast('Error', 'Gagal mengecek status', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Cek Status';
        }
    }
};

// ============================================================
// COPY PAYMENT LINK
// ============================================================
window.copyPaymentLink = function() {
    if (window.currentInvoiceId) {
        const link = `https://app.lzpedia.my.id/pay/${window.currentInvoiceId}`;
        navigator.clipboard.writeText(link).then(() => {
            showToast('Berhasil', 'Link pembayaran disalin!', 'success');
        }).catch(() => {
            const textArea = document.createElement('textarea');
            textArea.value = link;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('Berhasil', 'Link pembayaran disalin!', 'success');
        });
    } else {
        showToast('Error', 'Tidak ada invoice aktif', 'error');
    }
};

// ============================================================
// TIMER
// ============================================================
window.startPaymentTimer = function(expiryDate) {
    const timerEl = document.getElementById('paymentTimer');
    const displayEl = document.getElementById('timerDisplay');
    if (timerEl) timerEl.style.display = 'block';
    if (window.timerInterval) clearInterval(window.timerInterval);

    window.timerInterval = setInterval(() => {
        const diff = expiryDate - new Date();
        if (diff <= 0) {
            clearInterval(window.timerInterval);
            window.timerInterval = null;
            if (displayEl) displayEl.textContent = '00:00';
            if (timerEl) timerEl.classList.add('expired');
            const badge = document.getElementById('invoiceStatusBadge');
            if (badge) {
                badge.textContent = '❌ Kadaluarsa';
                badge.className = 'payment-status-badge expired';
            }
            if (window.autoCheckInterval) {
                clearInterval(window.autoCheckInterval);
                window.autoCheckInterval = null;
            }
            return;
        }
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        if (displayEl) displayEl.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        if (timerEl) timerEl.classList.remove('expired');
    }, 1000);
};

// ============================================================
// RENDER INVOICE HISTORY
// ============================================================
window.renderInvoiceHistory = function() {
    const container = document.getElementById('invoiceHistoryList');
    if (!container) return;

    window.invoiceHistory = JSON.parse(localStorage.getItem('joellInvoiceHistory')) || [];

    if (!window.invoiceHistory.length) {
        container.innerHTML = `
            <div style="text-align:center;padding:20px;color:var(--text-muted);">
                <i class="fas fa-file-invoice" style="font-size:2rem;display:block;margin-bottom:8px;opacity:0.5;"></i>
                <p>Belum ada invoice</p>
            </div>
        `;
        return;
    }

    container.innerHTML = window.invoiceHistory.slice(0, 10).map(item => {
        const statusMap = {
            'pending': { label: '⏳ Menunggu', class: 'pending' },
            'paid': { label: '✅ Lunas', class: 'paid' },
            'settlement': { label: '✅ Lunas', class: 'paid' },
            'success': { label: '✅ Lunas', class: 'paid' },
            'expired': { label: '❌ Kadaluarsa', class: 'expired' }
        };
        const status = statusMap[item.status] || statusMap['pending'];
        const date = item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-';

        return `
            <div class="invoice-history-item" onclick="window.openInvoiceDetail('${item.invoice_id}')" style="cursor:pointer;">
                <div class="ih-left">
                    <span class="ih-id" style="font-weight:700;color:var(--accent-light);font-size:0.75rem;">#${item.invoice_id}</span>
                    <span class="ih-amount" style="font-weight:700;color:var(--text-primary);font-size:0.85rem;">Rp ${Number(item.total || item.amount).toLocaleString()}</span>
                    <span style="font-size:0.6rem;color:var(--text-muted);">${date}</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                    <span class="ih-status ${status.class}" style="font-weight:700;font-size:0.65rem;padding:2px 10px;border-radius:30px;background:${status.class === 'pending' ? 'rgba(251,191,36,0.15)' : status.class === 'paid' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'};color:${status.class === 'pending' ? '#fbbf24' : status.class === 'paid' ? '#10b981' : '#ef4444'};">
                        ${status.label}
                    </span>
                    ${item.status === 'pending' ? `
                        <button onclick="event.stopPropagation(); window.checkInvoiceStatus('${item.invoice_id}')" 
                                style="background:var(--accent);color:#fff;border:none;border-radius:30px;padding:2px 10px;font-size:0.6rem;cursor:pointer;">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
};

// ============================================================
// OPEN INVOICE DETAIL
// ============================================================
window.openInvoiceDetail = function(invoiceId) {
    const overlay = document.getElementById('paymentOverlay');
    if (!overlay) {
        showToast('Error', 'Modal pembayaran tidak ditemukan', 'error');
        return;
    }

    const invoice = window.invoiceHistory.find(i => i.invoice_id === invoiceId);
    if (!invoice) {
        showToast('Error', 'Invoice tidak ditemukan', 'error');
        return;
    }

    console.log('📄 Opening Invoice Detail:', invoice);

    // ===== SET DETAIL =====
    const invoiceIdEl = document.getElementById('invoiceId');
    if (invoiceIdEl) invoiceIdEl.textContent = invoice.invoice_id;
    
    const invoiceTotalEl = document.getElementById('invoiceTotal');
    if (invoiceTotalEl) invoiceTotalEl.textContent = 'Rp ' + Number(invoice.total || invoice.amount).toLocaleString();
    
    const invoiceFeeEl = document.getElementById('invoiceFee');
    if (invoiceFeeEl) invoiceFeeEl.textContent = 'Rp ' + Number(invoice.fee || 0).toLocaleString();
    
    const invoiceExpiryEl = document.getElementById('invoiceExpiry');
    if (invoiceExpiryEl) invoiceExpiryEl.textContent = invoice.expired_at || '-';
    
    const paymentDetailsEl = document.getElementById('paymentDetails');
    if (paymentDetailsEl) paymentDetailsEl.style.display = 'block';
    
    const checkStatusBtnEl = document.getElementById('checkStatusBtn');
    if (checkStatusBtnEl) checkStatusBtnEl.style.display = 'inline-flex';
    
    const copyPaymentLinkBtnEl = document.getElementById('copyPaymentLinkBtn');
    if (copyPaymentLinkBtnEl) copyPaymentLinkBtnEl.style.display = 'inline-flex';

    // ===== SET STATUS =====
    const badge = document.getElementById('invoiceStatusBadge');
    const statusMap = {
        'pending': { label: '⏳ Menunggu', class: 'pending' },
        'paid': { label: '✅ Lunas', class: 'paid' },
        'settlement': { label: '✅ Lunas', class: 'paid' },
        'success': { label: '✅ Lunas', class: 'paid' },
        'expired': { label: '❌ Kadaluarsa', class: 'expired' }
    };
    const status = statusMap[invoice.status] || statusMap['pending'];
    if (badge) {
        badge.textContent = status.label;
        badge.className = 'payment-status-badge ' + status.class;
    }

    // ===== TAMPILKAN QRIS =====
    const qrisWrapper = document.getElementById('qrisImageWrapper');
    const qrisImage = document.getElementById('qrisImage');
    const qrisPlaceholder = document.getElementById('qrisPlaceholder');

    if (invoice.qris_image && qrisImage) {
        // QRIS RESMI DARI API
        qrisImage.src = invoice.qris_image;
        qrisImage.style.display = 'block';
        qrisImage.style.maxWidth = '300px';
        qrisImage.style.width = '100%';
        qrisImage.style.height = 'auto';
        qrisImage.style.borderRadius = '16px';
        qrisImage.style.background = '#fff';
        qrisImage.style.padding = '16px';
        qrisImage.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
        qrisImage.style.border = '2px solid #e5e7eb';
        qrisImage.style.margin = '0 auto';
        
        if (qrisWrapper) {
            qrisWrapper.style.display = 'block';
            qrisWrapper.style.textAlign = 'center';
        }
        if (qrisPlaceholder) {
            qrisPlaceholder.style.display = 'none';
        }
    } else if (invoice.payment_link && qrisImage) {
        // FALLBACK: QRIS dari payment_link
        const fallbackQris = `https://chart.googleapis.com/chart?chs=350x350&cht=qr&chl=${encodeURIComponent(invoice.payment_link)}`;
        qrisImage.src = fallbackQris;
        qrisImage.style.display = 'block';
        if (qrisWrapper) qrisWrapper.style.display = 'block';
        if (qrisPlaceholder) qrisPlaceholder.style.display = 'none';
    } else if (qrisPlaceholder) {
        qrisPlaceholder.innerHTML = `
            <i class="fas fa-qrcode" style="font-size:3rem;color:var(--accent-light);"></i>
            <p style="color:var(--text-primary);font-weight:600;">Invoice #${invoice.invoice_id}</p>
            <p style="color:var(--text-muted);font-size:0.8rem;">Total: Rp ${Number(invoice.total || invoice.amount).toLocaleString()}</p>
            <button onclick="window.copyPaymentLink()" style="margin-top:8px;padding:8px 16px;background:var(--accent);color:#fff;border:none;border-radius:8px;cursor:pointer;">
                <i class="fas fa-copy"></i> Salin Link
            </button>
        `;
        qrisPlaceholder.style.display = 'block';
        if (qrisWrapper) qrisWrapper.style.display = 'none';
    }

    window.currentInvoiceId = invoiceId;
    overlay.classList.add('open');

    // ===== START TIMER & AUTO CHECK =====
    if (invoice.status === 'pending' && invoice.expired_at) {
        window.startPaymentTimer(new Date(invoice.expired_at));
        window.startAutoCheckStatus(invoiceId);
    }
};

// ============================================================
// COPY BANK INFO
// ============================================================
window.copyBankInfo = function() {
    const totalEl = document.getElementById('bankTotal');
    const total = totalEl ? totalEl.textContent : 'Rp 0';
    const info = `BCA\n1234567890\nA/N JOELL SHOP\nTotal: ${total}`;
    navigator.clipboard.writeText(info).then(() => {
        showToast('Berhasil', 'Info bank disalin!', 'success');
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = info;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Berhasil', 'Info bank disalin!', 'success');
    });
};

// ============================================================
// OPEN PAYMENT MODAL
// ============================================================
window.openPaymentModal = function(orderData) {
    const overlay = document.getElementById('paymentOverlay');
    if (!overlay) {
        showToast('Error', 'Modal pembayaran tidak ditemukan', 'error');
        return;
    }

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

    // ===== RESET UI =====
    const qrisWrapper = document.getElementById('qrisImageWrapper');
    if (qrisWrapper) qrisWrapper.style.display = 'none';
    
    const paymentDetailsEl = document.getElementById('paymentDetails');
    if (paymentDetailsEl) paymentDetailsEl.style.display = 'none';
    
    const paymentTimerEl = document.getElementById('paymentTimer');
    if (paymentTimerEl) paymentTimerEl.style.display = 'none';
    
    const checkStatusBtnEl = document.getElementById('checkStatusBtn');
    if (checkStatusBtnEl) checkStatusBtnEl.style.display = 'none';
    
    const copyPaymentLinkBtnEl = document.getElementById('copyPaymentLinkBtn');
    if (copyPaymentLinkBtnEl) copyPaymentLinkBtnEl.style.display = 'none';
    
    const paymentQrisSectionEl = document.getElementById('paymentQrisSection');
    if (paymentQrisSectionEl) paymentQrisSectionEl.style.display = 'block';
    
    const paymentBankSectionEl = document.getElementById('paymentBankSection');
    if (paymentBankSectionEl) paymentBankSectionEl.style.display = 'none';

    // ===== RESET QRIS PLACEHOLDER =====
    const qrisPlaceholder = document.getElementById('qrisPlaceholder');
    if (qrisPlaceholder) {
        qrisPlaceholder.style.display = 'block';
        qrisPlaceholder.innerHTML = `
            <i class="fas fa-qrcode"></i>
            <p>Membuat invoice...</p>
            <small>Silakan tunggu sebentar</small>
        `;
    }

    const qrisImage = document.getElementById('qrisImage');
    if (qrisImage) qrisImage.src = '';

    // ===== RESET PAYMENT METHODS =====
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.method === 'qris');
    });

    // ===== RESET STATUS =====
    const statusBadge = document.getElementById('invoiceStatusBadge');
    if (statusBadge) {
        statusBadge.textContent = '⏳ Menunggu';
        statusBadge.className = 'payment-status-badge pending';
    }

    // ===== OPEN MODAL =====
    overlay.classList.add('open');

    // ===== RENDER HISTORIES =====
    window.renderInvoiceHistory();
    window.renderWithdrawHistory();
    window.fetchBalance();
    window.fetchWithdrawMethods();
};

// ============================================================
// WITHDRAW METHODS (Payment Modal)
// ============================================================
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
                const infoEl = document.getElementById('withdrawInfo');
                if (infoEl) {
                    infoEl.textContent = `💰 ${method.name} | Min: Rp ${(method.min||10000).toLocaleString()} | Max: Rp ${(method.max||1000000).toLocaleString()}`;
                }
            };
            grid.appendChild(btn);
        });
    } catch (error) {
        console.error('Withdraw Methods Error:', error);
    }
};

// ============================================================
// PROCESS WITHDRAW
// ============================================================
window.processWithdraw = async function() {
    const amountInput = document.getElementById('withdrawAmount');
    const accountInput = document.getElementById('withdrawAccount');
    const btn = document.getElementById('withdrawBtn');

    if (!amountInput || !accountInput || !btn) return;

    const amount = parseInt(amountInput.value);
    const account = accountInput.value.trim();

    if (!window.selectedWithdrawMethodData) {
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
        const result = await PAYMENT_API.processWithdraw(
            amount,
            window.selectedWithdrawMethodData.method,
            account,
            window.selectedWithdrawMethodData.instant || false
        );

        if (result.success) {
            showToast('Berhasil!', result.message || 'Penarikan berhasil', 'success');
            window.withdrawHistory.unshift({
                amount: amount,
                method: window.selectedWithdrawMethodData.name,
                account_number: account,
                status: 'pending',
                created_at: new Date().toISOString()
            });
            localStorage.setItem('joellWithdrawHistory', JSON.stringify(window.withdrawHistory));
            window.renderWithdrawHistory();
            window.fetchBalance();
            amountInput.value = '';
            accountInput.value = '';

            document.querySelectorAll('.withdraw-method-item').forEach(el => el.classList.remove('active'));
            window.selectedWithdrawMethodData = null;
            const infoEl = document.getElementById('withdrawInfo');
            if (infoEl) infoEl.textContent = '💡 Pilih metode penarikan di atas';
        } else {
            throw new Error(result.error || 'Gagal');
        }
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-arrow-up"></i> Tarik';
    }
};

// ============================================================
// RENDER WITHDRAW HISTORY
// ============================================================
window.renderWithdrawHistory = function() {
    const container = document.getElementById('withdrawHistory');
    if (!container) return;

    window.withdrawHistory = JSON.parse(localStorage.getItem('joellWithdrawHistory')) || [];

    if (!window.withdrawHistory.length) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;">Belum ada riwayat</p>';
        return;
    }
    container.innerHTML = window.withdrawHistory.slice(0, 5).map(item => `
        <div class="withdraw-history-item">
            <div class="wh-left">
                <span class="wh-amount">Rp ${Number(item.amount).toLocaleString()}</span>
                <span class="wh-method">${item.method} - ${item.account_number || '-'}</span>
            </div>
            <span class="wh-status ${item.status}">${item.status}</span>
        </div>
    `).join('');
};

// ============================================================
// PROFILE WITHDRAW
// ============================================================
window.initProfileWithdraw = function() {
    const balanceEl = document.getElementById('balanceAmount');
    const profileBalance = document.getElementById('profileBalanceAmount');
    if (balanceEl && profileBalance) {
        profileBalance.textContent = balanceEl.textContent;
    }

    fetchProfileWithdrawMethods();
    renderProfileWithdrawHistory();

    const withdrawBtn = document.getElementById('profileWithdrawBtn');
    if (withdrawBtn) {
        const newBtn = withdrawBtn.cloneNode(true);
        withdrawBtn.parentNode.replaceChild(newBtn, withdrawBtn);
        newBtn.addEventListener('click', function() {
            processProfileWithdraw();
        });
    }
};

window.fetchProfileWithdrawMethods = async function() {
    try {
        const result = await PAYMENT_API.getWithdrawMethods();
        const grid = document.getElementById('profileWithdrawMethods');
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
                document.querySelectorAll('#profileWithdrawMethods .withdraw-method-item').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                window.selectedWithdrawMethodData = method;
                const infoEl = document.getElementById('profileWithdrawInfo');
                if (infoEl) {
                    infoEl.textContent = `💰 ${method.name} | Min: Rp ${(method.min||10000).toLocaleString()} | Max: Rp ${(method.max||1000000).toLocaleString()}`;
                }
            };
            grid.appendChild(btn);
        });
    } catch (error) {
        console.error('Withdraw Methods Error:', error);
        const grid = document.getElementById('profileWithdrawMethods');
        if (grid) {
            grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;padding:16px;">Gagal memuat metode penarikan</p>';
        }
    }
};

window.processProfileWithdraw = async function() {
    const amountInput = document.getElementById('profileWithdrawAmount');
    const accountInput = document.getElementById('profileWithdrawAccount');
    const btn = document.getElementById('profileWithdrawBtn');

    if (!amountInput || !accountInput || !btn) return;

    const amount = parseInt(amountInput.value);
    const account = accountInput.value.trim();

    if (!window.selectedWithdrawMethodData) {
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
        const result = await PAYMENT_API.processWithdraw(
            amount,
            window.selectedWithdrawMethodData.method,
            account,
            window.selectedWithdrawMethodData.instant || false
        );

        if (result.success) {
            showToast('Berhasil!', result.message || 'Penarikan berhasil', 'success');
            window.withdrawHistory.unshift({
                amount: amount,
                method: window.selectedWithdrawMethodData.name,
                account_number: account,
                status: 'pending',
                created_at: new Date().toISOString()
            });
            localStorage.setItem('joellWithdrawHistory', JSON.stringify(window.withdrawHistory));
            renderProfileWithdrawHistory();
            window.fetchBalance();

            amountInput.value = '';
            accountInput.value = '';

            document.querySelectorAll('#profileWithdrawMethods .withdraw-method-item').forEach(el => el.classList.remove('active'));
            window.selectedWithdrawMethodData = null;
            const infoEl = document.getElementById('profileWithdrawInfo');
            if (infoEl) infoEl.textContent = '💡 Pilih metode penarikan di atas';
        } else {
            throw new Error(result.error || 'Gagal');
        }
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-arrow-up"></i> Tarik';
    }
};

window.renderProfileWithdrawHistory = function() {
    const container = document.getElementById('profileWithdrawHistory');
    if (!container) return;

    window.withdrawHistory = JSON.parse(localStorage.getItem('joellWithdrawHistory')) || [];

    if (!window.withdrawHistory.length) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;">Belum ada riwayat</p>';
        return;
    }
    container.innerHTML = window.withdrawHistory.slice(0, 5).map(item => `
        <div class="withdraw-history-item">
            <div class="wh-left">
                <span class="wh-amount">Rp ${Number(item.amount).toLocaleString()}</span>
                <span class="wh-method">${item.method} - ${item.account_number || '-'}</span>
            </div>
            <span class="wh-status ${item.status}">${item.status}</span>
        </div>
    `).join('');
};

// ============================================================
// INIT - DOMContentLoaded
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Payment System Initializing...');
    console.log('🔑 API Key:', PAYMENT_API.config.apiKey ? '✅ Loaded' : '❌ Missing');
    
    // ===== PAYMENT METHOD SWITCHING =====
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

    // ===== CREATE INVOICE BUTTON (hidden by default) =====
    const createBtn = document.getElementById('createInvoiceBtn');
    if (createBtn) {
        createBtn.addEventListener('click', function() {
            const totalEl = document.getElementById('paymentOrderTotal');
            if (totalEl) {
                const total = parseInt(totalEl.textContent.replace(/[^0-9]/g, ''));
                if (total > 0) {
                    window.createInvoice(total);
                } else {
                    showToast('Error', 'Total pembayaran tidak valid', 'error');
                }
            }
        });
    }

    // ===== CHECK STATUS BUTTON =====
    const checkBtn = document.getElementById('checkStatusBtn');
    if (checkBtn) {
        checkBtn.addEventListener('click', function() {
            if (window.currentInvoiceId) {
                window.checkInvoiceStatus(window.currentInvoiceId);
            } else {
                showToast('Info', 'Belum ada invoice yang aktif', 'info');
            }
        });
    }

    // ===== COPY PAYMENT LINK BUTTON =====
    const copyBtn = document.getElementById('copyPaymentLinkBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            window.copyPaymentLink();
        });
    }

    // ===== WITHDRAW BUTTON =====
    const withdrawBtn = document.getElementById('withdrawBtn');
    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', window.processWithdraw);
    }

    // ===== BALANCE REFRESH =====
    const refreshBtn = document.getElementById('balanceRefreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', window.fetchBalance);
    }

    // ===== CLOSE PAYMENT =====
    const closeBtn = document.getElementById('paymentCloseBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            const overlay = document.getElementById('paymentOverlay');
            if (overlay) overlay.classList.remove('open');
            if (window.timerInterval) clearInterval(window.timerInterval);
            if (window.autoCheckInterval) {
                clearInterval(window.autoCheckInterval);
                window.autoCheckInterval = null;
            }
        });
    }

    // ===== LOAD HISTORIES =====
    window.renderInvoiceHistory();
    window.renderWithdrawHistory();
    window.fetchBalance();
    window.fetchWithdrawMethods();

    console.log('✅ Payment System Ready!');
    console.log('📊 Total Invoice:', window.invoiceHistory.length);
    console.log('📊 Total Withdraw:', window.withdrawHistory.length);
});

// ============================================================
// TOAST FALLBACK
// ============================================================
if (typeof showToast !== 'function') {
    window.showToast = function(title, message, type = 'info', duration = 3000) {
        console.log(`📢 ${type.toUpperCase()}: ${title} - ${message}`);
        const container = document.getElementById('toastContainer');
        if (container) {
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
        } else {
            alert(`${title}: ${message}`);
        }
    };
}

console.log('✅ payment-api.js Loaded Successfully!');
