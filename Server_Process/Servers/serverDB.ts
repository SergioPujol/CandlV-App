import express from 'express'


class ServerDB {

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
    }

}

export { ServerDB }