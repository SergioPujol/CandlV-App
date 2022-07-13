import { Candle } from './Classes/Candle';
import { BinanceAPI } from './Classes/BinanceAPI';
import { ThreeEMA } from './Classes/Strategies';
import { EMA } from './Classes/EMA';

import express from 'express';
import * as path from 'path';

const app = express();
const router = express.Router();

const threeEma = new ThreeEMA();
const binanceAPI = new BinanceAPI();

var emas: Array<any> = []

var foo: {x: number, y: number} | boolean;

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

            emas = []
            EMAs.forEach((ema: EMA) => {
                let list: any = []
                ema.getListValues().forEach((val: { EMA: number, date: number }) => {
                    list.push([val.date,val.EMA])
                })
                emas.push(list)
            })
            if (threeEma.crossedEMAS(EMAs[0], EMAs[1])) {
                console.log(true)
                console.log(threeEma.getCrossPoint(EMAs[0], EMAs[1]))
                foo = threeEma.getCrossPoint(EMAs[0], EMAs[1])
            } else foo = false
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
    
    router.get('/',function(req: any,res: any){
        res.sendFile(path.join(__dirname+'/public/index.html'));
        //__dirname : It will resolve to your project folder.
    });

    router.get('/foo',function(req: any,res: any){
        res.send(foo);
        //__dirname : It will resolve to your project folder.
    });

    router.get('/getEMAsData',function(req: any,res: any){
        res.send(emas);
        //__dirname : It will resolve to your project folder.
    });

    //add the router
    app.use(express.static('public'));
    app.use('/', router);
    app.listen(process.env.port || 3000);

    console.log('Running at Port 3000');

    App.run('BTCUSDT', '1m', '400', [3, 6]);

})();