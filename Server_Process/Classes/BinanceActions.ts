import { BinanceAPI } from "../Requests/BinanceAPI";
import CryptoJS from "crypto-js";
const got = require('got');
const { Spot } = require('@binance/connector')

const k: string = 'lkgna8723nlkfmas23#11]sad';

class BinanceActions {

    //publicKey: string;
    //secretKey: string;

    client: any;

    constructor(_publicKey: string, _secretKey: string) {
        const publicKey = CryptoJS.AES.decrypt(_publicKey, k);
        const secretKey = CryptoJS.AES.decrypt(_secretKey, k);

        this.client = new Spot(publicKey, secretKey, { baseURL: 'https://testnet.binance.vision'})

    }

    buy() {

    }

    sell() {

    }
}

export { BinanceActions }