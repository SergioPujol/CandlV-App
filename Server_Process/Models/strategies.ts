import { EMA } from "../Classes/EMA";

export interface PriceDateObj {
    actualPrice: string;
    actualDate: number;
}

export interface DEMAObj {
    fastEMA: EMA;
    slowEMA: EMA;
}

export interface MACDObj {
    fastEMA: EMA;
    slowEMA: EMA;
    signalEMA: EMA;
}