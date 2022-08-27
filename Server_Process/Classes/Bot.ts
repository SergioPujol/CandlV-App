class Bot {

    //APIKey: string;
    id: string = '';
    strategy: string = '';
    status: boolean = false;
    botOptions: any = {};
    symbol: string = '';
    interval: string = '';

    botInterval: NodeJS.Timer | undefined;

    constructor(_id: string/*, _strategy, _status, _botOptions, _symbol, _interval*/) {
        this.id = _id;
        this.status = false;
        /*this.strategy = _strategy;
        this.botOptions = _botOptions;
        this.symbol = _symbol;
        this.interval = _interval;*/

        this.botInterval;
    }

    startBot() {
        console.log(`${this.getId()} - bot started`)
        this.resumeBot()
        this.botInterval = setInterval(()=>{
            if(this.getStatus()) console.log(`${this.getId()} - bot running`)
        }, 2500) // change this time 
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

}

export { Bot }