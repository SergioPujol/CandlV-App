import { Bot } from './Classes/Bot';
import { Client } from './Classes/Client';

class processBot {

    bots: any = {}; // { bot_id: new Bot(params to create bot) }
    client: Client;

    constructor(_client: Client) {
        this.bots;
        this.client = _client;
    }

    async addBot(chart_id: string, bot_id: string, { status, symbol, interval, strategy, isStrategyCustom }: any, botOptions: any, investment: { investmentType: string, quantity: string }) {
        try {
            this.bots[bot_id] = new Bot(this.client, bot_id, chart_id, symbol, interval, strategy, botOptions, investment, isStrategyCustom);
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
            console.log(`Error deleting bot on Server Process ${bot_id}`)
            return true
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

    async stopBotOperation(bot_id: string) {
        try {
            await this.bots[bot_id].stopOperation();
            return true
        } catch (error) {
            return false
        }
    }

    async startBotOperation(bot_id: string) {
        try {
            await this.bots[bot_id].startOperation();
            return true
        } catch (error) {
            return false
        }
    }
}

export { processBot }