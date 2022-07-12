import { Candle } from './Classes/Candle';
import { BinanceAPI } from './Classes/BinanceAPI';
import { ThreeEMA } from './Classes/Strategies';
import { EMA } from './Classes/EMA';

const threeEma = new ThreeEMA();
const binanceAPI = new BinanceAPI();

class App {
    public static async run(symbol: string, interval: string, limit: string, periods: Array<number>) {

        const func = async () => {

            var now = new Date();
            // convert date to a string in UTC timezone format:
            console.log(now.toUTCString());
            // Output: Wed, 21 Jun 2017 09:13:01 GMT

            const data = await binanceAPI.getKlines(symbol, interval, limit)

            const candleList: Array<Candle> = data.map((list: []) => new Candle(list))

            const EMAs: Array<EMA> = []

            // for get array of new EMA 's objects + previous values for each

            periods.forEach(period => {
                let previousEma = threeEma.calculateSMA(candleList, period)
                let multiplicator = threeEma.calculateMultiplicator(period);
                let listEMAs: Array<{ EMA: number, date: number }> = [];
                for (let ind = 0; ind < (parseInt(limit) - period); ind++) {
                    let actualCandel = candleList[ind + period];
                    let ema = threeEma.calculateEMA(previousEma, multiplicator, actualCandel.getClose())
                    listEMAs.push({ EMA: ema, date: actualCandel.getOpenTime() })
                    previousEma = ema
                }

                EMAs.push(new EMA(listEMAs, period))
            });

            /*EMAs.forEach((ema: EMA) => {
                console.log('Period: ' + ema.getNPeriod())
                let str = ''
                ema.getListValues().forEach((val: { EMA: number, date: number }) => {
                    str += `[${val.date},${val.EMA}],`
                })
                //console.log('List: ' + str)
            })*/
            if (threeEma.crossedEMAS(EMAs[0], EMAs[1])) {
                console.log(true)
                console.log(threeEma.getCrossPoint(EMAs[0], EMAs[1]))
            }
        }

        func()
        let interv = setInterval(func, 1 * 60 * 1000)




        /**
         * Flow:
         * 
         * Obtener datos de la informacion que se desea obtener: ej. Symbol: BTCUSDT, Interval: 5m, Periodos: [3, 6]
         * Si es la primera vez que se inicia la APP, obtener la SMA de cada uno de los periodos (previous EMA)
         * Iniciar intervalo para iniciar monitorizacion, ej. Interval: 5m, realizar intervalo cada 5 minutos
         * { 
         *  - Recorrer lista de periodos para obtener la ema de cada uno de ellos
         *  {
         *      - 
         *  }
         * }
         * 
         */
    }

}

(async () => {
    App.run('BTCUSDT', '1m', '400', [3, 6]);
})();