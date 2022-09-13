import { DoubleEMA } from './Strategies'
const doubleEMA = new DoubleEMA();

class Bot {

    //APIKey: string;
    id: string = '';
    strategy: string = '';
    status: boolean = false;
    botOptions: any = {};
    symbol: string = '';
    interval: string = '';
    limit: string = '400';

    botInterval: NodeJS.Timer | undefined;

    constructor(_id: string, _symbol, _interval, _strategy, /*_status,*/ _botOptions) {
        this.id = _id;
        this.status = false;
        this.strategy = _strategy;
        this.botOptions = _botOptions;
        this.symbol = _symbol;
        this.interval = _interval;

        this.botInterval;
    }

    async startBot() {
        console.log(`${this.getId()} - bot started`)
        let temporary_interval = 1
        await this.waitStart(temporary_interval);
        this.resumeBot()
        this.botInterval = setInterval(()=>{
            if(this.getStatus()) this.selectStrategy(this.strategy)!.flow(this.symbol, this.interval, this.limit, this.botOptions)
        }, temporary_interval*60) // change this time 
    }

    async waitStart(intervalMins: number) {
        var time = new Date(), timeRemaining = (intervalMins * 60 - time.getSeconds()) * intervalMins * 1000 + 200; //200 ms added to make sure is next Kandle
        console.log(`Waiting ${timeRemaining/1000} seconds to start`)
    }

    resumeBot() {
        if(!this.status) {
            console.log(`${this.getId()} - bot resumed`)
            this.status = true
        }
    }

    stopBot() {
        console.log(`${this.getId()} - bot stopped`)
        this.status = false
    }

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
            case 'DEMA':
                return doubleEMA
        }

    }

}

export { Bot }