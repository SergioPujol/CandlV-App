import { Bot } from './Classes/Bot';

class processBot {

    bots: any = {}; // { user_id: { bot_id: new Bot(params to create bot) } }

    constructor() {
        this.bots;
    }

    addBot(user_id: string, bot_id: string, bot: any) {
        if(!this.bots[user_id]) this.bots[user_id] = {}
        this.bots[user_id][bot_id] = new Bot(bot_id);
        this.bots[user_id][bot_id].startBot()
    }

    deleteBot(user_id: string, bot_id: string) {
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