import { Bot } from './Classes/Bot';

class processBot {

    bots: any = {}; // { bot_id: new Bot(params to create bot) }

    constructor() {
        this.bots;
    }

    async addBot(chart_id: string, bot_id: string, { status, symbol, interval, strategy }: any, botOptions: any) {
        console.log('addBot', bot_id, { status, symbol, interval, strategy }, botOptions )
        try {
            this.bots[bot_id] = new Bot(bot_id, chart_id, symbol, interval, strategy, botOptions);
            this.bots[bot_id].startBot()
            return true
        } catch (error) {
            console.log(`Error creating bot ${bot_id} on chart ${chart_id}`)
            return false
        }
    }

    deleteBot(bot_id: string) {
        try {
            this.bots[bot_id].deleteBot();
            delete this.bots[bot_id];
            return true
        } catch (error) {
            console.log(`Error deleting bot ${bot_id}`)
            return false
        }
    }

    stopBot(bot_id: string) {
        this.bots[bot_id].stopBot();
    }

    resumeBot(bot_id: string) {
        this.bots[bot_id].resumeBot();
    }

    getNumRunningBots() {
        return Object.keys(this.bots).length
    }
}

export { processBot }