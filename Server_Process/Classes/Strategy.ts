import { BotModel } from "../Models/bot";
import { Trade } from "../Models/trade";
import { Decision, DecisionType } from "../Models/decision";
import { Notification } from './Notification';
import { DEMA, MACD } from "./Strategies";
import { BinanceAPI } from "../Requests/BinanceAPI";
import { Candle } from "./Candle";
import { getPeriods } from "./Utils";

const binanceAPI = new BinanceAPI();

class Strategy {
    /** Class strategy, abstract strategy
     * Methods for Strategy
     * - decide -> depending on the type of decision, buy, sell, hold, etc ()
     * Necessary abstract methods for Strategy:
     * - Flow
     */

    private bot: BotModel;
    private symbolBoughtQuantity: number = 0;
    private lastEntryPrice: string = '';

    // Simulation
    private simulationList: Array<Decision> = []
    private simulationBool: Boolean = false;

    // Trading
    private notification: Notification | undefined;

    private selectedStrategy: DEMA | MACD;

    /* Strategies to be defined */
    private dema: DEMA;
    private macd: MACD;

    constructor(_bot: BotModel, customStrategy: Boolean = false , _simulation: Boolean = false) {
        this.bot = _bot
        if(_simulation) this.simulationBool = true;
        else this.notification = new Notification(this.bot.botId, this.bot.chartId);

        // Define Strategies
        this.dema = new DEMA(this.bot, this)
        this.macd = new MACD(this.bot, this)

        // selected strategy
        this.selectedStrategy = this.dema
        this.selectStrategy(this.bot.strategy)
    }

    async decide(decision: Decision) {
        console.log('decide', decision)
        if(this.simulationBool) {
            this.simulationList.push(decision)
        } else {
            // Operations
            // if buy, call buy - if sell, call sell
            // then, if respond its fine, sendNotification
            // if decision is hold or await, just sendNotification
            if(!this.bot.client || decision.decision === DecisionType.Hold) this.notification!.sendNotification(decision)
            else if(decision.decision === DecisionType.Buy) {
                await this.bot.client.buy(this.bot.symbol, this.calculateInvestment()).then((res: any) => {
                    if(!res) return
                    else {
                        const trade: Trade = {
                            type: 'BUY',
                            symbol: this.bot.symbol,
                            entry_price: res.fills[0].price,
                            percentage: '-',
                            symbol_quantity: res.executedQty,
                            usdt_quantity: res.cummulativeQuoteQty,
                            time: res.transactTime,
                            bot_strategy: this.bot.strategy,
                            bot_options: this.bot.botOptions,
                            chart_id: this.bot.chartId,
                            bot_id: this.bot.botId
                        }
                        // get values to send to Trade DB
                        this.lastEntryPrice = res.fills[0].price;
                        this.symbolBoughtQuantity = res.executedQty
                        this.notification!.sendNotification(decision, trade)
                    }
                })
            } else if(decision.decision === DecisionType.Sell) {
                if(this.symbolBoughtQuantity === 0) {
                    // not sell, because there is no previous bought
                    this.notification!.sendNotification(decision)
                } else {
                    await this.bot.client.sell(this.bot.symbol, this.symbolBoughtQuantity).then((res: any) => {
                        const trade: Trade = {
                            type: 'SELL',
                            symbol: this.bot.symbol,
                            entry_price: res.fills[0].price,
                            percentage: this.getPercentageFromLastCross(res.fills[0].price),
                            symbol_quantity: res.executedQty,
                            usdt_quantity: res.cummulativeQuoteQty,
                            time: res.transactTime,
                            bot_strategy: this.bot.strategy,
                            bot_options: this.bot.botOptions,
                            chart_id: this.bot.chartId,
                            bot_id: this.bot.botId
                        }
                        // get values to send to Trade DB
                        this.symbolBoughtQuantity = 0
                        this.notification!.sendNotification(decision, trade)
                    })
                }
            }
        }
    }

    private getPercentageFromLastCross(actualPrice: string): string {
        const lastPrice: number = parseFloat(this.lastEntryPrice);
        return (((parseFloat(actualPrice) - lastPrice) / lastPrice) * 100).toFixed(3) + '%'
    }

    private selectStrategy(strategyName: string) {
        switch (strategyName) {
            case '2EMA':
                this.selectedStrategy = this.dema
                break;
            case 'MACD':
                this.selectedStrategy = this.macd
                break;
            default:
                break;
        }
    }

    private async customStrategy() {
        // request strategy code
    }

    async trading() {
        console.log('trading')
        // get candles by calling BinanceAPI
        const candles = await binanceAPI.getCandlelist(this.bot.symbol, this.bot.interval, '400');
        this.selectedStrategy.flow(candles);
    }

    async simulation() {
        const period = this.bot.simulationPeriod;
        if(!period) return []
        // get values for simulation 
        // for each value call flow
        const { from, to } = { from: parseInt(period.from)/1000, to: parseInt(period.to)/1000 }
        var candles: Candle[] = []
        var nPeriods = getPeriods(from, to, parseInt(this.bot.interval)) + 400;
        var Tperiods = nPeriods;
        while(nPeriods > 1000) {
            candles = [...(await binanceAPI.getPeriodCandleList(this.bot.symbol, this.bot.interval, { from: ((to - (Tperiods - nPeriods + 1000)*60*parseInt(this.bot.interval)) * 1000).toString(), to: ((to - (Tperiods - nPeriods)*60*parseInt(this.bot.interval)) * 1000).toString() })), ...candles]
            nPeriods -= 1001
        }
        candles = [...(await binanceAPI.getPeriodCandleList(this.bot.symbol, this.bot.interval, { from: ((to - (Tperiods)*60*parseInt(this.bot.interval)) * 1000).toString(), to: ((to - (Tperiods - nPeriods)*60*parseInt(this.bot.interval)) * 1000).toString() })), ...candles]
        
        for(let i=0; i < (Tperiods - 400); i++) {
            this.selectedStrategy.flow(candles.slice(i, 402 + i))
        }

        return this.simulationList;

    }

    calculateInvestment() {
        var usdt = 0

        if(!this.bot.client) return 0

        // if investment is fixedInvesment, just return the quantity
        if(this.bot.investment.investmentType === 'fixedInvestment') {
            usdt = parseFloat(this.bot.investment.quantity)
        }
        // if investment is %, ask for USDT and get that %
        else if(this.bot.investment.investmentType === 'percentageInvestment') {
            this.bot.client.getUsdtBalance().then((res: any) => {
                usdt = res * parseFloat(this.bot.investment.quantity)/100
            })
        }
        return usdt;
    }

    async stopClientOperation() {
        await this.decide({
            decision: DecisionType.Sell,
            percentage: '',
            price: '',
            date: Date.now(),
            state: 'None'
        })
        this.selectedStrategy.changeState('None')
    }

    async startClientOperation() {
        await this.decide({
            decision: DecisionType.Buy,
            percentage: '0%',
            price: '',
            date: Date.now(),
            state: 'InLong'
        })
        this.selectedStrategy.changeState('InLong')
    }

}

export { Strategy }