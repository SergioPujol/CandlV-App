import { Decision } from "../Models/decision";
import { ServerDBRequest } from "../Requests/serverDB";
import * as _ from 'lodash';

const serverDBRequests = new ServerDBRequest();

class Notification {

    private botId: string;
    private chartId: string;
    constructor(_botId: string, _chartId: string) {
        this.botId = _botId;
        this.chartId = _chartId;
    }

    private currentOperationStatus: { state: String, price: String, percentage: String } = { state: '', price: '', percentage: '' };

    sendNotification(decision: Decision) {
        
        // send trade to DB

        // send operation change to DB
        /* Or in Long, in Short or in await Entry */
        this.sendOperationChange(decision)

    }

    sendTrade(decision: Decision) {

    }

    sendOperationChange(decision: Decision) {
        const operation = { state: decision.state, price: decision.price, percentage: decision.percentage! };

        if(!_.isEqual(this.currentOperationStatus, operation)) {
            serverDBRequests.sendDBOperationUpdate({ botId: this.botId, chartId: this.chartId, operation})
        }

        this.currentOperationStatus = operation;
        
    }

}

export { Notification }