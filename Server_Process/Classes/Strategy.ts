import { Decision } from "../Models/decision";
import { BinanceActions } from "./BinanceActions";

abstract class Strategy {
    /** Class strategy, abstract strategy
     * Methods for Strategy
     * - decide -> depending on the type of decision, buy, sell, hold, etc ()
     * Necessary abstract methods for Strategy:
     * - Flow
     */
    private automationStatus: boolean = false;
    private binanceAction: BinanceActions | undefined;

    strategyName: string = '';

    constructor(_strategyName: string, automation: { status: boolean, credentials: { publicKey: string, secretKey: string } }, ) {
        this.strategyName = _strategyName;
        if(automation.status) {
            this.automationStatus = true;
            this.binanceAction = new BinanceActions(automation.credentials.publicKey, automation.credentials.secretKey)
        }
    }

    async decide(decision: Decision) {

    }

    abstract flow(any): Decision | undefined;
}

export { Strategy }