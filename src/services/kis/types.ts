// KIS API Response Types

export interface KisTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    access_token_token_expired: string;
}

export interface KisStockPrice {
    stck_prpr: string;      // 현재가
    prdy_vrss: string;      // 전일 대비
    prdy_vrss_sign: string; // 전일 대비 부호 (1:상한, 2:상승, 3:보합, 4:하한, 5:하락)
    prdy_ctrt: string;      // 전일 대비율
    acml_vol: string;       // 누적 거래량
    acml_tr_pbmn: string;   // 누적 거래대금
    stck_oprc: string;      // 시가
    stck_hgpr: string;      // 고가
    stck_lwpr: string;      // 저가
}

export interface KisStockInfo {
    pdno: string;           // 종목코드
    prdt_name: string;      // 종목명
    prdt_eng_name: string;  // 종목영문명
    std_idst_clsf_cd_name: string; // 업종명
    lstg_stqt: string;      // 상장주수
    cpfn: string;           // 자본금
    per: string;            // PER
    pbr: string;            // PBR
    eps: string;            // EPS
    bps: string;            // BPS
}

export interface KisDailyPrice {
    stck_bsop_date: string; // 영업일자
    stck_oprc: string;      // 시가
    stck_hgpr: string;      // 고가
    stck_lwpr: string;      // 저가
    stck_clpr: string;      // 종가
    acml_vol: string;       // 거래량
}

export interface StockQuote {
    code: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    open: number;
}

export interface StockDailyData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
