import { Strategy } from "../Classes/Strategy";
import { Strategies } from '../Classes/Strategies';
import { BotModel } from "../Models/bot";
import { Candle } from "../Classes/Candle";
import { DecisionType } from "../Models/decision";
import { calculateEMA, calculateMultiplicator, calculateSMA, calculateSMAWithEMA, getArrayClosePrice, getBollingerBands, getLastArrayItem } from "../Classes/Utils";

export class test extends Strategies {

    private customStrategyObject: { topLimit: number, bottomLimit: number } | undefined; // EXAMPLE

    /* 
      From Strategies Class is declared:
        bot: BotModel;
        strategyClass: Strategy;

        state: 'None' | 'InLong' = 'None';
        signal: DecisionType = DecisionType.Hold;

        pricedateObject: PriceDateObj | undefined;
        lastCallPrice: string = '0';

        method decideAct()
    */

    /* 
      This custom Strategy methodology: 
        If close price is < bottomLimit, buy
        If close price is > topLimit, sell
        else hold

        (similar performance of Limits)
    */

    constructor(_bot: BotModel, _strategyClass: Strategy) {
        super(_bot, _strategyClass)

        this.customStrategyObject = {
            topLimit: parseFloat(this.bot.botOptions.topLimit),
            bottomLimit: parseFloat(this.bot.botOptions.bottomLimit),
        }
    }

    async flow(candles: Candle[]) {

        this.pricedateObject = {
            actualPrice: candles[candles.length-1].getClose(),
            actualDate: candles[candles.length-1].getOpenTime()
        }
        
        this.updateSignal()
    }

    updateSignal() {
        
        const candleClosePrice = parseFloat(this.pricedateObject!.actualPrice);
        const topLimit = this.customStrategyObject!.topLimit;
        const bottomLimit = this.customStrategyObject!.bottomLimit;

        if(this.state == 'None') {
            if(candleClosePrice < bottomLimit) this.signal = DecisionType.Buy
            else if(candleClosePrice > topLimit) this.signal = DecisionType.Sell
            else this.signal = DecisionType.Hold
        } 
        else if(this.state == 'InLong' && candleClosePrice > topLimit) this.signal = DecisionType.Sell // Abort Long
        else this.signal = DecisionType.Hold

        this.decideAct()
    }
}