// ============================================================
// PAYMENT API - LZPedia Integration (FIXED v3.0 - Privacy Focused)
// API Key: LXZ_6d2cebe4c33643b0
// ============================================================

const PAYMENT_API = {
    config: {
        apiKey: 'LXZ_6d2cebe4c33643b0',
        baseUrl: 'https://app.lzpedia.my.id/api'
    },

    // 1. BUAT INVOICE
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

    // 2. CEK STATUS INVOICE
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
    }
};

// ============================================================
// GLOBAL STATE
// ============================================================

window.currentInvoiceId = null;
window.timerInterval = null;
window.autoCheckInterval = null;

// Get current user for privacy
function getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem('joellUser') || '{}');
    return user.id || 'guest_' + (localStorage.getItem('joellGuestId') || generateGuestId());
}

function generateGuestId() {
    const id = 'guest_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('joellGuestId', id);
    return id;
}

// Invoice history key per user
function getInvoiceHistoryKey() {
    return 'joellInvoiceHistory_' + getCurrentUserId();
}

function getInvoiceHistory() {
    return JSON.parse(localStorage.getItem(getInvoiceHistoryKey()) || '[]');
}

function setInvoiceHistory(history) {
    localStorage.setItem(getInvoiceHistoryKey(), JSON.stringify(history));
}

