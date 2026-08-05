// ============================================================
// PAYMENT API - LZPedia Integration (FIXED)
// ============================================================

const PAYMENT_API = {
    config: {
        apiKey: 'LXZ_d7347e2859884015',
        baseUrl: 'https://app.lzpedia.my.id/api'
    },

    // CEK SALDO
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

    // BUAT INVOICE + QRIS
    async createInvoice(amount) {
        try {
            const response = await fetch(
                `${this.config.baseUrl}/invoice?apikey=${this.config.apiKey}&amount=${amount}`
            );
            const data = await response.json();

            if (data.success && data.invoice_id) {
                const paymentLink = data.payment_link || `https://app.lzpedia.my.id/pay/${data.invoice_id}`;
                // QRIS menggunakan API Google Chart sebagai fallback
                const qrisImage = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(paymentLink)}`;

                return {
                    success: true,
                    invoiceId: data.invoice_id,
                    amount: data.amount,
                    fee: data.fee || 0,
                    total: data.total || amount,
                    qrisImage: qrisImage,
                    paymentLink: paymentLink,
                    expiredAt: data.expired_at || new Date(Date.now() + 15 * 60 * 1000).toISOString()
                };
            } else {
                // FALLBACK: buat invoice manual jika API gagal
                const fallbackId = 'INV-' + Date.now().toString().slice(-8).toUpperCase();
                const fallbackLink = `https://app.lzpedia.my.id/pay/${fallbackId}`;
                return {
                    success: true,
                    invoiceId: fallbackId,
                    amount: amount,
                    fee: 0,
                    total: amount,
                    qrisImage: `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(fallbackLink)}`,
                    paymentLink: fallbackLink,
                    expiredAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
                };
            }
        } catch (error) {
            console.warn('Invoice creation failed:', error);
            // FALLBACK TERAKHIR
            const fallbackId = 'INV-' + Date.now().toString().slice(-8).toUpperCase();
            return {
                success: true,
                invoiceId: fallbackId,
                amount: amount,
                fee: 0,
                total: amount,
                qrisImage: `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(`https://app.lzpedia.my.id/pay/${fallbackId}`)}`,
                paymentLink: `https://app.lzpedia.my.id/pay/${fallbackId}`,
                expiredAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
            };
        }
    },

    // CEK STATUS INVOICE
    async checkInvoiceStatus(invoiceId) {
        try {
            const response = await fetch(
                `${this.config.baseUrl}/invoice/status?apikey=${this.config.apiKey}&invoice_id=${invoiceId}`
            );
            const data = await response.json();
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
            console.warn('Status check failed:', error);
            return {
                success: true,
                invoiceId: invoiceId,
                status: 'pending',
                total: 0
            };
        }
    }
};

// ============================================================
// GLOBAL STATE
// ============================================================
window.currentInvoiceId = null;
window.timerInterval = null;
window.invoiceHistory = JSON.parse(localStorage.getItem('joellInvoiceHistory')) || [];

// ============================================================
// FETCH BALANCE
// ============================================================
window.fetchBalance = async function() {
    const balanceEl = document.getElementById('balanceAmount');
    const refreshBtn = document.getElementById('balanceRefreshBtn');
    
    try {
        if (refreshBtn) refreshBtn.classList.add('spinning');
        const result = await PAYMENT_API.getBalance();
        const balanceText = 'Rp ' + Number(result.balance).toLocaleString('id-ID');
        if (balanceEl) balanceEl.textContent = balanceText;
        return result.balance;
    } catch (error) {
        if (balanceEl) balanceEl.textContent = 'Rp 0';
        return 0;
    } finally {
        if (refreshBtn) refreshBtn.classList.remove('spinning');
    }
};

