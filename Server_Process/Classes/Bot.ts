import { BotModel } from '../Models/bot';
import { Client } from './Client';
import { Strategy } from './Strategy';

class Bot {

    //APIKey: string;
    id: string = '';    

    botInterval: NodeJS.Timer | undefined;

    client: Client | false;

    private strategy: Strategy;
    private isStrategyCustom: boolean;

    private bot: BotModel;

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
        let tWaitMilisecs = await this.getWaitStart(interval);
        await setTimeout(async () => {
            this.strategy.trading();
            this.botInterval = setInterval(()=>{
                this.strategy.trading();
            }, interval*1000*60);
        }, tWaitMilisecs);
    }

    async getWaitStart(intervalMins: number) {
        var time = new Date(), timeRemaining = (intervalMins * 60 - time.getSeconds()) * 1000 + 200; //200 ms added to make sure is next Kandle
        console.log(`Waiting ${timeRemaining/1000} seconds to start`)
        return timeRemaining;
    }

    deleteBot() {
        clearInterval(this.botInterval)
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