// ============================================================
// GENERATE FALLBACK QRIS
// ============================================================
window.generateFallbackQris = function(text) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(text)}`;
};

// ============================================================
// BUAT INVOICE - QRIS LANGSUNG TAMPIL (FIXED v3.0)
// ============================================================
window.createInvoice = async function(amount) {
    const qrisPlaceholder = document.getElementById('qrisPlaceholder');
    const qrisWrapper = document.getElementById('qrisImageWrapper');
    const qrisImage = document.getElementById('qrisImage');
    const createBtn = document.getElementById('createInvoiceBtn');

    if (!amount || amount <= 0) {
        showToast('Error', 'Jumlah tidak valid', 'error');
        return;
    }

    // TAMPILKAN LOADING
    if (qrisPlaceholder) {
        qrisPlaceholder.style.display = 'flex';
        qrisPlaceholder.innerHTML = `
            <div style="text-align:center;">
                <i class="fas fa-spinner fa-spin" style="font-size:2.5rem;color:var(--accent-light);display:block;margin-bottom:12px;"></i>
                <p style="font-weight:700;font-size:1rem;margin-bottom:4px;">Membuat invoice...</p>
                <small style="color:var(--text-muted);">Mohon tunggu sebentar</small>
            </div>
        `;
    }
    if (qrisWrapper) qrisWrapper.style.display = 'none';
    if (createBtn) createBtn.style.display = 'none';

    try {
        const result = await PAYMENT_API.createInvoice(amount);
        console.log('📄 Create Invoice Result:', result);

        if (result.success && result.invoiceId) {
            window.currentInvoiceId = result.invoiceId;

            // PAYMENT LINK
            const paymentLink = result.paymentLink || `https://app.lzpedia.my.id/pay/${result.invoiceId}`;

            // PILIH QRIS SOURCE
            let qrisSrc = result.qrisImage || window.generateFallbackQris(paymentLink);

            // TAMPILKAN QRIS
            if (qrisImage) {
                qrisImage.src = qrisSrc;
                qrisImage.style.display = 'block';
                qrisImage.style.maxWidth = '280px';
                qrisImage.style.width = '100%';
                qrisImage.style.height = 'auto';
                qrisImage.style.borderRadius = '16px';
                qrisImage.style.background = '#ffffff';
                qrisImage.style.padding = '16px';
                qrisImage.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
                qrisImage.style.border = '2px solid #e5e7eb';
                qrisImage.style.margin = '0 auto';

                qrisImage.onerror = function() {
                    this.style.display = 'none';
                    if (qrisPlaceholder) {
                        qrisPlaceholder.style.display = 'flex';
                        qrisPlaceholder.innerHTML = `
                            <div style="text-align:center;">
                                <i class="fas fa-exclamation-triangle" style="font-size:2.5rem;color:var(--orange);display:block;margin-bottom:12px;"></i>
                                <p style="font-weight:600;margin-bottom:8px;">Gagal memuat QRIS</p>
                                <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:12px;">Gunakan link pembayaran di bawah</p>
                                <button onclick="window.regenerateQris()" style="padding:10px 20px;background:var(--accent);color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;">
                                    <i class="fas fa-redo"></i> Muat Ulang QRIS
                                </button>
                            </div>
                        `;
                    }
                };
            }

            if (qrisWrapper) {
                qrisWrapper.style.display = 'block';
                qrisWrapper.style.textAlign = 'center';
            }
            if (qrisPlaceholder) qrisPlaceholder.style.display = 'none';

            // TEKS SUKSES
            const successText = document.querySelector('.qris-success-text');
            if (successText) {
                successText.style.display = 'block';
                successText.innerHTML = `<i class="fas fa-check-circle"></i> Scan QRIS untuk membayar`;
            }

            // DETAIL INVOICE
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

            // TIMER
            const expiryDate = result.expiredAt ? new Date(result.expiredAt) : new Date(Date.now() + 15 * 60000);
            window.startPaymentTimer(expiryDate);

            // AUTO CHECK STATUS
            window.startAutoCheckStatus(result.invoiceId);

            // SIMPAN KE HISTORY (PRIVASI PER USER)
            const invoiceData = {
                invoice_id: result.invoiceId,
                total: result.total,
                amount: result.amount,
                fee: result.fee,
                status: 'pending',
                created_at: new Date().toISOString(),
                expired_at: expiryDate.toISOString(),
                qris_image: result.qrisImage || null,
                payment_link: paymentLink
            };

            let history = getInvoiceHistory();
            const existingIndex = history.findIndex(i => i.invoice_id === result.invoiceId);
            if (existingIndex === -1) {
                history.unshift(invoiceData);
            } else {
                history[existingIndex] = invoiceData;
            }
            setInvoiceHistory(history);
            window.renderInvoiceHistory();

            showToast('✅ Invoice Siap', `ID: ${result.invoiceId}`, 'success');

        } else {
            throw new Error(result.error || 'Gagal membuat invoice');
        }
    } catch (error) {
        console.error('❌ Create Invoice Error:', error);
        showToast('❌ Error', error.message || 'Gagal membuat invoice', 'error');

        // FALLBACK: TOMBOL RETRY
        if (qrisPlaceholder) {
            qrisPlaceholder.style.display = 'flex';
            qrisPlaceholder.innerHTML = `
                <div style="text-align:center;">
                    <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:var(--red);display:block;margin-bottom:12px;"></i>
                    <p style="color:var(--red);font-weight:700;margin-bottom:4px;">Gagal membuat invoice</p>
                    <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:16px;">${error.message || 'Coba lagi nanti'}</p>
                    <button onclick="window.createInvoice(${amount})" style="padding:12px 28px;background:linear-gradient(135deg,var(--accent),var(--purple));color:#fff;border:none;border-radius:60px;cursor:pointer;font-weight:800;font-size:0.9rem;">
                        <i class="fas fa-redo"></i> Coba Lagi
                    </button>
                </div>
            `;
        }
        if (qrisWrapper) qrisWrapper.style.display = 'none';
        if (createBtn) {
            createBtn.style.display = 'inline-flex';
            createBtn.disabled = false;
            createBtn.innerHTML = '<i class="fas fa-qrcode"></i> Buat Invoice';
        }
    }
};

