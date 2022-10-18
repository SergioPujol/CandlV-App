import { EMA } from "./EMA"
import { Candle } from "./Candle"
import { Utils } from "./Utils";
import { BinanceAPI } from "../Requests/BinanceAPI";
import { Decision, DecisionType } from "../Models/decision";
import { Notification } from "./Notification";

const utils = new Utils();
const binanceAPI = new BinanceAPI();
const notification = new Notification();

class DoubleEMA {

    private lastCallPrice: string = '0'; // not the same as cross

    private botId: string = '';

    private state: 'None' | 'InLong' | 'InShort' = 'None';
    private signal: 'hold' | 'buy' | 'sell' | 'abortLong' | 'abortShort' | 'awaitEntry' = 'hold';

    private simulationBool = false;
    private simulationDecisionList: Decision[] = [];

    calculateEMA(previousEmaValue: number, multiplicator: number, actualClosePrice: string) {
        return (parseFloat(actualClosePrice) - previousEmaValue) * multiplicator + previousEmaValue
    }

    calculateSMA(dataset: Array<Candle>, n: number) {
        const listClosePriceValues = this.getNClosePrice(dataset, n)
        let sumCloseValues = listClosePriceValues.reduce((previousValue: number, currentValue: string) => previousValue + parseInt(currentValue), 0);
        return sumCloseValues/listClosePriceValues.length
    }

    getNClosePrice(dataset: Array<Candle>, n: number) {
        let listClosePrice: Array<string> = dataset.map(function(x: Candle) { return x.getClose(); });
        return listClosePrice.slice(-n)
    }

    calculateMultiplicator(nPeriod: number) {
        return 2/(nPeriod+1)
    }

    crossedEMAS(firstEMA: EMA, secondEMA: EMA) {
        const firstEMAPoints = firstEMA.getLast2Points()
        const secondEMAPoints = secondEMA.getLast2Points()
        if(((firstEMAPoints[0].EMA - secondEMAPoints[0].EMA > 0) && (firstEMAPoints[1].EMA - secondEMAPoints[1].EMA < 0)) || ((firstEMAPoints[0].EMA - secondEMAPoints[0].EMA < 0) && (firstEMAPoints[1].EMA - secondEMAPoints[1].EMA > 0))) return true
        return false
    }

    getCrossPoint(firstEMA: EMA, secondEMA: EMA) { // de momento unicamente hacerlo de 2 emas
        const firstEMAPoints = firstEMA.getLast2Points()
        const secondEMAPoints = secondEMA.getLast2Points()

        return this.calculateIntersection(firstEMAPoints[0].EMA, firstEMAPoints[1].EMA, secondEMAPoints[0].EMA, secondEMAPoints[1].EMA)
    }

    calculateIntersection(p1: number, p2: number, p3: number, p4: number) {

          var c2y = p3 - p4; // (y3 - y4)
          var c3y = p1 - p2; // (y1 - y2)
      
          // down part of intersection point formula
          var d  = 1 * c2y - c3y * -1;
      
          // upper part of intersection point formula
          var u1 = 0 * p2 - p1 * 1; // (x1 * y2 - y1 * x2)
          var u4 = 1 * p4 - p3 * 0; // (x3 * y4 - y3 * x4)
      
          return { x: (u1 * -1 - 1 * u4) / d, y: -(u1 * c2y - c3y * u4) / d };
    }

    trade(firstEMA: EMA, secondEMA: EMA, actualPrice: string) {
        const firstEMAPoint = firstEMA.getLastPoint() // Small period
        const secondEMAPoint = secondEMA.getLastPoint() // Big period
        this.lastCallPrice = actualPrice
        if(firstEMAPoint.EMA > secondEMAPoint.EMA) return 'Long'
        return 'Short'
    }

    getPercentageFromLastCross(actualPrice: string): string {
        const lastPrice: number = parseFloat(this.lastCallPrice);
        return (((parseFloat(actualPrice) - lastPrice) / lastPrice) * 100).toFixed(3) + '%'
    }

