import { BinanceAPI } from "../Requests/BinanceAPI";

class BinanceActions {

    publicKey: string;
    secretKey: string;

    constructor(_publicKey: string, _secretKey: string) {
        this.publicKey = _publicKey;
        this.secretKey = _secretKey
    }

    buy() {

    }

    sell() {

    }
}

export { BinanceActions }