// ============================================================
// REGENERATE QRIS (Manual Fallback)
// ============================================================
window.regenerateQris = function() {
    if (!window.currentInvoiceId) {
        showToast('Error', 'Tidak ada invoice aktif', 'error');
        return;
    }
    const history = getInvoiceHistory();
    const invoice = history.find(i => i.invoice_id === window.currentInvoiceId);
    if (!invoice) {
        showToast('Error', 'Data invoice tidak ditemukan', 'error');
        return;
    }

    const qrisImage = document.getElementById('qrisImage');
    const qrisWrapper = document.getElementById('qrisImageWrapper');
    const qrisPlaceholder = document.getElementById('qrisPlaceholder');

    const paymentLink = invoice.payment_link || `https://app.lzpedia.my.id/pay/${invoice.invoice_id}`;
    const newQris = window.generateFallbackQris(paymentLink);

    if (qrisImage) {
        qrisImage.src = newQris;
        qrisImage.style.display = 'block';
    }
    if (qrisWrapper) qrisWrapper.style.display = 'block';
    if (qrisPlaceholder) qrisPlaceholder.style.display = 'none';

    showToast('QRIS Diperbarui', 'QRIS alternatif berhasil dibuat', 'success');
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

            // UPDATE HISTORY (PRIVASI PER USER)
            let history = getInvoiceHistory();
            const historyItem = history.find(i => i.invoice_id === invoiceId);
            if (historyItem) {
                historyItem.status = result.status;
                if (result.qrisImage && !historyItem.qris_image) {
                    historyItem.qris_image = result.qrisImage;
                }
                setInvoiceHistory(history);
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
                const btnCreate = document.getElementById('createInvoiceBtn');
                if (btnCreate) btnCreate.style.display = 'inline-flex';
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
    let link = '';
    if (window.currentInvoiceId) {
        const history = getInvoiceHistory();
        const invoice = history.find(i => i.invoice_id === window.currentInvoiceId);
        link = invoice?.payment_link || `https://app.lzpedia.my.id/pay/${window.currentInvoiceId}`;
    }
    if (!link) {
        showToast('Error', 'Tidak ada invoice aktif', 'error');
        return;
    }

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
            const btnCreate = document.getElementById('createInvoiceBtn');
            if (btnCreate) btnCreate.style.display = 'inline-flex';
            return;
        }
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        if (displayEl) displayEl.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        if (timerEl) timerEl.classList.remove('expired');
    }, 1000);
};

