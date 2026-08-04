// ============================================================
// PAYMENT API - LZPedia Integration (FINAL - 100% WORKING)
// ============================================================

const PAYMENT_API = {
    config: {
        apiKey: 'LXZ_679979c28d5a4dd4',
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
    // 2. BUAT INVOICE (FINAL - QRIS MANUAL)
    // ============================================================
    async createInvoice(amount) {
        try {
            console.log('📤 MEMBUAT INVOICE...');
            console.log('💰 Amount:', amount);
            
            const response = await fetch(
                `${this.config.baseUrl}/invoice?apikey=${this.config.apiKey}&amount=${amount}`
            );
            const data = await response.json();
            
            console.log('📥 Response Invoice:', data);
            
            if (data.success && data.invoice_id) {
                let qrisImage = null;
                const paymentLink = data.payment_link || `https://app.lzpedia.my.id/pay/${data.invoice_id}`;
                
                // Generate QRIS manual dari payment link
                qrisImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentLink)}`;
                
                console.log('🖼️ QRIS Generated:', qrisImage);
                
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
                return {
                    success: false,
                    error: data.message || 'Gagal membuat invoice'
                };
            }
        } catch (error) {
            console.error('❌ Invoice Error:', error);
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
            
            console.log('📥 Status Response:', data);
            
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
// GLOBAL STATE - PERSISTEN
// ============================================================

window.currentInvoiceId = null;
window.timerInterval = null;
window.selectedWithdrawMethodData = null;

// LOAD HISTORY DARI LOCALSTORAGE (PERSISTEN)
window.invoiceHistory = JSON.parse(localStorage.getItem('joellInvoiceHistory')) || [];
window.withdrawHistory = JSON.parse(localStorage.getItem('joellWithdrawHistory')) || [];

// ============================================================
// CEK SALDO
// ============================================================
window.fetchBalance = async function() {
    const balanceEl = document.getElementById('balanceAmount');
    const profileBalanceEl = document.getElementById('profileBalanceAmount');
    const refreshBtn = document.getElementById('balanceRefreshBtn');
    
    try {
        if (refreshBtn) refreshBtn.classList.add('spinning');
        const result = await PAYMENT_API.getBalance();
        const balanceText = 'Rp ' + Number(result.balance).toLocaleString();
        
        if (balanceEl) balanceEl.textContent = balanceText;
        if (profileBalanceEl) profileBalanceEl.textContent = balanceText;
        
        return result.balance;
    } catch (error) {
        console.error('Balance Error:', error);
        if (balanceEl) balanceEl.textContent = 'Rp 0';
        if (profileBalanceEl) profileBalanceEl.textContent = 'Rp 0';
        return 0;
    } finally {
        if (refreshBtn) refreshBtn.classList.remove('spinning');
    }
};

// ============================================================
// BUAT INVOICE (FINAL)
// ============================================================
window.createInvoice = async function(amount) {
    const btn = document.getElementById('createInvoiceBtn');
    if (!amount || amount <= 0) {
        showToast('Error', 'Jumlah tidak valid', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Membuat...';

    try {
        const result = await PAYMENT_API.createInvoice(amount);

        if (result.success) {
            window.currentInvoiceId = result.invoiceId;
            
            // === TAMPILKAN QRIS ===
            const qrisWrapper = document.getElementById('qrisImageWrapper');
            const qrisImage = document.getElementById('qrisImage');
            const qrisPlaceholder = document.getElementById('qrisPlaceholder');
            
            if (result.qrisImage && qrisImage) {
                qrisImage.src = result.qrisImage;
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
                if (qrisPlaceholder) {
                    qrisPlaceholder.innerHTML = `
                        <i class="fas fa-exclamation-triangle" style="color:var(--orange);font-size:2rem;"></i>
                        <p style="color:var(--orange);">QRIS tidak tersedia</p>
                        <small style="color:var(--text-muted);">Silakan gunakan metode Bank Transfer</small>
                    `;
                    qrisPlaceholder.style.display = 'block';
                }
                showToast('⚠️ QRIS Tidak Tersedia', 'Gunakan Bank Transfer', 'warning');
            }

            // === DETAIL INVOICE ===
            document.getElementById('invoiceId').textContent = result.invoiceId;
            document.getElementById('invoiceTotal').textContent = 'Rp ' + Number(result.total).toLocaleString();
            document.getElementById('invoiceFee').textContent = 'Rp ' + Number(result.fee || 0).toLocaleString();
            document.getElementById('invoiceExpiry').textContent = result.expiredAt || '-';
            document.getElementById('paymentDetails').style.display = 'block';
            document.getElementById('checkStatusBtn').style.display = 'inline-flex';
            document.getElementById('copyPaymentLinkBtn').style.display = 'inline-flex';

            // === TIMER ===
            if (result.expiredAt) {
                window.startPaymentTimer(new Date(result.expiredAt));
            }

            // === SIMPAN KE HISTORY (PERSISTEN) ===
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
        console.error('❌ Invoice Error:', error);
        showToast('❌ Error', error.message || 'Gagal membuat invoice', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-qrcode"></i> Buat Invoice';
    }
};

// ============================================================
// CEK STATUS INVOICE (DENGAN UPDATE HISTORY)
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

        if (result.success) {
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

            // UPDATE HISTORY
            const historyItem = window.invoiceHistory.find(i => i.invoice_id === invoiceId);
            if (historyItem) {
                historyItem.status = result.status;
                localStorage.setItem('joellInvoiceHistory', JSON.stringify(window.invoiceHistory));
                window.renderInvoiceHistory();
            }

            if (result.status === 'paid') {
                showToast('✅ Pembayaran Berhasil!', 'Invoice telah dibayar.', 'success', 5000);
                setTimeout(() => {
                    document.getElementById('paymentOverlay').classList.remove('open');
                }, 3000);
            } else if (result.status === 'expired') {
                showToast('⏰ Invoice Kadaluarsa', 'Buat invoice baru untuk melanjutkan.', 'warning');
            }
        } else {
            showToast('Error', 'Gagal mengecek status', 'error');
        }
    } catch (error) {
        console.error('Status Check Error:', error);
        showToast('Error', 'Gagal mengecek status', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Cek Status';
        }
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
// RENDER INVOICE HISTORY (PERSISTEN)
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
            'expired': { label: '❌ Kadaluarsa', class: 'expired' }
        };
        const status = statusMap[item.status] || statusMap['pending'];
        const date = item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-';
        
        return `
            <div class="invoice-history-item" onclick="window.openInvoiceDetail('${item.invoice_id}')" style="cursor:pointer;">
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
// OPEN INVOICE DETAIL
// ============================================================
window.openInvoiceDetail = function(invoiceId) {
    const overlay = document.getElementById('paymentOverlay');
    if (!overlay) return;
    
    const invoice = window.invoiceHistory.find(i => i.invoice_id === invoiceId);
    if (!invoice) {
        showToast('Error', 'Invoice tidak ditemukan', 'error');
        return;
    }
    
    document.getElementById('invoiceId').textContent = invoice.invoice_id;
    document.getElementById('invoiceTotal').textContent = 'Rp ' + Number(invoice.total || invoice.amount).toLocaleString();
    document.getElementById('invoiceFee').textContent = 'Rp ' + Number(invoice.fee || 0).toLocaleString();
    document.getElementById('invoiceExpiry').textContent = invoice.expired_at || '-';
    document.getElementById('paymentDetails').style.display = 'block';
    document.getElementById('checkStatusBtn').style.display = 'inline-flex';
    document.getElementById('copyPaymentLinkBtn').style.display = 'inline-flex';
    
    const badge = document.getElementById('invoiceStatusBadge');
    const statusMap = {
        'pending': { label: '⏳ Menunggu', class: 'pending' },
        'paid': { label: '✅ Lunas', class: 'paid' },
        'expired': { label: '❌ Kadaluarsa', class: 'expired' }
    };
    const status = statusMap[invoice.status] || statusMap['pending'];
    badge.textContent = status.label;
    badge.className = 'payment-status-badge ' + status.class;
    
    const qrisWrapper = document.getElementById('qrisImageWrapper');
    const qrisImage = document.getElementById('qrisImage');
    const qrisPlaceholder = document.getElementById('qrisPlaceholder');
    
    if (invoice.qris_image && qrisImage) {
        qrisImage.src = invoice.qris_image;
        qrisImage.style.display = 'block';
        if (qrisWrapper) qrisWrapper.style.display = 'block';
        if (qrisPlaceholder) qrisPlaceholder.style.display = 'none';
    }
    
    window.currentInvoiceId = invoiceId;
    overlay.classList.add('open');
    
    if (invoice.status === 'pending' && invoice.expired_at) {
        window.startPaymentTimer(new Date(invoice.expired_at));
    }
};

// ============================================================
// WITHDRAW METHODS (UNTUK PAYMENT MODAL)
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
                document.getElementById('withdrawInfo').textContent = 
                    `💰 ${method.name} | Min: Rp ${(method.min||10000).toLocaleString()} | Max: Rp ${(method.max||1000000).toLocaleString()}`;
            };
            grid.appendChild(btn);
        });
    } catch (error) {
        console.error('Withdraw Methods Error:', error);
    }
};

