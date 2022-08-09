import { EMA } from "./EMA"
import { Candle } from "./Candle"
import { Utils } from "./Utils";
const utils = new Utils();

class ThreeEMA {

    private lastCallPrice: string = '0'; // not the same as cross

    private state: 'None' | 'InLong' | 'InShort' = 'None';
    private signal: 'hold' | 'buy' | 'sell' | 'abortLong' | 'abortShort' | 'awaitEntry' = 'hold';

    //private previousCross: number = 0;

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
        console.log(this.getPercentageFromLastCross(actualPrice))
        this.lastCallPrice = actualPrice
        if(firstEMAPoint.EMA > secondEMAPoint.EMA) return 'Long'
        return 'Short'
    }

    getPercentageFromLastCross(actualPrice: string): string {
        const lastPrice: number = parseFloat(this.lastCallPrice);
        return (((parseFloat(actualPrice) - lastPrice) / lastPrice) * 100).toFixed(3) + '%'
    }

    decideAct(firstEMA: EMA, secondEMA: EMA, actualPrice: string) {

        if(this.state == 'InLong' && this.signal == 'abortLong') {
            // Exit Long
            this.state = 'None';
            const percentage = this.getPercentageFromLastCross(actualPrice)
            utils.logEnterExit(`Exit Long - ${actualPrice}`)
            percentage.includes('-') ? utils.logFailure(`Exit long with ${percentage}`) : utils.logSuccess(`Exit long with ${percentage}`)
            this.updateSignal(firstEMA, secondEMA, actualPrice)
        } else if(this.state == 'InShort' && this.signal == 'abortShort') {
            // Exit Short
            this.state = 'None';
            const percentage = this.getPercentageFromLastCross(actualPrice)
            utils.logEnterExit(`Exit Short - ${actualPrice}`)
            percentage.includes('-') ? utils.logSuccess(`Exit short with ${percentage}`) : utils.logFailure(`Exit short with ${percentage}`)
            this.updateSignal(firstEMA, secondEMA, actualPrice)
        } else if(this.state == 'None' && this.signal == 'buy') {
            // Go Long
            this.state = 'InLong';
            this.lastCallPrice = actualPrice
            utils.logEnterExit(`Go Long - ${actualPrice}`)
        } else if(this.state == 'None' && this.signal == 'sell') {
            // Go Short
            this.state = 'InShort';
            this.lastCallPrice = actualPrice
            utils.logEnterExit(`Go Short - ${actualPrice}`)
        } else if((this.state == 'InLong' || this.state == 'InShort') && this.signal == 'hold') {
            utils.logInfo(`Hold state - ${actualPrice}`)
        } else if(this.state == 'None' && (this.signal == 'hold' || this.signal == 'awaitEntry')) {
            utils.logInfo(`Await entry - ${actualPrice}`)
        } else {
            utils.logFailure('Something went wrong on deciding the action')
        }
        
    }

    updateSignal(firstEMA: EMA, secondEMA: EMA, actualPrice: string) {
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

        this.decideAct(firstEMA, secondEMA, actualPrice)
    }

}

export { ThreeEMA }