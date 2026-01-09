import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Custom render function that includes providers if needed
const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options });

export * from '@testing-library/react';
export { customRender as render };

// Test data factories
export const createMockClass = (overrides = {}) => ({
    id: `C${Date.now()}`,
    name: 'Test Class',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    seedMoney: 1000000,
    hasCommission: false,
    commissionRate: 0,
    teacherEmail: 'teacher@test.com',
    ...overrides,
});

export const createMockStudent = (overrides = {}) => ({
    id: `S${Date.now()}`,
    nickname: 'TestStudent',
    classId: 'C123',
    cash: 1000000,
    portfolio: [],
    ...overrides,
});

export const createMockTeacher = (overrides = {}) => ({
    id: `T${Date.now()}`,
    email: 'teacher@test.com',
    password: 'password123',
    createdAt: Date.now(),
    ...overrides,
});

export const createMockTransaction = (overrides = {}) => ({
    id: `T${Date.now()}`,
    studentId: 'S123',
    stockCode: '005930',
    stockName: '삼성전자',
    type: 'buy' as const,
    quantity: 10,
    price: 70000,
    timestamp: Date.now(),
    ...overrides,
});

export const createMockStock = (overrides = {}) => ({
    code: '005930',
    name: '삼성전자',
    price: 70000,
    sector: 'IT',
    description: '전자제품 제조업체',
    ...overrides,
});