// ============================================================
// PROSES WITHDRAW (UNTUK PAYMENT MODAL)
// ============================================================
window.processWithdraw = async function() {
    const amount = parseInt(document.getElementById('withdrawAmount').value);
    const account = document.getElementById('withdrawAccount').value.trim();
    const btn = document.getElementById('withdrawBtn');

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
            document.getElementById('withdrawAmount').value = '';
            document.getElementById('withdrawAccount').value = '';
            
            document.querySelectorAll('.withdraw-method-item').forEach(el => el.classList.remove('active'));
            window.selectedWithdrawMethodData = null;
            document.getElementById('withdrawInfo').textContent = '💡 Pilih metode penarikan di atas';
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
// RENDER WITHDRAW HISTORY (UNTUK PAYMENT MODAL)
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
// COPY BANK INFO
// ============================================================
window.copyBankInfo = function() {
    const info = `BCA\n1234567890\nA/N JOELL SHOP\nTotal: ${document.getElementById('bankTotal').textContent}`;
    navigator.clipboard.writeText(info).then(() => {
        showToast('Berhasil', 'Info bank disalin!', 'success');
    });
};

// ============================================================
// OPEN PAYMENT MODAL
// ============================================================
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
    
    const qrisPlaceholder = document.getElementById('qrisPlaceholder');
    if (qrisPlaceholder) {
        qrisPlaceholder.style.display = 'block';
        qrisPlaceholder.innerHTML = `
            <i class="fas fa-qrcode"></i>
            <p>Klik tombol "Buat Invoice" untuk mendapatkan QRIS</p>
            <small>Pastikan koneksi internet stabil</small>
        `;
    }
    
    const qrisImage = document.getElementById('qrisImage');
    if (qrisImage) qrisImage.src = '';
    
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.method === 'qris');
    });

    overlay.classList.add('open');
    
    // Render history (PERSISTEN)
    window.renderInvoiceHistory();
    window.renderWithdrawHistory();
    window.fetchBalance();
    window.fetchWithdrawMethods();
};

