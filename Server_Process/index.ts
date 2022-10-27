
import { Client } from './Classes/Client'
import { processBot } from './processBot'
import { Server } from './Servers/server'
import { ServerDBRequest } from "./Requests/serverDB";

const serverDBRequests = new ServerDBRequest();

(async () => {
    const keys = await serverDBRequests.getApiKeys().then((res: any) => {
        if(res) {
            return res.keys;
        } else {
            return {
                pb_bkey: '',
                pv_bkey: ''
            }
        }
    });
    const client: Client = new Client(keys.pb_bkey, keys.pv_bkey);
    //await client.sell('BTCUSDT', 0.006)
    //await client.buy('BTCUSDT', 100)
    const balanceRequestTest = await client.getUsdtBalance();
    if(!balanceRequestTest?.error) console.log(balanceRequestTest);
    
    const bots = new processBot(client);
    const server = new Server(bots);
    server.start()
})();



/**tests 
import { DoubleEMA } from './Classes/Strategies';
const dE = new DoubleEMA();
(async () => {
    await dE.flowSimulation('test', 'BTCUSDT', '5', { from: '1662057685000', to: '1665081685000' }, {ema_short_period: 3, ema_long_period: 6})
})();*/
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

