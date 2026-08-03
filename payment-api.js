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

// Export untuk digunakan
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PAYMENT_API;
}