    decideAct(firstEMA: EMA, secondEMA: EMA, actualPrice: string, actualDate: number) {

        if(this.state == 'InLong' && this.signal == 'abortLong') {
            // Exit Long
            this.state = 'None';
            const percentage = this.getPercentageFromLastCross(actualPrice)
            utils.logEnterExit(`#${this.botId} // Exit Long - ${actualPrice}`)
            percentage.includes('-') ? utils.logFailure(`#${this.botId} // Exit long with ${percentage}`) : utils.logSuccess(`#${this.botId} // Exit long with ${percentage}`)
            let decision: Decision = {
                type: 'exit',
                decision: DecisionType.ExitLong,
                percentage: percentage,
                price: actualPrice,
                date: actualDate
            }
            if(this.simulationBool) this.simulationDecisionList.push(decision)
            else notification.sendNotification(decision)
            this.updateSignal(firstEMA, secondEMA, actualPrice, actualDate);
        } else if(this.state == 'InShort' && this.signal == 'abortShort') {
            // Exit Short
            this.state = 'None';
            const percentage = this.getPercentageFromLastCross(actualPrice)
            utils.logEnterExit(`#${this.botId} // Exit Short - ${actualPrice}`)
            percentage.includes('-') ? utils.logSuccess(`#${this.botId} // Exit short with ${percentage}`) : utils.logFailure(`#${this.botId} // Exit short with ${percentage}`)
            let decision: Decision = {
                type: 'exit',
                decision: DecisionType.ExitShort,
                percentage: percentage,
                price: actualPrice,
                date: actualDate
            }
            if(this.simulationBool) this.simulationDecisionList.push(decision)
            else notification.sendNotification(decision)
            this.updateSignal(firstEMA, secondEMA, actualPrice, actualDate);
        } else if(this.state == 'None' && this.signal == 'buy') {
            // Go Long
            this.state = 'InLong';
            this.lastCallPrice = actualPrice
            utils.logEnterExit(`#${this.botId} // Go Long - ${actualPrice}`)
            let decision: Decision = {
                type: 'enter',
                decision: DecisionType.StartLong,
                price: actualPrice,
                date: actualDate
            }
            if(this.simulationBool) this.simulationDecisionList.push(decision)
            else notification.sendNotification(decision)
        } else if(this.state == 'None' && this.signal == 'sell') {
            // Go Short
            this.state = 'InShort';
            this.lastCallPrice = actualPrice
            utils.logEnterExit(`#${this.botId} // Go Short - ${actualPrice}`)
            let decision: Decision = {
                type: 'enter',
                decision: DecisionType.StartShort,
                price: actualPrice,
                date: actualDate
            }
            if(this.simulationBool) this.simulationDecisionList.push(decision)
            else notification.sendNotification(decision)
        } else if((this.state == 'InLong' || this.state == 'InShort') && this.signal == 'hold') {
            utils.logInfo(`#${this.botId} // Hold state - ${actualPrice}`)
        } else if(this.state == 'None' && (this.signal == 'hold' || this.signal == 'awaitEntry')) {
            utils.logInfo(`#${this.botId} // Await entry - ${actualPrice}`)
        } else {
            utils.logFailure(`#${this.botId} // Something went wrong on deciding the action`)
        }
        
    }

    updateSignal(firstEMA: EMA, secondEMA: EMA, actualPrice: string, actualDate: number) {
        const fastEma = firstEMA.getLastPoint().EMA // Small period - fast ema
        const slowEma = secondEMA.getLastPoint().EMA // Big period - slow ema
        const basePrice = parseFloat(actualPrice)
        if(this.state == 'None') {
            if(fastEma > slowEma) {
                if (basePrice > fastEma) this.signal = 'buy'
                else this.signal = 'awaitEntry' // Fast Ema is above slow, but not the price => wait
            } else if(fastEma < slowEma) {
                if (basePrice < fastEma) this.signal = 'sell'
                else this.signal = 'awaitEntry' // Fast Ema is bellow slow, but not the price => wait
            }
        } 
        else if(this.state == 'InLong' && basePrice < slowEma) this.signal = 'abortLong' // Abort Long
        else if(this.state == 'InShort' && basePrice > slowEma) this.signal = 'abortShort' // Abort Short
        else this.signal = 'hold'

        return this.decideAct(firstEMA, secondEMA, actualPrice, actualDate)
    }

    async flowTrading(id: string, symbol: string, interval: string, limit: string, botOptions: any) {
        this.botId = id
        console.log(`${id} - Flow DEMA`)
        const periods: Array<number> = [parseInt(botOptions.ema_short_period), parseInt(botOptions.ema_long_period)]//botOptions.period
        const candles = await binanceAPI.getCandlelist(symbol, interval, limit);

        this.flow(candles, periods)
    }

    async flowSimulation(id: string, symbol: string, interval: string, period: { from: string, to: string }, botOptions: any) {
        this.simulationBool = true
        const { from, to } = { from: parseInt(period.from)/1000, to: parseInt(period.to)/1000 }
        const periods: Array<number> = [parseInt(botOptions.ema_short_period), parseInt(botOptions.ema_long_period)]
        this.botId = id;
        var candles: Candle[] = []
        var nPeriods = utils.getPeriods(from, to, parseInt(interval)) + 400;
        var Tperiods = nPeriods;
        while(nPeriods > 1000) {
            candles = [...(await binanceAPI.getPeriodCandleList(symbol, interval, { from: ((to - (Tperiods - nPeriods + 1000)*60*parseInt(interval)) * 1000).toString(), to: ((to - (Tperiods - nPeriods)*60*parseInt(interval)) * 1000).toString() })), ...candles]
            nPeriods -= 1001
        }
        candles = [...(await binanceAPI.getPeriodCandleList(symbol, interval, { from: ((to - (Tperiods)*60*parseInt(interval)) * 1000).toString(), to: ((to - (Tperiods - nPeriods)*60*parseInt(interval)) * 1000).toString() })), ...candles]
        
        for(let i=0; i < (Tperiods - 400); i++) {
            this.flow(candles.slice(i, 402 + i), periods)
            //await utils.sleep(100);
        }

        return this.simulationDecisionList

    }

    flow(candles: Candle[], periods: Array<number>) {
        var EMAs: Array<EMA> = [];

        periods.forEach(period => {
            let previousEma = this.calculateSMA(candles, period)
            let multiplicator = this.calculateMultiplicator(period);
            let listEMAs: Array<{ EMA: number, date: number }> = [];
            for (let ind = 0; ind < (candles.length - period); ind++) {
                let actualCandel: Candle = candles[ind + period];
                let ema = this.calculateEMA(previousEma, multiplicator, actualCandel.getClose())
                listEMAs.push({ EMA: ema, date: actualCandel.getOpenTime() })
                previousEma = ema
            }

            EMAs.push(new EMA(listEMAs, period))
        });

        const actualPrice = candles[candles.length-1].getClose()
        const actualDate = candles[candles.length-1].getOpenTime()
        return this.updateSignal(EMAs[0], EMAs[1], actualPrice, actualDate)
    }

}

export { DoubleEMA }