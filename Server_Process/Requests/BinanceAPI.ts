import got from 'got';
import { Candle } from '../Classes/Candle';

class BinanceAPI {

    APIKey: string;
    private intervals: any = { '1': '1m', '3': '3m','5': '5m','15': '15m','30': '30m','60': '1h','120': '2h','180': '3h','240': '4h','D': '1d','W': '1s'};

    constructor() {
        this.APIKey = ''
    }

    async getKlines(symbol: string, interval: string, limit: string) {
        const { statusCode, body } = await got.get(`https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${this.getIntervalString(interval)}&limit=${limit}`); // symbol=BTCUSDT&interval=5m&limit=50
        if(statusCode == 200) return JSON.parse(body);
        else return false
    }

    async getCandlelist(symbol: string, interval: string, limit: string) {
        const klinesData = await this.getKlines(symbol, interval, limit);
        return klinesData.map((list: []) => new Candle(list))
    }

    getIntervalString(secsValue: string): string {
        return this.intervals[secsValue]
    }
    

}

export { BinanceAPI }