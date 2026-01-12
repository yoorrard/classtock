import { Stock } from '../types';
import { mockStockData } from '../data';
import {
    isKisConfigured,
    fetchMultipleStockPrices,
    fetchDailyPrices as kisFetchDailyPrices,
    isMarketOpen,
    StockDailyData,
} from './kis';

// Stock codes we track
const TRACKED_STOCK_CODES = [
    '005930', // 삼성전자
    '000660', // SK하이닉스
    '005380', // 현대차
    '000270', // 기아
    '373220', // LG에너지솔루션
    '096770', // SK이노베이션
    '035420', // NAVER
    '035720', // 카카오
    '207940', // 삼성바이오로직스
    '068270', // 셀트리온
    '105560', // KB금융
    '005490', // POSCO홀딩스
    '329180', // HD현대중공업
    '000720', // 현대건설
    '139480', // 이마트
    '097950', // CJ제일제당
    '003490', // 대한항공
    '017670', // SK텔레콤
    '352820', // 하이브
    '225570', // 넥슨게임즈
];

// Cache for stock data
let stockCache: Stock[] = [...mockStockData];
let lastFetchTime: number = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute cache

/**
 * Get stock data - uses KIS API if configured, otherwise returns mock data
 */
export async function getStockData(): Promise<Stock[]> {
    // If KIS API is not configured, use mock data with simulated price changes
    if (!isKisConfigured()) {
        return getSimulatedStockData();
    }

    // Check cache validity
    const now = Date.now();
    if (now - lastFetchTime < CACHE_DURATION) {
        return stockCache;
    }

    // If market is closed, return cached data (prices won't change)
    if (!isMarketOpen()) {
        return stockCache;
    }

    try {
        // Fetch real prices from KIS API
        const quotes = await fetchMultipleStockPrices(TRACKED_STOCK_CODES);

        // Update stock cache with real prices
        stockCache = mockStockData.map(stock => {
            const quote = quotes.get(stock.code);
            if (quote) {
                return {
                    ...stock,
                    price: quote.price,
                };
            }
            return stock;
        });

        lastFetchTime = now;
        return stockCache;
    } catch (error) {
        console.error('Failed to fetch stock data from KIS API:', error);
        // Return cached data on error
        return stockCache;
    }
}

/**
 * Get simulated stock data with random price changes (for demo mode)
 */
function getSimulatedStockData(): Stock[] {
    const lastUpdateKey = 'classstock_lastUpdateDate';
    const lastUpdateDateStr = localStorage.getItem(lastUpdateKey);

    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const KST_OFFSET = 9 * 60 * 60 * 1000;
    const kstNow = new Date(utc + KST_OFFSET);

    const todayKSTString = kstNow.toISOString().split('T')[0];
    const isUpdateTimePassed = kstNow.getHours() > 16 || (kstNow.getHours() === 16 && kstNow.getMinutes() >= 10);

    let needsUpdate = false;
    if (!lastUpdateDateStr) {
        needsUpdate = isUpdateTimePassed;
    } else {
        needsUpdate = (lastUpdateDateStr < todayKSTString) && isUpdateTimePassed;
    }

    if (needsUpdate) {
        stockCache = mockStockData.map(stock => {
            const changePercent = (Math.random() - 0.45) * 0.1; // -4.5% to +5.5% change
            const newPrice = Math.max(100, Math.round(stock.price * (1 + changePercent) / 100) * 100);
            return { ...stock, price: newPrice };
        });
        localStorage.setItem(lastUpdateKey, todayKSTString);
    }

    return stockCache;
}

/**
 * Get single stock price
 */
export async function getStockPrice(code: string): Promise<number | null> {
    const stocks = await getStockData();
    const stock = stocks.find(s => s.code === code);
    return stock?.price ?? null;
}

/**
 * Get daily price history for charts
 */
export async function getDailyPrices(code: string, days: number = 30): Promise<StockDailyData[]> {
    if (!isKisConfigured()) {
        // Return simulated historical data
        return generateSimulatedHistory(code, days);
    }

    try {
        return await kisFetchDailyPrices(code, days);
    } catch (error) {
        console.error('Failed to fetch daily prices:', error);
        return generateSimulatedHistory(code, days);
    }
}

/**
 * Generate simulated historical data for demo mode
 */
function generateSimulatedHistory(code: string, days: number): StockDailyData[] {
    const stock = mockStockData.find(s => s.code === code);
    if (!stock) return [];

    const history: StockDailyData[] = [];
    let price = stock.price;

    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        // Generate OHLC data with some randomness
        const change = (Math.random() - 0.48) * 0.06; // -3% to +3%
        const open = price;
        const close = Math.round(price * (1 + change) / 100) * 100;
        const high = Math.max(open, close) + Math.round(Math.random() * price * 0.02 / 100) * 100;
        const low = Math.min(open, close) - Math.round(Math.random() * price * 0.02 / 100) * 100;
        const volume = Math.round(1000000 + Math.random() * 5000000);

        history.push({
            date: date.toISOString().split('T')[0],
            open,
            high,
            low,
            close,
            volume,
        });

        price = close;
    }

    return history;
}

/**
 * Check if real-time data is available
 */
export function isRealTimeDataAvailable(): boolean {
    return isKisConfigured() && isMarketOpen();
}

/**
 * Get data source info
 */
export function getDataSourceInfo(): { source: 'kis' | 'mock'; isLive: boolean } {
    if (isKisConfigured()) {
        return { source: 'kis', isLive: isMarketOpen() };
    }
    return { source: 'mock', isLive: false };
}
