import { Bot } from './Classes/Bot';

class processBot {

    bots: any = {}; // { user_id: { bot_id: new Bot(params to create bot) } }

    constructor() {
        this.bots;
    }

    addBot(user_id: string, bot_id: string, { status, symbol, interval, strategy }, botOptions: any) {
        try {
            if(!this.bots[user_id]) this.bots[user_id] = {}
            this.bots[user_id][bot_id] = new Bot(bot_id, symbol, interval, strategy, botOptions);
            this.bots[user_id][bot_id].startBot()
        } catch (error) {
            console.log(`Error creating bot ${bot_id} for user ${user_id}`)
            return false
        }
    }

    deleteBot(user_id: string, bot_id: string) {
        this.bots[user_id][bot_id].deleteBot();
        delete this.bots[user_id][bot_id];
        if(Object.keys(this.bots[user_id].length == 0)) delete this.bots[user_id];
    }

    stopBot(user_id: string, bot_id: string) {
        this.bots[user_id][bot_id].stopBot();
    }

    resumeBot(user_id: string, bot_id: string) {
        this.bots[user_id][bot_id].resumeBot();
    }

    getNumUsersRunningBots() {
        return Object.keys(this.bots).length
    }

    getNumRunningBots() {
        let cont = 0
        Object.keys(this.bots).forEach((user: any) => {
            cont += Object.keys(user).length
        })
        return cont
    }

    getNumRunningBotsByUser(user_id: string) {
        return Object.keys(this.bots[user_id]).length
    }
}

export { processBot }