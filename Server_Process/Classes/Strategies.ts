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

    state: 'None' | 'InLong' = 'None';
    signal: DecisionType = DecisionType.Hold;

    pricedateObject: PriceDateObj | undefined;
    lastCallPrice: string = '0';

    constructor(_bot: BotModel, _strategyClass: Strategy) {
        this.bot = _bot;
        this.strategyClass = _strategyClass;
    }

    abstract flow(candles: Candle[]): Promise<void>;

    abstract updateSignal(): void;

    decideAct() {

        if(this.state == 'InLong' && this.signal == DecisionType.Sell) {
            // Exit Long
            this.state = 'None';
            this.strategyClass.decide({
                decision: DecisionType.Sell,
                percentage: this.getPercentageFromLastCross(this.pricedateObject!.actualPrice),
                price: this.pricedateObject!.actualPrice,
                date: this.pricedateObject!.actualDate,
                state: this.state
            })
            this.updateSignal();
        } else if(this.state == 'None' && this.signal == DecisionType.Buy) {
            // Go Long
            this.state = 'InLong';
            let decision: Decision = {
                decision: DecisionType.Buy,
                percentage: '-',
                price: this.pricedateObject!.actualPrice,
                date: this.pricedateObject!.actualDate,
                state: this.state
            }
            this.lastCallPrice = this.pricedateObject!.actualPrice
            this.strategyClass.decide(decision)
        } else if(this.state == 'InLong' && this.signal == DecisionType.Hold) {
             let decision: Decision = {
                decision: DecisionType.Hold,
                percentage: this.getPercentageFromLastCross(this.pricedateObject!.actualPrice),
                price: this.pricedateObject!.actualPrice,
                date: this.pricedateObject!.actualDate,
                state: this.state
            }
            this.strategyClass.decide(decision)
        }
        console.log(this.state, this.signal)
    }

    private getPercentageFromLastCross(actualPrice: string): string {
        const lastPrice: number = parseFloat(this.lastCallPrice);
        return (((parseFloat(actualPrice) - lastPrice) / lastPrice) * 100).toFixed(3) + '%'
    }

    changeState(state: "None" | "InLong") {
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
            if(fastEma > slowEma && basePrice > fastEma) this.signal = DecisionType.Buy
            else if(fastEma < slowEma && basePrice < fastEma) this.signal = DecisionType.Sell
            else this.signal = DecisionType.Hold
        } 
        else if(this.state == 'InLong' && basePrice < slowEma) this.signal = DecisionType.Sell // Abort Long
        else this.signal = DecisionType.Hold

        this.decideAct()
    }
}

class MACD extends Strategies {
    
    private periods: Array<number>;
    private macdObject: MACDObj | undefined;

    constructor(_bot: BotModel, _strategyClass: Strategy) {
        super(_bot, _strategyClass)
        this.periods = [parseInt(this.bot.botOptions.ema_short_period), parseInt(this.bot.botOptions.ema_long_period), parseInt(this.bot.botOptions.signal_period)]
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

        const macdHistogram = macd - signalEma;

        if(this.state == 'None') {
            if(macdHistogram > 0) this.signal = DecisionType.Buy
            else if(macdHistogram < 0) this.signal = DecisionType.Sell
            else this.signal = DecisionType.Hold
        }
        else if(this.state == 'InLong' && macdHistogram < 0) this.signal = DecisionType.Sell // Abort Long
        else this.signal = DecisionType.Hold

        this.decideAct()
    }
}

export {
    DEMA,
    MACD
}