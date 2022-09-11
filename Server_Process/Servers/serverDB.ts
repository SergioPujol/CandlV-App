import express from 'express'


class ServerDB {

    // Requests from ServerDB

    app: any = express();
    port: number = 3330

    constructor() {

    }

    start() {
        this.app.get('/', (req: any, res: any) => {
            res.send('Express + TypeScript Server');
        });
        
        this.app.listen(this.port, () => {
            console.log(`[server]: ServerDB on Server_Process is running at https://localhost:${this.port}`);
        });

        this.app.post('/createBot', async (req, res) => { // Start bot
            const { data } = req.body; // ex {  }
            console.log('createBot', data)
            // 
        });

        this.app.post('/resumeBot', async (req, res) => {
            const { data } = req.body; // ex {  }
            console.log('resumeBot', data)
            // 
        });

        this.app.post('/stopBot', async (req, res) => {
            const { data } = req.body; // ex {  }
            console.log('stopBot', data)
            // 
        });

        this.app.post('/deleteBot', async (req, res) => {
            const { data } = req.body; // ex {  }
            console.log('createBot', data)
            // 
        });
    }

}

export { ServerDB }