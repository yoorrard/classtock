import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Firebase
vi.mock('../firebase', () => ({
    initializeFirebase: vi.fn(() => false),
    isFirebaseAvailable: vi.fn(() => false),
    getFirebaseApp: vi.fn(() => null),
    getFirebaseAuth: vi.fn(() => null),
    getFirebaseDb: vi.fn(() => null),
    getFirebaseStorage: vi.fn(() => null),
}));

// Reset mocks before each test
beforeEach(() => {
    vi.clearAllMocks();
});
