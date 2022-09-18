import { DoubleEMA } from './Strategies'

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

    constructor(_id: string, _symbol: string, _interval: string, _strategy: string, /*_status,*/ _botOptions: any) {
        this.id = _id;
        this.status = false;
        this.strategy = _strategy;
        this.botOptions = _botOptions;
        this.symbol = _symbol;
        this.interval = _interval;

        this.botInterval;

        this.doubleEMA = new DoubleEMA();
    }

    async startBot() {
        console.log(`${this.getId()} - bot started`)
        let interval: number = parseInt(this.interval);
        let tWaitMilisecs = await this.getWaitStart(interval);
        await setTimeout(async () => {
            this.resumeBot();
            if(this.getStatus()) this.selectStrategy(this.strategy)!.flow(this.getId(), this.symbol, this.interval, this.limit, this.botOptions)
            this.botInterval = setInterval(()=>{
                if(this.getStatus()) this.selectStrategy(this.strategy)!.flow(this.getId(), this.symbol, this.interval, this.limit, this.botOptions)
            }, interval*1000*60) // change this time 
        }, tWaitMilisecs);
    }

    async getWaitStart(intervalMins: number) {
        var time = new Date(), timeRemaining = (intervalMins * 60 - time.getSeconds()) * 1000 + 200; //200 ms added to make sure is next Kandle
        console.log(`Waiting ${timeRemaining/1000} seconds to start`)
        return timeRemaining;
    }

    // TODO: necessary??? 
    resumeBot() {
        if(!this.status) {
            console.log(`${this.getId()} - bot resumed`)
            this.status = true
        }
    }

    /*stopBot() {
        console.log(`${this.getId()} - bot stopped`)
        this.status = false
    }*/

    deleteBot() {
        clearInterval(this.botInterval)
    }

    getStatus() {
        return this.status
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

}

export { Bot }