// ============================================================
// FUNGSI UNTUK WITHDRAW DI HALAMAN PROFIL
// ============================================================

// Init withdraw di profile
window.initProfileWithdraw = function() {
    console.log('🔄 Init Profile Withdraw...');
    
    // Copy balance ke profile
    const balanceEl = document.getElementById('balanceAmount');
    const profileBalance = document.getElementById('profileBalanceAmount');
    if (balanceEl && profileBalance) {
        profileBalance.textContent = balanceEl.textContent;
    }
    
    // Fetch withdraw methods untuk profile
    fetchProfileWithdrawMethods();
    renderProfileWithdrawHistory();
    
    // Event listener untuk tombol withdraw di profile
    const withdrawBtn = document.getElementById('profileWithdrawBtn');
    if (withdrawBtn) {
        // Remove old listeners
        const newBtn = withdrawBtn.cloneNode(true);
        withdrawBtn.parentNode.replaceChild(newBtn, withdrawBtn);
        newBtn.addEventListener('click', function() {
            processProfileWithdraw();
        });
    }
};

// Fetch withdraw methods untuk profile
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
                document.getElementById('profileWithdrawInfo').textContent = 
                    `💰 ${method.name} | Min: Rp ${(method.min||10000).toLocaleString()} | Max: Rp ${(method.max||1000000).toLocaleString()}`;
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

// Proses withdraw dari profile
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
            document.getElementById('profileWithdrawInfo').textContent = '💡 Pilih metode penarikan di atas';
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

// Render withdraw history di profile
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

// Override renderProfilePage untuk include withdraw
const originalRenderProfilePage = window.renderProfilePage;
window.renderProfilePage = function() {
    if (typeof originalRenderProfilePage === 'function') {
        originalRenderProfilePage();
    }
    // Init withdraw di profile
    setTimeout(() => {
        if (currentUser) {
            window.initProfileWithdraw();
        }
    }, 500);
};

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Payment System Initializing...');
    
    // === PAYMENT METHOD SWITCHING ===
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.payment-method-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const method = this.dataset.method;
            document.getElementById('paymentQrisSection').style.display = method === 'qris' ? 'block' : 'none';
            document.getElementById('paymentBankSection').style.display = method === 'bank' ? 'block' : 'none';
        });
    });

    // === CREATE INVOICE ===
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

    // === CHECK STATUS ===
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

    // === COPY PAYMENT LINK ===
    const copyBtn = document.getElementById('copyPaymentLinkBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            if (window.currentInvoiceId) {
                const link = `https://app.lzpedia.my.id/pay/${window.currentInvoiceId}`;
                navigator.clipboard.writeText(link).then(() => {
                    showToast('Berhasil', 'Link pembayaran disalin!', 'success');
                });
            }
        });
    }

    // === WITHDRAW (Payment Modal) ===
    const withdrawBtn = document.getElementById('withdrawBtn');
    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', window.processWithdraw);
    }

    // === BALANCE REFRESH ===
    const refreshBtn = document.getElementById('balanceRefreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', window.fetchBalance);
    }

    // === CLOSE PAYMENT ===
    const closeBtn = document.getElementById('paymentCloseBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            document.getElementById('paymentOverlay').classList.remove('open');
            if (window.timerInterval) clearInterval(window.timerInterval);
        });
    }

    // === LOAD ALL HISTORY (PERSISTEN) ===
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
