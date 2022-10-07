import { Decision } from "../Models/decision";

class Notification {

    sendNotification(decision: Decision) {
        
    }

    sendSimulationDecisionList(decisionList: Decision[]) {
        console.log(decisionList)
    }

}

export { Notification }