// KIS API Configuration
export const kisConfig = {
    appKey: import.meta.env.VITE_KIS_APP_KEY || '',
    appSecret: import.meta.env.VITE_KIS_APP_SECRET || '',
    accountNo: import.meta.env.VITE_KIS_ACCOUNT_NO || '',
    environment: (import.meta.env.VITE_KIS_ENVIRONMENT || 'virtual') as 'real' | 'virtual',
};

// API Base URLs
export const KIS_API_BASE_URL = kisConfig.environment === 'real'
    ? 'https://openapi.koreainvestment.com:9443'
    : 'https://openapivts.koreainvestment.com:29443';

// Check if KIS API is configured
export const isKisConfigured = (): boolean => {
    return !!(kisConfig.appKey && kisConfig.appSecret && !kisConfig.appKey.includes('your_'));
};