// ============================================================
// RENDER INVOICE HISTORY (PRIVASI PER USER)
// ============================================================
window.renderInvoiceHistory = function() {
    const container = document.getElementById('invoiceHistoryList');
    if (!container) return;

    const history = getInvoiceHistory();

    if (!history.length) {
        container.innerHTML = `
            <div style="text-align:center;padding:20px;color:var(--text-muted);">
                <i class="fas fa-file-invoice" style="font-size:2rem;display:block;margin-bottom:8px;opacity:0.5;"></i>
                <p>Belum ada invoice</p>
            </div>
        `;
        return;
    }

    container.innerHTML = history.slice(0, 10).map(item => {
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
            <div class="invoice-history-item" onclick="window.openInvoiceDetail('${item.invoice_id}')" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:var(--bg-primary);border-radius:8px;border:1px solid var(--border-subtle);margin-bottom:6px;transition:all 0.3s ease;">
                <div style="display:flex;flex-direction:column;gap:2px;flex:1;cursor:pointer;">
                    <span style="font-weight:700;color:var(--accent-light);font-size:0.8rem;">#${item.invoice_id}</span>
                    <span style="font-weight:700;color:var(--text-primary);font-size:0.9rem;">Rp ${Number(item.total || item.amount).toLocaleString()}</span>
                    <span style="font-size:0.65rem;color:var(--text-muted);">${date}</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                    <span style="font-weight:700;font-size:0.65rem;padding:3px 12px;border-radius:30px;background:${status.class === 'pending' ? 'rgba(251,191,36,0.15)' : status.class === 'paid' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'};color:${status.class === 'pending' ? '#fbbf24' : status.class === 'paid' ? '#10b981' : '#ef4444'};">
                        ${status.label}
                    </span>
                    ${item.status === 'pending' ? `
                        <button onclick="event.stopPropagation(); window.checkInvoiceStatus('${item.invoice_id}')" 
                                style="background:var(--accent);color:#fff;border:none;border-radius:30px;padding:4px 10px;font-size:0.6rem;cursor:pointer;">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    ` : ''}
                    <i class="fas fa-chevron-right" style="color:var(--text-muted);font-size:0.7rem;"></i>
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

    const history = getInvoiceHistory();
    const invoice = history.find(i => i.invoice_id === invoiceId);
    if (!invoice) {
        showToast('Error', 'Invoice tidak ditemukan', 'error');
        return;
    }

    console.log('📄 Opening Invoice Detail:', invoice);

    // SET DETAIL
    const invoiceIdEl = document.getElementById('invoiceId');
    if (invoiceIdEl) invoiceIdEl.textContent = invoice.invoice_id;

    const invoiceTotalEl = document.getElementById('invoiceTotal');
    if (invoiceTotalEl) invoiceTotalEl.textContent = 'Rp ' + Number(invoice.total || invoice.amount).toLocaleString();

    const invoiceFeeEl = document.getElementById('invoiceFee');
    if (invoiceFeeEl) invoiceFeeEl.textContent = 'Rp ' + Number(invoice.fee || 0).toLocaleString();

    const invoiceExpiryEl = document.getElementById('invoiceExpiry');
    if (invoiceExpiryEl) invoiceExpiryEl.textContent = invoice.expired_at ? new Date(invoice.expired_at).toLocaleString('id-ID') : '-';

    const paymentDetailsEl = document.getElementById('paymentDetails');
    if (paymentDetailsEl) paymentDetailsEl.style.display = 'block';

    const checkStatusBtnEl = document.getElementById('checkStatusBtn');
    if (checkStatusBtnEl) checkStatusBtnEl.style.display = 'inline-flex';

    const copyPaymentLinkBtnEl = document.getElementById('copyPaymentLinkBtn');
    if (copyPaymentLinkBtnEl) copyPaymentLinkBtnEl.style.display = 'inline-flex';

    // SET STATUS
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

    // TAMPILKAN QRIS
    const qrisWrapper = document.getElementById('qrisImageWrapper');
    const qrisImage = document.getElementById('qrisImage');
    const qrisPlaceholder = document.getElementById('qrisPlaceholder');

    const paymentLink = invoice.payment_link || `https://app.lzpedia.my.id/pay/${invoice.invoice_id}`;
    let qrisSrc = invoice.qris_image || window.generateFallbackQris(paymentLink);

    if (qrisImage) {
        qrisImage.src = qrisSrc;
        qrisImage.style.display = 'block';
        qrisImage.style.maxWidth = '280px';
        qrisImage.style.width = '100%';
        qrisImage.style.height = 'auto';
        qrisImage.style.borderRadius = '16px';
        qrisImage.style.background = '#ffffff';
        qrisImage.style.padding = '16px';
        qrisImage.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
        qrisImage.style.border = '2px solid #e5e7eb';
        qrisImage.style.margin = '0 auto';

        qrisImage.onerror = function() {
            this.style.display = 'none';
            if (qrisPlaceholder) {
                qrisPlaceholder.style.display = 'flex';
                qrisPlaceholder.innerHTML = `
                    <div style="text-align:center;">
                        <i class="fas fa-qrcode" style="font-size:3rem;color:var(--accent-light);display:block;margin-bottom:8px;"></i>
                        <p style="color:var(--text-primary);font-weight:600;margin-bottom:8px;">QRIS tidak dapat dimuat</p>
                        <button onclick="window.regenerateQris()" style="padding:10px 20px;background:var(--accent);color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;">
                            <i class="fas fa-redo"></i> Muat Ulang QRIS
                        </button>
                    </div>
                `;
            }
        };
    }

    if (qrisWrapper) {
        qrisWrapper.style.display = 'block';
        qrisWrapper.style.textAlign = 'center';
    }
    if (qrisPlaceholder) qrisPlaceholder.style.display = 'none';

    const successText = document.querySelector('.qris-success-text');
    if (successText) {
        successText.style.display = 'block';
        successText.innerHTML = '<i class="fas fa-check-circle"></i> Scan QRIS untuk membayar';
    }

    window.currentInvoiceId = invoiceId;
    overlay.classList.add('open');

    // START TIMER & AUTO CHECK
    if (invoice.status === 'pending' && invoice.expired_at) {
        window.startPaymentTimer(new Date(invoice.expired_at));
        window.startAutoCheckStatus(invoiceId);
    }

    // Sembunyikan tombol Buat Invoice
    const btnCreate = document.getElementById('createInvoiceBtn');
    if (btnCreate) btnCreate.style.display = 'none';
};

// ============================================================
// OPEN PAYMENT MODAL (FIXED - No Double Invocation)
// ============================================================
window.openPaymentModal = function(orderData) {
    const overlay = document.getElementById('paymentOverlay');
    if (!overlay) {
        showToast('Error', 'Modal pembayaran tidak ditemukan', 'error');
        return;
    }

    const itemsContainer = document.getElementById('paymentOrderItems');
    const totalEl = document.getElementById('paymentOrderTotal');

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

    // RESET UI
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

    // RESET QRIS PLACEHOLDER
    const qrisPlaceholder = document.getElementById('qrisPlaceholder');
    if (qrisPlaceholder) {
        qrisPlaceholder.style.display = 'flex';
        qrisPlaceholder.style.alignItems = 'center';
        qrisPlaceholder.style.justifyContent = 'center';
        qrisPlaceholder.innerHTML = `
            <div style="text-align:center;">
                <i class="fas fa-qrcode" style="font-size:3rem;color:var(--accent-light);display:block;margin-bottom:8px;"></i>
                <p style="font-weight:700;color:var(--text-primary);margin-bottom:4px;">Siap Membuat Invoice</p>
                <small style="color:var(--text-muted);display:block;">Klik tombol di bawah untuk generate QRIS</small>
            </div>
        `;
    }

    const qrisImage = document.getElementById('qrisImage');
    if (qrisImage) {
        qrisImage.src = '';
        qrisImage.style.display = 'none';
    }

    // RESET STATUS
    const statusBadge = document.getElementById('invoiceStatusBadge');
    if (statusBadge) {
        statusBadge.textContent = '⏳ Menunggu';
        statusBadge.className = 'payment-status-badge pending';
    }

    // TAMPILKAN TOMBOL BUAT INVOICE
    const btnCreate = document.getElementById('createInvoiceBtn');
    if (btnCreate) {
        btnCreate.style.display = 'inline-flex';
        btnCreate.disabled = false;
        btnCreate.innerHTML = '<i class="fas fa-qrcode"></i> Buat Invoice';
    }

    // CLEAR OLD INTERVALS
    if (window.timerInterval) clearInterval(window.timerInterval);
    if (window.autoCheckInterval) {
        clearInterval(window.autoCheckInterval);
        window.autoCheckInterval = null;
    }
    window.currentInvoiceId = null;

    // OPEN MODAL
    overlay.classList.add('open');

    // RENDER HISTORY (PRIVASI PER USER)
    window.renderInvoiceHistory();
};

// ============================================================
// INIT - DOMContentLoaded
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Payment System v3.0 Initializing...');
    console.log('🔑 API Key:', PAYMENT_API.config.apiKey ? '✅ Loaded' : '❌ Missing');

    // ===== CREATE INVOICE BUTTON =====
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

    // ===== LOAD HISTORY (PRIVASI PER USER) =====
    window.renderInvoiceHistory();

    console.log('✅ Payment System v3.0 Ready! (Privacy Mode)');
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

console.log('✅ payment-api.js v3.0 (Privacy Focused) Loaded Successfully!');
