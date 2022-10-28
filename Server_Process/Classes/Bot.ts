import { BotModel } from '../Models/bot';
import { Client } from './Client';
import { DoubleEMA } from './Strategies_'
import { Strategy } from './Strategy';

class Bot {

    //APIKey: string;
    id: string = '';
    strategy: string = '';
    status: boolean = false;
    botOptions: any = {};
    symbol: string = '';
    interval: string = '';
    limit: string = '400';

    doubleEMA: DoubleEMA;

    botInterval: NodeJS.Timer | undefined;

    client: Client | false;

    private bot: BotModel;

    constructor(_client: Client | false, _id: string, chartId: string, _symbol: string, _interval: string, _strategy: string, /*_status,*/ _botOptions: any, _period: {from:string, to:string} | undefined = undefined) {

        this.client = _client

        this.id = _id;
        this.status = true;
        this.strategy = _strategy;
        this.botOptions = _botOptions;
        this.symbol = _symbol;
        this.interval = _interval;

        this.botInterval;

        this.doubleEMA = new DoubleEMA(_id, chartId);

        this.bot = {
            client: _client,
            botId: _id,
            chartId: chartId,
            symbol: _symbol,
            interval: _interval,
            strategy: _strategy,
            botOptions: _botOptions,
            ...(_period && ({
                simulationPeriod: _period
            }))
        }
    }

    async startBot() {
        console.log(`${this.getId()} - bot started`)
        let interval: number = parseInt(this.interval);
        let tWaitMilisecs = await this.getWaitStart(interval);
        const strategy = new Strategy(this.bot)
        await setTimeout(async () => {
            strategy.trading();
            this.botInterval = setInterval(()=>{
                strategy.trading();
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

    selectStrategy(strategy: string) {
        console.log(`${this.getId()} - bot running`)
        switch (strategy) {
            case '2EMA':
                return this.doubleEMA
        }

    }

    async startSimulation() {

        const strategy = new Strategy(this.bot, false, true)

        const simulationData = await strategy.simulation()

        return simulationData

    }

}

export { Bot }