import { Candle } from './Server/Classes/Candle';
import { BinanceAPI } from './Server/Classes/BinanceAPI';
import { ThreeEMA } from './Server/Classes/Strategies';
import { EMA } from './Server/Classes/EMA';
import { Utils } from './Server/Classes/Utils';

import express from 'express';
import * as path from 'path';

const app = express();
const router = express.Router();

const threeEma = new ThreeEMA();
const binanceAPI = new BinanceAPI();
const utils = new Utils();

var EMAs: Array<EMA> = []
var candleList : Array<Candle>;

var foo: {x: number, y: number} | boolean;

class App {
    public static async run(symbol: string, interval: string, limit: string, periods: Array<number>) {

        periods = periods.sort((a,b) => a-b)

        const func = async () => {

            const data = await binanceAPI.getKlines(symbol, interval, limit)

            candleList = data.map((list: []) => new Candle(list))

            EMAs = []; 

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

            const actualPrice = candleList[candleList.length-1].getClose()
            threeEma.updateSignal(EMAs[0], EMAs[1], actualPrice)

            /*if (threeEma.crossedEMAS(EMAs[0], EMAs[1])) {
                console.log(`Crossed in ${threeEma.getCrossPoint(EMAs[0], EMAs[1]).y}`)
                console.log('Trade to do: ', threeEma.trade(EMAs[0], EMAs[1], actualPrice))
                foo = threeEma.getCrossPoint(EMAs[0], EMAs[1])
            } else foo = false*/
        }

        func()
        let interv = setInterval(func, 1 * 60 * 1000)
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

    router.get('/getChartData',function(req: any,res: any){
        if(EMAs.length < 1) return
        const info = EMAs.map((ema: EMA) => { return { n: ema.getNPeriod(), listData: [...Array(ema.getNPeriod()).fill('-') , ...ema.getListValues().map((value: any) => {
                return value.EMA
            })]
        }})
        res.send({EMAData: info, CandlesData: utils.getCandlesForChart(candleList) });
    });

    //add the router
    app.use(express.static('public'));
    app.use('/', router);
    app.listen(process.env.port || 3000);

    console.log('Running at Port 3000');

    var time = new Date(), secondsRemaining = (60 - time.getSeconds()) * 1000;

    utils.logInfo(`Waiting ${secondsRemaining/1000} seconds to start`)
    setTimeout(function() {
        App.run('BTCUSDT', '1m', '400', [3, 6]);
    }, secondsRemaining);

})();