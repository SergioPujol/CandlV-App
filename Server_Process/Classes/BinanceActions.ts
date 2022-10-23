import { BinanceAPI } from "../Requests/BinanceAPI";
import CryptoJS from "crypto-js";
const k: string = 'lkgna8723nlkfmas23#11]sad';

class BinanceActions {

    publicKey: string;
    secretKey: string;

    constructor(_publicKey: string, _secretKey: string) {
        this.publicKey = CryptoJS.AES.decrypt(_publicKey, k);
        this.secretKey = CryptoJS.AES.decrypt(_secretKey, k);
    }

    buy() {

    }

    sell() {

    }
}

export { BinanceActions }