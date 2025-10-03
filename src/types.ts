// --- DATA TYPES ---
export type View = 'landing' | 'teacher_dashboard' | 'class_detail' | 'student_dashboard' | 'notice_board' | 'qna_board' | 'admin_dashboard';

export interface Stock { code: string; name: string; price: number; }
export interface ClassInfo {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    seedMoney: number;
    allowedStocks: string[]; // Array of stock codes
    hasCommission: boolean;
    commissionRate: number; // e.g. 0.1 for 0.1%
}
export interface PortfolioItem { stockCode: string; quantity: number; averagePrice: number; }
export interface StudentInfo {
    id: string;
    nickname: string;
    classId: string;
    cash: number;
    portfolio: PortfolioItem[];
}
export interface Transaction {
    id: string;
    studentId: string;
    stockCode: string;
    stockName: string;
    type: 'buy' | 'sell' | 'bonus';
    quantity: number;
    price: number;
    timestamp: number;
    reason?: string;
}
export type TradeType = 'buy' | 'sell';
export interface TradeInfo { type: TradeType; stock: Stock; }

export type ToastMessage = {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
};

export interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  attachment?: {
      name: string;
      url: string; // Data URL
      type: string;
  }
}

export interface QnAPost {
  id: string;
  author: string;
  question: string;
  answer?: string;
  createdAt: number;
  answeredAt?: number;
  isSecret: boolean;
  password?: string;
}