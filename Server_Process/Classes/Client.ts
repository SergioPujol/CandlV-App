import { BinanceAPI } from "../Requests/BinanceAPI";
import { createHmac } from "crypto";
import { getRequestInstance, createRequest, removeEmptyValue, buildQueryString } from './Utils'

const k: string = 'lkgna8723nlkfmas23#11]sad';



/** 
 * Spot
API Key: rIi4kvUydJRKaMJWKTM7X0uswxE03sbpTbtpH0oLDGZJRqrRO7OkaERis4Kq9hGx

Secret Key: fzi8NenRbF9oQ0Ox6MEy4MjvnzKOglCEvo3X19ugxrGKoTYu0RwEfTw4LEOS0pcL

 * Futures
API Key: 0c306f258d83e6caa5e7ee17a99a1292e88cf7a871d834bdcadb505354bd04d4

Secret Key: cc1f55d2c77535a187872e56efca0bf4caf55ca475af0cfaf0059ed70c0c3b5c
*/

class Client {

    //publicKey: string;
    //secretKey: string;

    client: any;
    private publicKey;
    private secretKey;

    constructor(_publicKey: string, _secretKey: string) {
        this.publicKey = 'rIi4kvUydJRKaMJWKTM7X0uswxE03sbpTbtpH0oLDGZJRqrRO7OkaERis4Kq9hGx'//CryptoJS.AES.decrypt(_publicKey, k);
        this.secretKey = 'fzi8NenRbF9oQ0Ox6MEy4MjvnzKOglCEvo3X19ugxrGKoTYu0RwEfTw4LEOS0pcL'//CryptoJS.AES.decrypt(_secretKey, k);
    }

    getUsdtBalance() {
        return this.signRequest(
            'GET',
            '/api/v3/account'
        ).then((res: any) => {
            if(res.status == 200) {
                return res.data.balances.find((asset: any) => asset.asset === 'USDT').free
            } else {
                return { error: 'Invalid Api Keys' } 
            }
        })
    }

    startLongOrder() {

    }

    startShortOrder() {

    }

    exitOrder() {
        
    }

    buy() {

    }

    sell() {

    }

    signRequest (method: any, path: any, params: any = {}) {
        params = removeEmptyValue(params)
        const timestamp = Date.now()
        const queryString = buildQueryString({ ...params, timestamp })
        const signature = createHmac('sha256', this.secretKey)
          .update(queryString)
          .digest('hex');

        console.log(`${queryString}&signature=${signature}`)
        return createRequest({
          method,
          baseURL: 'https://testnet.binance.vision/',
          url: `${path}?${queryString}&signature=${signature}`,
          apiKey: this.publicKey,
          timeout: 2500,
        })
      }
}

export { Client }