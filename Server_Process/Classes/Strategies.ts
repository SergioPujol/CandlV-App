import { Strategy } from "./Strategy";
import { Candle } from "./Candle";
import { EMA } from "./EMA";
import { BotModel } from "../Models/bot";
import { DEMAObj, MACDObj, PriceDateObj } from "../Models/strategies";
import { Decision, DecisionType } from "../Models/decision";
import { calculateEMA, calculateMultiplicator, calculateSMA } from "./Utils";

abstract class Strategies {
    bot: BotModel;
    strategyClass: Strategy;

    state: 'None' | 'InLong' | 'InShort' = 'None';
    signal: 'hold' | 'buy' | 'sell' | 'abortLong' | 'abortShort' | 'awaitEntry' = 'hold';

    pricedateObject: PriceDateObj | undefined;
    lastCallPrice: string = '0';

    constructor(_bot: BotModel, _strategyClass: Strategy) {
        this.bot = _bot;
        this.strategyClass = _strategyClass;
    }

    abstract flow(candles: Candle[]): Promise<void>;

    abstract updateSignal(): void;

    decideAct() {

        if(this.state == 'InLong' && this.signal == 'abortLong') {
            // Exit Long
            this.state = 'None';
            let decision: Decision = {
                type: 'exit',
                decision: DecisionType.Sell,
                percentage: this.getPercentageFromLastCross(this.pricedateObject!.actualPrice),
                price: this.pricedateObject!.actualPrice,
                date: this.pricedateObject!.actualDate,
                state: this.state
            }
            this.strategyClass.decide(decision)
            this.updateSignal();
        } else if(this.state == 'InShort' && this.signal == 'abortShort') {
            // Exit Short
            this.state = 'None';
            this.updateSignal();
        } else if(this.state == 'None' && this.signal == 'buy') {
            // Go Long
            this.state = 'InLong';
            let decision: Decision = {
                type: 'enter',
                decision: DecisionType.Buy,
                percentage: '0%',
                price: this.pricedateObject!.actualPrice,
                date: this.pricedateObject!.actualDate,
                state: this.state
            }
            this.lastCallPrice = this.pricedateObject!.actualPrice
            this.strategyClass.decide(decision)
        } else if(this.state == 'None' && this.signal == 'sell') {
            // Go Short
            this.state = 'InShort';
        } else if((this.state == 'InLong') && this.signal == 'hold') {
             let decision: Decision = {
                type: 'hold',
                decision: DecisionType.Hold,
                percentage: this.getPercentageFromLastCross(this.pricedateObject!.actualPrice),
                price: this.pricedateObject!.actualPrice,
                date: this.pricedateObject!.actualDate,
                state: this.state
            }
            this.strategyClass.decide(decision)
        } else if((this.state == 'None' || this.state == 'InShort') && (this.signal == 'hold' || this.signal == 'awaitEntry')) {
        } else { }
        console.log(this.state, this.signal)
    }

    private getPercentageFromLastCross(actualPrice: string): string {
        const lastPrice: number = parseFloat(this.lastCallPrice);
        return (((parseFloat(actualPrice) - lastPrice) / lastPrice) * 100).toFixed(3) + '%'
    }

    changeState(state: "None" | "InLong" | "InShort") {
        this.state = state;
        if(state === "InLong") this.lastCallPrice = this.pricedateObject!.actualPrice
    }

}

class DEMA extends Strategies {

    private periods: Array<number>;
    private demaObject: DEMAObj | undefined;

    constructor(_bot: BotModel, _strategyClass: Strategy) {
        super(_bot, _strategyClass)
        this.periods = [parseInt(this.bot.botOptions.ema_short_period), parseInt(this.bot.botOptions.ema_long_period)]
    }

    async flow(candles: Candle[]) {

        var EMAs: Array<EMA> = [];

        this.periods.forEach(period => {
            let previousEma = calculateSMA(candles, period)
            let multiplicator = calculateMultiplicator(period);
            let listEMAs: Array<{ EMA: number, date: number }> = [];
            for (let ind = 0; ind < (candles.length - period); ind++) {
                let actualCandel: Candle = candles[ind + period];
                let ema = calculateEMA(previousEma, multiplicator, actualCandel.getClose())
                listEMAs.push({ EMA: ema, date: actualCandel.getOpenTime() })
                previousEma = ema
            }

            EMAs.push(new EMA(listEMAs, period))
        });

        this.pricedateObject = {
            actualPrice: candles[candles.length-1].getClose(),
            actualDate: candles[candles.length-1].getOpenTime()
        }
        this.demaObject = {
            fastEMA: EMAs[0],
            slowEMA: EMAs[1]
        }
        this.updateSignal()
    }

    updateSignal() {
        const fastEma = this.demaObject!.fastEMA.getLastPoint().EMA // Small period - fast ema
        const slowEma = this.demaObject!.slowEMA.getLastPoint().EMA // Big period - slow ema
        const basePrice = parseFloat(this.pricedateObject!.actualPrice)
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

        this.decideAct()
    }
}

class MACD extends Strategies {
    
    private periods: Array<number>;
    private macdObject: MACDObj | undefined;

    constructor(_bot: BotModel, _strategyClass: Strategy) {
        super(_bot, _strategyClass)
        this.periods = [parseInt(this.bot.botOptions.ema_short_period), parseInt(this.bot.botOptions.ema_long_period), parseInt(this.bot.botOptions.ema_signal_period)]
    }

    async flow(candles: Candle[]) {

        var EMAs: Array<EMA> = [];

        this.periods.forEach(period => {
            let previousEma = calculateSMA(candles, period)
            let multiplicator = calculateMultiplicator(period);
            let listEMAs: Array<{ EMA: number, date: number }> = [];
            for (let ind = 0; ind < (candles.length - period); ind++) {
                let actualCandel: Candle = candles[ind + period];
                let ema = calculateEMA(previousEma, multiplicator, actualCandel.getClose())
                listEMAs.push({ EMA: ema, date: actualCandel.getOpenTime() })
                previousEma = ema
            }

            EMAs.push(new EMA(listEMAs, period))
        });

        this.pricedateObject = {
            actualPrice: candles[candles.length-1].getClose(),
            actualDate: candles[candles.length-1].getOpenTime()
        }
        this.macdObject = {
            fastEMA: EMAs[0],
            slowEMA: EMAs[1],
            signalEMA: EMAs[2]
        }
        this.updateSignal()
    }

    updateSignal() {
        const macd = this.macdObject!.fastEMA.getLastPoint().EMA - this.macdObject!.slowEMA.getLastPoint().EMA; // Big period - slow ema
        const signalEma = this.macdObject!.signalEMA.getLastPoint().EMA; // Signal period
        //const basePrice = parseFloat(this.pricedateObject!.actualPrice);

        const macdHistogram = macd - signalEma;

        if(this.state == 'None') {
            if(macdHistogram > 0) {
                // buy
            } else if(macdHistogram < 0) {
                // sell
            } else {
                // hold
            }
        }
        
        /*if(this.state == 'None') {
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
        else this.signal = 'hold'*/

        this.decideAct()
    }
}

export { DEMA }