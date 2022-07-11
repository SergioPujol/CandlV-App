const got = require('got');

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

}

export { BinanceAPI }