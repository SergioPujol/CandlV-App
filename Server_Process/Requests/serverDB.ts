const got = require('got');

class ServerDBRequest {
    private port = 3100;

    sendDBOperationUpdate = async (data: any) => {
        return await this.DBrequest('bot', { 
            method: 'updateOperationFromSP', data 
        })
    }

    sendDBAddTrade = async (data: any) => {
        return await this.DBrequest('bot', { 
            method: 'sendDBAddTrade', data 
        })
    }

    DBrequest = async (req: any, data: any) => {
        const res = await got.post(`http://localhost:${this.port}/${req}/`, { json: data });
        if(res.statusCode == 200 && JSON.parse(res.body).status) return true 
        return false
    }
}

export { ServerDBRequest }