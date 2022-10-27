import { BinanceAPI } from "../Requests/BinanceAPI";
import { createHmac } from "crypto";
import { getRequestInstance, createRequest, removeEmptyValue, buildQueryString } from './Utils';
import { Order, Side, Type } from "../Models/order";
const cryptojs = require('crypto-js')

const k: string = 'lkgna8723nlkfmas23#11]sad';



/** 
 * Spot
API Key: rIi4kvUydJRKaMJWKTM7X0uswxE03sbpTbtpH0oLDGZJRqrRO7OkaERis4Kq9hGx

Secret Key: fzi8NenRbF9oQ0Ox6MEy4MjvnzKOglCEvo3X19ugxrGKoTYu0RwEfTw4LEOS0pcL
*/

class Client {

    //publicKey: string;
    //secretKey: string;

    client: any;
    private publicKey;
    private secretKey;

    constructor(_publicKey: string, _secretKey: string) {
        this.publicKey = _publicKey ? cryptojs.AES.decrypt(_publicKey, k).toString(cryptojs.enc.Utf8) : '';
        this.secretKey = _secretKey ? cryptojs.AES.decrypt(_secretKey, k).toString(cryptojs.enc.Utf8) : '';
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

    buy(symbol: string, usdtQuantity: number) {
        let order: Order = {
            symbol: symbol,
            side: Side.BUY,
            type: Type.MARKET,
            quoteOrderQty: usdtQuantity
        }
        return this.signRequest(
            'POST',
            '/api/v3/order',
            order
        ).then((res: any) => {
            console.log('data', res.data)
            console.log('quantity', res.data.executedQty)
            console.log('buy price', res.data.fills[0].price)
        })
    }

    sell(symbol: string, symbolQuantity: number) {
        let order: Order = {
            symbol: symbol,
            side: Side.SELL,
            type: Type.MARKET,
            quantity: symbolQuantity
        }
        return this.signRequest(
            'POST',
            '/api/v3/order',
            order
        ).then((res: any) => {
            console.log(res.data)
        })
    }

    signRequest (method: any, path: any, params: any = {}): any {
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