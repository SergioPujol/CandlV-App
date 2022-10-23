import express from 'express'
import { processBot } from '../processBot'
import bodyParser from 'body-parser'
import cors from 'cors';
import { Bot } from '../Classes/Bot';

class Server {

    // Requests from ServerDB

    app: any = express();
    port: number = 3330;
    processBot: processBot;

    constructor(_processBot: processBot) {
        this.processBot = _processBot;
        
        this.app.use(cors());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
    }

    start() {

        this.app.get('/', (req: any, res: any) => {
            res.send('Express + TypeScript Server');
        });
        
        this.app.listen(this.port, () => {
            console.log(`[server]: Server on Server_Process is running at https://localhost:${this.port}`);
        });

        // Server DB

        this.app.post('/createBot', async (req: any, res: any) => { // Start bot
            const data = req.body; // ex {  }
            console.log('createBot', data)
            if(await this.processBot.addBot(data.chart_id, data.bot_id, data.bot_params, data.bot_options)) res.send({status:true})
            else res.send({status:false})
        });

        this.app.post('/resumeBot', async (req: any, res: any) => {
            const data = req.body; // ex {  }
            console.log('resumeBot', data)
            // 
        });

        this.app.post('/stopBot', async (req: any, res: any) => {
            const data = req.body; // ex {  }
            console.log('stopBot', data)
            // 
        });

        this.app.post('/deleteBot', async (req: any, res: any) => {
            const data = req.body; // ex {  }
            console.log('deleteBot', data)
            if(await this.processBot.deleteBot(data.bot_id)) res.send({status:true})
            else res.send({status:false})
        });

        // Web
        this.app.post('/simulation', async (req: any, res: any) => {
            const { data } = req.body; // ex {  }
            console.log('simulation', data)
            const bot = new Bot(data.bot_id, 'simulation-chart', data.symbol, data.interval, data.strategy, data.botOptions)
            const simulationData = await bot.startSimulation(data.period)
            if(simulationData) res.send({status: true, data: simulationData})
            else res.send({status: false, error:'Error with Simulation'})
        });
    }

}

export { Server }