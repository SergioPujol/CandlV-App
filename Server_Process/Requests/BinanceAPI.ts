import got from 'got';
import { Candle } from '../Classes/Candle';

class BinanceAPI {

    APIKey: string;

    constructor() {
        this.APIKey = ''
    }

    async getKlines(symbol: string, interval: string, limit: string) {
        const { statusCode, body } = await got.get(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`); // symbol=BTCUSDT&interval=5m&limit=50
        if(statusCode == 200) return JSON.parse(body);
        else return false
    }

    async getCandlelist(symbol: string, interval: string, limit: string) {
        const klinesData = await this.getKlines(symbol, interval, limit);
        return klinesData.map((list: []) => new Candle(list))
    }

}

export { BinanceAPI }