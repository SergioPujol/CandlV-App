import { BotModel } from '../Models/bot';
import { getTimeRemainingToNextCandle } from '../Requests/BinanceAPI';
import { Client } from './Client';
import { Strategy } from './Strategy';

class Bot {

    //APIKey: string;
    id: string = '';    

    botInterval: NodeJS.Timer | undefined;

    client: Client | false;

    strategy: Strategy;
    private isStrategyCustom: boolean;

    private bot: BotModel;

    private isBotDeleted: Boolean = false;

    constructor(_client: Client | false, _id: string, chartId: string, _symbol: string, _interval: string, _strategy: string, _botOptions: any, _investment: { investmentType: string, quantity: string }, _isStrategyCustom: boolean = false, _period: {from:string, to:string} | undefined = undefined) {

        this.client = _client

        this.id = _id;

        this.botInterval;
        this.isStrategyCustom = _isStrategyCustom

        this.bot = {
            client: _client,
            botId: _id,
            chartId: chartId,
            symbol: _symbol.toUpperCase(),
            interval: _interval,
            strategy: _strategy,
            botOptions: _botOptions,
            investment: _investment,
            ...(_period && ({
                simulationPeriod: _period
            }))
        }

        this.strategy = new Strategy(this.bot, this.isStrategyCustom);
    }

    async startBot() {
        console.log(`${this.getId()} - bot started`)
        let interval: number = parseInt(this.bot.interval);
        let tWaitMilisecs = await this.getWaitStart();
        await setTimeout(async () => {
            if(this.isBotDeleted) return
            this.strategy.trading();
            this.botInterval = setInterval(()=>{
                this.strategy.trading();
            }, interval*1000*60);
        }, tWaitMilisecs);
    }

    async getWaitStart() {
        const nextCandleTimestamp = await getTimeRemainingToNextCandle(this.bot.symbol, this.bot.interval)
        if(nextCandleTimestamp) return nextCandleTimestamp - Date.now();
    }

    deleteBot() {
        this.isBotDeleted = true;
        clearInterval(this.botInterval)
    }

    isBotActive() {
        if(this.isBotDeleted) return false
        return true
    }

    getId() {
        return this.id
    }

    async startSimulation() {

        const strategy = new Strategy(this.bot, this.isStrategyCustom, true)

        const simulationData = await strategy.simulation()

        return simulationData

    }

    async stopOperation() {
        await this.strategy.stopClientOperation();
    }

    async startOperation() {
        await this.strategy.startClientOperation();
    }

}

export { Bot }