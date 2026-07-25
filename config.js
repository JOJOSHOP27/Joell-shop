// ============================================================
//  NANZ SHOP - CONFIGURATION FILE
//  WARNING: Pindahkan ke server-side atau enkripsi untuk production!
// ============================================================

// --- Google OAuth Client ID ---
const GOOGLE_CLIENT_ID = "598453625335-uj2bv61q9cd3pe94396ruqfma2kfo4jo.apps.googleusercontent.com";

// --- Admin Password (GANTI SEBELUM DEPLOY!) ---
const ADMIN_PASSWORD = "nanzadmin2026";

// --- API Keys ---
const IMGUR_CLIENT_ID = "546c25a59c58ad7";
const OSINT_API_KEY = "a306d58d00msh5264c55372d6410p14feb6jsn101a605f6cd6";

// --- Screenshot Machine API Key ---
const SSMACHINE_KEY = "14d2e6";

// --- Flash Sale Config ---
const FLASH_SALE_END = new Date(Date.now() + 4 * 3600 * 1000 + 32 * 60000 + 15 * 1000);

// --- Promo Codes ---
const PROMO_CODES = {
    'NANZ50': { discount: 0.5, type: 'percent', max: 50000, desc: 'Diskon 50%' },
    'WELCOME': { discount: 10000, type: 'fixed', desc: 'Potongan Rp 10.000' },
    'FLASH25': { discount: 0.25, type: 'percent', max: 25000, desc: 'Diskon 25%' }
};

// --- Firebase Config (Obfuscated Base64) ---
const _0x4f2a = [
    "QUl6YVN5RG9HNkdQQkRVUnZCQ3piT09TQ1FMSmtucnVGeXM0WEV3",
    "am9lbGwtc2hvcC1kYjNhNi5maXJlYmFzZWFwcC5jb20=",
    "am9lbGwtc2hvcC1kYjNhNg==",
    "am9lbGwtc2hvcC1kYjNhNi5maXJlYmFzZXN0b3JhZ2UuYXBw",
    "MTAxNjIzOTA2NjI0MA==",
    "MToxMDE2MjM5MDY2MjQwOndlYjoxODk4ZWM4MGU4OWU0NTg3MjRhYTY1",
    "aHR0cHM6Ly9qb2VsbC1zaG9wLWRiM2E2LWRlZmF1bHQtcnRkYi5hc2lhLXNvdXRoZWFzdDEuZmlyZWJhc2VkYXRhYmFzZS5hcHAv"
];

const firebaseConfig = {
    apiKey: atob(_0x4f2a[0]),
    authDomain: atob(_0x4f2a[1]),
    projectId: atob(_0x4f2a[2]),
    storageBucket: atob(_0x4f2a[3]),
    messagingSenderId: atob(_0x4f2a[4]),
    appId: atob(_0x4f2a[5]),
    databaseURL: atob(_0x4f2a[6])
};

// --- Main App Config (built from constants above) ---
const CONFIG = {
    flashSaleEnd: FLASH_SALE_END,
    promoCodes: PROMO_CODES,
    imgurClientId: IMGUR_CLIENT_ID,
    osintApiKey: OSINT_API_KEY,
    adminPassword: ADMIN_PASSWORD,
    ssMachineKey: SSMACHINE_KEY,
    googleClientId: GOOGLE_CLIENT_ID
};
