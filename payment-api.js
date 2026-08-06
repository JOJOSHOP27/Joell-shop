// ============================================================
// PAYMENT API - LZPedia Integration (Fallback)
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
            return { success: true, balance: data.balance || 0 };
        } catch (error) {
            return { success: false, balance: 0 };
        }
    },
    async createInvoice(amount) {
        try {
            const response = await fetch(`${this.config.baseUrl}/invoice?apikey=${this.config.apiKey}&amount=${amount}`);
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
                    qrisImage,
                    paymentLink,
                    expiredAt: data.expired_at
                };
            }
            return { success: false };
        } catch (error) {
            return { success: false };
        }
    },
    async checkInvoiceStatus(invoiceId) {
        try {
            const response = await fetch(`${this.config.baseUrl}/invoice/status?apikey=${this.config.apiKey}&invoice_id=${invoiceId}`);
            const data = await response.json();
            return { success: true, invoiceId: data.invoice_id, status: data.status || 'pending' };
        } catch (error) {
            return { success: false };
        }
    }
};
