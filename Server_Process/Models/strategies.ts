import { EMA } from "../Classes/EMA";

export interface DEMAObj {
    firstEMA: EMA;
    secondEMA: EMA;
}
export interface PriceDateObj {
    actualPrice: string;
    actualDate: number;
}