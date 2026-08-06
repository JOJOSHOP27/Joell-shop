// ============================================================
// PAYMENT API - LZPedia Integration (REAL API)
// ============================================================

const PAYMENT_API = {
    config: {
        apiKey: 'LXZ_d7347e2859884015',
        baseUrl: 'https://app.lzpedia.my.id/api'
    },

    // CEK SALDO - REAL
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

    // BUAT INVOICE - REAL
    async createInvoice(amount) {
        try {
            const response = await fetch(
                `${this.config.baseUrl}/invoice?apikey=${this.config.apiKey}&amount=${amount}`
            );
            const data = await response.json();

            if (data.success && data.invoice_id) {
                const paymentLink = data.payment_link || `https://app.lzpedia.my.id/pay/${data.invoice_id}`;
                const qrisImage = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(paymentLink)}`;

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

    // CEK STATUS INVOICE - REAL
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
    }
};
