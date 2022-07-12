import { Candle } from './Classes/Candle';
import { BinanceAPI } from './Classes/BinanceAPI';

class App {
    public static async run(symbol: string, interval: string, limit: string) {
        const binanceAPI = new BinanceAPI();

        const data = await binanceAPI.getKlines(symbol, interval, limit)

        const candleList = data.map((list: []) => new Candle(list))
        console.log(candleList)
    }
}

(async () => {
    App.run('BTCUSDT', '5m', '50');
})();