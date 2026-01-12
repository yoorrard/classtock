import { kisConfig, KIS_API_BASE_URL, isKisConfigured } from './config';
import { StockQuote, StockDailyData, KisTokenResponse } from './types';

// Token management
let accessToken: string | null = null;
let tokenExpiry: Date | null = null;

// Get or refresh access token
async function getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
        return accessToken;
    }

    const response = await fetch(`${KIS_API_BASE_URL}/oauth2/tokenP`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
            grant_type: 'client_credentials',
            appkey: kisConfig.appKey,
            appsecret: kisConfig.appSecret,
        }),
    });

    if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`);
    }

    const data: KisTokenResponse = await response.json();
    accessToken = data.access_token;

    // Set expiry (subtract 1 hour for safety margin)
    const expiresIn = data.expires_in - 3600;
    tokenExpiry = new Date(Date.now() + expiresIn * 1000);

    return accessToken;
}

// Common headers for API requests
async function getHeaders(trId: string): Promise<HeadersInit> {
    const token = await getAccessToken();
    return {
        'Content-Type': 'application/json; charset=utf-8',
        'authorization': `Bearer ${token}`,
        'appkey': kisConfig.appKey,
        'appsecret': kisConfig.appSecret,
        'tr_id': trId,
    };
}

/**
 * Fetch current stock price
 * @param stockCode - 6-digit stock code (e.g., '005930' for Samsung Electronics)
 */
export async function fetchStockPrice(stockCode: string): Promise<StockQuote | null> {
    if (!isKisConfigured()) {
        console.warn('KIS API not configured');
        return null;
    }

    try {
        const trId = kisConfig.environment === 'real' ? 'FHKST01010100' : 'FHKST01010100';
        const headers = await getHeaders(trId);

        const params = new URLSearchParams({
            FID_COND_MRKT_DIV_CODE: 'J', // 주식
            FID_INPUT_ISCD: stockCode,
        });

        const response = await fetch(
            `${KIS_API_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price?${params}`,
            { method: 'GET', headers }
        );

        if (!response.ok) {
            throw new Error(`Price fetch failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.rt_cd !== '0') {
            throw new Error(`API error: ${data.msg1}`);
        }

        const output = data.output;
        return {
            code: stockCode,
            name: '', // Name needs to be fetched separately or from cache
            price: parseInt(output.stck_prpr, 10),
            change: parseInt(output.prdy_vrss, 10),
            changePercent: parseFloat(output.prdy_ctrt),
            volume: parseInt(output.acml_vol, 10),
            high: parseInt(output.stck_hgpr, 10),
            low: parseInt(output.stck_lwpr, 10),
            open: parseInt(output.stck_oprc, 10),
        };
    } catch (error) {
        console.error(`Failed to fetch price for ${stockCode}:`, error);
        return null;
    }
}

/**
 * Fetch multiple stock prices
 * @param stockCodes - Array of 6-digit stock codes
 */
export async function fetchMultipleStockPrices(stockCodes: string[]): Promise<Map<string, StockQuote>> {
    const results = new Map<string, StockQuote>();

    // KIS API doesn't support batch requests, so we need to fetch one by one
    // Add delay to avoid rate limiting
    for (const code of stockCodes) {
        const quote = await fetchStockPrice(code);
        if (quote) {
            results.set(code, quote);
        }
        // Small delay to avoid rate limiting (100ms between requests)
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
}

/**
 * Fetch daily price history for charts
 * @param stockCode - 6-digit stock code
 * @param days - Number of days to fetch (default: 30)
 */
export async function fetchDailyPrices(stockCode: string, days: number = 30): Promise<StockDailyData[]> {
    if (!isKisConfigured()) {
        console.warn('KIS API not configured');
        return [];
    }

    try {
        const trId = 'FHKST01010400'; // 일별 시세 조회
        const headers = await getHeaders(trId);

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const formatDate = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');

        const params = new URLSearchParams({
            FID_COND_MRKT_DIV_CODE: 'J',
            FID_INPUT_ISCD: stockCode,
            FID_INPUT_DATE_1: formatDate(startDate),
            FID_INPUT_DATE_2: formatDate(endDate),
            FID_PERIOD_DIV_CODE: 'D', // Daily
            FID_ORG_ADJ_PRC: '0', // 수정주가 미반영
        });

        const response = await fetch(
            `${KIS_API_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-price?${params}`,
            { method: 'GET', headers }
        );

        if (!response.ok) {
            throw new Error(`Daily price fetch failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.rt_cd !== '0') {
            throw new Error(`API error: ${data.msg1}`);
        }

        return data.output.map((item: {
            stck_bsop_date: string;
            stck_oprc: string;
            stck_hgpr: string;
            stck_lwpr: string;
            stck_clpr: string;
            acml_vol: string;
        }) => ({
            date: `${item.stck_bsop_date.slice(0, 4)}-${item.stck_bsop_date.slice(4, 6)}-${item.stck_bsop_date.slice(6, 8)}`,
            open: parseInt(item.stck_oprc, 10),
            high: parseInt(item.stck_hgpr, 10),
            low: parseInt(item.stck_lwpr, 10),
            close: parseInt(item.stck_clpr, 10),
            volume: parseInt(item.acml_vol, 10),
        })).reverse(); // Oldest first
    } catch (error) {
        console.error(`Failed to fetch daily prices for ${stockCode}:`, error);
        return [];
    }
}

/**
 * Check if market is open (KST 9:00 - 15:30, weekdays)
 */
export function isMarketOpen(): boolean {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const KST_OFFSET = 9 * 60 * 60 * 1000;
    const kstNow = new Date(utc + KST_OFFSET);

    const day = kstNow.getDay();
    const hours = kstNow.getHours();
    const minutes = kstNow.getMinutes();
    const time = hours * 60 + minutes;

    // Weekday check (Monday = 1, Friday = 5)
    if (day === 0 || day === 6) return false;

    // Market hours: 9:00 - 15:30 (540 - 930 minutes)
    return time >= 540 && time <= 930;
}
