import { describe, it, expect } from 'vitest';
import { createMockClass, createMockStudent, createMockStock } from './utils';

// Test helper functions that would typically be in App.tsx
// These are extracted for testability

const isActivityActive = (classInfo: { startDate: string; endDate: string } | null): boolean => {
    if (!classInfo || !classInfo.startDate || !classInfo.endDate) return false;

    const now = new Date();
    const startDate = new Date(`${classInfo.startDate}T00:00:00+09:00`);
    const endDate = new Date(`${classInfo.endDate}T23:59:59+09:00`);

    return now >= startDate && now <= endDate;
};

const calculateTotalAssets = (
    student: { cash: number; portfolio: { stockCode: string; quantity: number }[] },
    stocks: { code: string; price: number }[]
): number => {
    const stockValue = student.portfolio.reduce((acc, item) => {
        const stock = stocks.find(s => s.code === item.stockCode);
        return acc + (stock ? stock.price * item.quantity : 0);
    }, 0);
    return student.cash + stockValue;
};

describe('isActivityActive', () => {
    it('should return false when classInfo is null', () => {
        expect(isActivityActive(null)).toBe(false);
    });

    it('should return false when dates are missing', () => {
        expect(isActivityActive({ startDate: '', endDate: '' })).toBe(false);
    });

    it('should return true when current date is within range', () => {
        const today = new Date();
        const pastDate = new Date(today);
        pastDate.setMonth(today.getMonth() - 1);
        const futureDate = new Date(today);
        futureDate.setMonth(today.getMonth() + 1);

        const classInfo = {
            startDate: pastDate.toISOString().split('T')[0],
            endDate: futureDate.toISOString().split('T')[0],
        };

        expect(isActivityActive(classInfo)).toBe(true);
    });

    it('should return false when current date is before start date', () => {
        const futureStart = new Date();
        futureStart.setMonth(futureStart.getMonth() + 1);
        const futureEnd = new Date();
        futureEnd.setMonth(futureEnd.getMonth() + 2);

        const classInfo = {
            startDate: futureStart.toISOString().split('T')[0],
            endDate: futureEnd.toISOString().split('T')[0],
        };

        expect(isActivityActive(classInfo)).toBe(false);
    });

    it('should return false when current date is after end date', () => {
        const pastStart = new Date();
        pastStart.setMonth(pastStart.getMonth() - 2);
        const pastEnd = new Date();
        pastEnd.setMonth(pastEnd.getMonth() - 1);

        const classInfo = {
            startDate: pastStart.toISOString().split('T')[0],
            endDate: pastEnd.toISOString().split('T')[0],
        };

        expect(isActivityActive(classInfo)).toBe(false);
    });
});

describe('calculateTotalAssets', () => {
    it('should return only cash when portfolio is empty', () => {
        const student = createMockStudent({ cash: 1000000, portfolio: [] });
        const stocks = [createMockStock()];

        expect(calculateTotalAssets(student, stocks)).toBe(1000000);
    });

    it('should calculate total assets correctly with portfolio', () => {
        const student = createMockStudent({
            cash: 500000,
            portfolio: [
                { stockCode: '005930', quantity: 10 },
            ],
        });
        const stocks = [createMockStock({ code: '005930', price: 70000 })];

        // 500000 cash + (10 * 70000) = 500000 + 700000 = 1200000
        expect(calculateTotalAssets(student, stocks)).toBe(1200000);
    });

    it('should handle multiple stocks in portfolio', () => {
        const student = createMockStudent({
            cash: 100000,
            portfolio: [
                { stockCode: '005930', quantity: 5 },
                { stockCode: '035720', quantity: 10 },
            ],
        });
        const stocks = [
            createMockStock({ code: '005930', price: 70000 }),
            createMockStock({ code: '035720', price: 50000 }),
        ];

        // 100000 + (5 * 70000) + (10 * 50000) = 100000 + 350000 + 500000 = 950000
        expect(calculateTotalAssets(student, stocks)).toBe(950000);
    });

    it('should ignore stocks not found in stock list', () => {
        const student = createMockStudent({
            cash: 1000000,
            portfolio: [
                { stockCode: 'UNKNOWN', quantity: 100 },
            ],
        });
        const stocks = [createMockStock({ code: '005930', price: 70000 })];

        expect(calculateTotalAssets(student, stocks)).toBe(1000000);
    });
});

describe('Mock data factories', () => {
    it('should create valid mock class', () => {
        const mockClass = createMockClass();

        expect(mockClass.id).toMatch(/^C\d+$/);
        expect(mockClass.name).toBe('Test Class');
        expect(mockClass.seedMoney).toBe(1000000);
        expect(mockClass.teacherEmail).toBe('teacher@test.com');
    });

    it('should allow overriding mock class properties', () => {
        const mockClass = createMockClass({
            name: 'Custom Class',
            seedMoney: 2000000,
        });

        expect(mockClass.name).toBe('Custom Class');
        expect(mockClass.seedMoney).toBe(2000000);
    });

    it('should create valid mock student', () => {
        const mockStudent = createMockStudent();

        expect(mockStudent.id).toMatch(/^S\d+$/);
        expect(mockStudent.nickname).toBe('TestStudent');
        expect(mockStudent.cash).toBe(1000000);
        expect(mockStudent.portfolio).toEqual([]);
    });

    it('should create valid mock stock', () => {
        const mockStock = createMockStock();

        expect(mockStock.code).toBe('005930');
        expect(mockStock.name).toBe('삼성전자');
        expect(mockStock.price).toBe(70000);
    });
});
