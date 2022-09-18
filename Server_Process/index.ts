
import { processBot } from './processBot'
import { ServerDB } from './Servers/serverDB'

const bots = new processBot()
const serverDB = new ServerDB(bots)
serverDB.start()

// TODO

// Create simple method to test:
// createBot
// start
// stop
// deleteBot


/*const delay = (ms:any) => new Promise((resolve) => setTimeout(resolve, ms));

const tests = [{userId: 'user1', botId: 'bot1'}, {userId: 'user2', botId: 'bot2'}, {userId: 'user3', botId: 'bot3'}];

(async () => {
    tests.forEach(async (bot: any) => {
        bots.addBot(bot.userId, bot.botId, {})
        await delay(1000)
    })
})();

(async () => {
    await delay(1500)
    let botToStop = tests[1]
    bots.stopBot(botToStop.userId,botToStop.botId)
})();*/