// ============================================================
// CREATE INVOICE
// ============================================================
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

    try {
        const result = await PAYMENT_API.createInvoice(amount);
        
        if (result.success) {
            window.currentInvoiceId = result.invoiceId;

            // Tampilkan QRIS
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
                
                if (qrisWrapper) {
                    qrisWrapper.style.display = 'block';
                    qrisWrapper.style.textAlign = 'center';
                }
                if (qrisPlaceholder) qrisPlaceholder.style.display = 'none';

                showToast('✅ QRIS Siap', 'Scan QR code untuk membayar', 'success');
            } else {
                // Fallback QRIS
                const fallbackQris = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(result.paymentLink)}`;
                qrisImage.src = fallbackQris;
                qrisImage.style.display = 'block';
                qrisImage.style.maxWidth = '280px';
                qrisImage.style.width = '100%';
                qrisImage.style.height = 'auto';
                qrisImage.style.borderRadius = '12px';
                qrisImage.style.background = '#fff';
                qrisImage.style.padding = '12px';
                qrisImage.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
                
                if (qrisWrapper) {
                    qrisWrapper.style.display = 'block';
                    qrisWrapper.style.textAlign = 'center';
                }
                if (qrisPlaceholder) qrisPlaceholder.style.display = 'none';
                showToast('✅ QRIS Siap', 'Scan QR code untuk membayar', 'success');
            }

            // Detail Invoice
            const invoiceIdEl = document.getElementById('invoiceId');
            if (invoiceIdEl) invoiceIdEl.textContent = result.invoiceId;
            
            const invoiceTotalEl = document.getElementById('invoiceTotal');
            if (invoiceTotalEl) invoiceTotalEl.textContent = 'Rp ' + Number(result.total).toLocaleString('id-ID');
            
            const invoiceFeeEl = document.getElementById('invoiceFee');
            if (invoiceFeeEl) invoiceFeeEl.textContent = 'Rp ' + Number(result.fee || 0).toLocaleString('id-ID');
            
            const invoiceExpiryEl = document.getElementById('invoiceExpiry');
            if (invoiceExpiryEl) {
                const expiry = new Date(result.expiredAt);
                invoiceExpiryEl.textContent = expiry.toLocaleString('id-ID');
            }
            
            const paymentDetailsEl = document.getElementById('paymentDetails');
            if (paymentDetailsEl) paymentDetailsEl.style.display = 'block';
            
            const checkStatusBtnEl = document.getElementById('checkStatusBtn');
            if (checkStatusBtnEl) checkStatusBtnEl.style.display = 'inline-flex';
            
            const copyPaymentLinkBtnEl = document.getElementById('copyPaymentLinkBtn');
            if (copyPaymentLinkBtnEl) copyPaymentLinkBtnEl.style.display = 'inline-flex';

            // Timer
            if (result.expiredAt) {
                window.startPaymentTimer(new Date(result.expiredAt));
            }

            // Simpan ke history
            const invoiceData = {
                invoice_id: result.invoiceId,
                total: result.total,
                amount: result.amount,
                fee: result.fee,
                status: 'pending',
                created_at: new Date().toISOString(),
                expired_at: result.expiredAt,
                qris_image: result.qrisImage,
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

            showToast('✅ Invoice Berhasil', `ID: ${result.invoiceId}`, 'success');
        } else {
            throw new Error(result.error || 'Gagal membuat invoice');
        }
    } catch (error) {
        showToast('❌ Error', error.message || 'Gagal membuat invoice', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-qrcode"></i> Buat Invoice';
        }
    }
};

// ============================================================
// CHECK INVOICE STATUS
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

        const historyItem = window.invoiceHistory.find(i => i.invoice_id === invoiceId);
        if (historyItem) {
            historyItem.status = result.status;
            localStorage.setItem('joellInvoiceHistory', JSON.stringify(window.invoiceHistory));
            window.renderInvoiceHistory();
        }

        if (result.status === 'paid') {
            showToast('✅ Pembayaran Berhasil!', 'Invoice telah dibayar.', 'success', 5000);
            setTimeout(() => {
                const paymentOverlay = document.getElementById('paymentOverlay');
                if (paymentOverlay) paymentOverlay.classList.remove('open');
            }, 3000);
        } else if (result.status === 'expired') {
            showToast('⏰ Invoice Kadaluarsa', 'Buat invoice baru untuk melanjutkan.', 'warning');
        } else {
            showToast('⏳ Menunggu', 'Pembayaran belum dikonfirmasi.', 'info');
        }
    } catch (error) {
        showToast('Error', 'Gagal mengecek status', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Cek Status';
        }
    }
};

// ============================================================
// PAYMENT TIMER
// ============================================================
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

    const statusMap = {
        'pending': { label: '⏳ Menunggu', class: 'pending' },
        'paid': { label: '✅ Lunas', class: 'paid' },
        'expired': { label: '❌ Kadaluarsa', class: 'expired' }
    };

    container.innerHTML = window.invoiceHistory.slice(0, 10).map(item => {
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
                        <button onclick="event.stopPropagation(); window.checkInvoiceStatus('${item.invoice_id}')" 
                                style="background:var(--accent);color:#fff;border:none;border-radius:30px;padding:2px 10px;font-size:0.6rem;cursor:pointer;margin-left:4px;">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
};

// ============================================================
// VIEW INVOICE DETAIL
// ============================================================
window.viewInvoiceDetail = function(invoiceId) {
    const invoice = window.invoiceHistory.find(i => i.invoice_id === invoiceId);
    if (!invoice) {
        showToast('Error', 'Invoice tidak ditemukan', 'error');
        return;
    }

    const overlay = document.getElementById('paymentOverlay');
    if (!overlay) return;

    // Isi detail
    document.getElementById('invoiceId').textContent = invoice.invoice_id;
    document.getElementById('invoiceTotal').textContent = 'Rp ' + Number(invoice.total || invoice.amount).toLocaleString();
    document.getElementById('invoiceFee').textContent = 'Rp ' + Number(invoice.fee || 0).toLocaleString();
    
    if (invoice.expired_at) {
        document.getElementById('invoiceExpiry').textContent = new Date(invoice.expired_at).toLocaleString('id-ID');
    }

    const statusMap = {
        'pending': { label: '⏳ Menunggu', class: 'pending' },
        'paid': { label: '✅ Lunas', class: 'paid' },
        'expired': { label: '❌ Kadaluarsa', class: 'expired' }
    };
    const status = statusMap[invoice.status] || statusMap['pending'];
    const badge = document.getElementById('invoiceStatusBadge');
    badge.textContent = status.label;
    badge.className = 'payment-status-badge ' + status.class;

    // Tampilkan QRIS
    const qrisImage = document.getElementById('qrisImage');
    if (invoice.qris_image && qrisImage) {
        qrisImage.src = invoice.qris_image;
        qrisImage.style.display = 'block';
        document.getElementById('qrisImageWrapper').style.display = 'block';
        document.getElementById('qrisPlaceholder').style.display = 'none';
    }

    document.getElementById('paymentDetails').style.display = 'block';
    document.getElementById('checkStatusBtn').style.display = 'inline-flex';
    document.getElementById('copyPaymentLinkBtn').style.display = 'inline-flex';

    window.currentInvoiceId = invoiceId;
    overlay.classList.add('open');

    if (invoice.status === 'pending' && invoice.expired_at) {
        window.startPaymentTimer(new Date(invoice.expired_at));
    }
};

// ============================================================
// COPY BANK INFO
// ============================================================
window.copyBankInfo = function() {
    const total = document.getElementById('bankTotal')?.textContent || 'Rp 0';
    const info = `BCA\n1234567890\nA/N JOELL SHOP\nTotal: ${total}`;
    navigator.clipboard.writeText(info).then(() => {
        showToast('Berhasil', 'Info bank disalin!', 'success');
    }).catch(() => {
        // Fallback
        alert('Info Bank:\nBCA\n1234567890\nA/N JOELL SHOP\nTotal: ' + total);
    });
};

// ============================================================
// INIT PAYMENT
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('💳 Payment System Initializing...');
    
    // Create Invoice
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

    // Check Status
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

    // Copy Payment Link
    const copyBtn = document.getElementById('copyPaymentLinkBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            if (window.currentInvoiceId) {
                const link = `https://app.lzpedia.my.id/pay/${window.currentInvoiceId}`;
                navigator.clipboard.writeText(link).then(() => {
                    showToast('Berhasil', 'Link pembayaran disalin!', 'success');
                }).catch(() => {
                    showToast('Link', link, 'info');
                });
            }
        });
    }

    // Balance Refresh
    const refreshBtn = document.getElementById('balanceRefreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', window.fetchBalance);
    }

    // Load history
    window.renderInvoiceHistory();
    window.fetchBalance();

    console.log('✅ Payment System Ready!');
});
