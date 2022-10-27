import { BotModel } from "../Models/bot";
import { Decision } from "../Models/decision";
import { Notification } from './Notification';
import { DEMA } from "./Strategies";
import { BinanceAPI } from "../Requests/BinanceAPI";

const binanceAPI = new BinanceAPI();

class Strategy {
    /** Class strategy, abstract strategy
     * Methods for Strategy
     * - decide -> depending on the type of decision, buy, sell, hold, etc ()
     * Necessary abstract methods for Strategy:
     * - Flow
     */

    private bot: BotModel;

    // Simulation
    private simulationList: Array<Decision> = []
    private simulationBool: Boolean = false;

    // Trading
    private notification: Notification | undefined;

    private selectedStrategy: DEMA /*| */;

    /* Strategies to be defined */
    private dema: DEMA

    constructor(_bot: BotModel, customStrategy: Boolean = false , _simulation: Boolean = false) {
        this.bot = _bot
        if(_simulation) this.simulationBool = true;
        else this.notification = new Notification(this.bot.botId, this.bot.chartId);

        // Define Strategies
        this.dema = new DEMA(this.bot, this)

        // selected strategy
        this.selectedStrategy = this.dema
        this.selectStrategy(this.bot.strategy)
    }

    async decide(decision: Decision) {
        if(this.simulationBool) {
            this.simulationList.push(decision)
        } else {
            // Operations
            // Notification
            this.notification!.sendNotification(decision)
        }
    }

    private selectStrategy(strategyName: string) {
        switch (strategyName) {
            case '2EMA':
                this.selectedStrategy = this.dema
                break;
        
            default:
                break;
        }
    }

    private async customStrategy() {
        // request strategy code
    }

    async trading() {
        // get candles by calling BinanceAPI
        const candles = await binanceAPI.getCandlelist(this.bot.symbol, this.bot.interval, '400');
        this.selectedStrategy.flow(candles);
    }

    async simulation() {

        // get values for simulation 
        // for each value call flow


        this.selectedStrategy.flow([]) 

        return this.simulationList
    }

    //abstract flow(any): void;

    /*abstract flowTrading(any): Decision | undefined; // Flow function for trading
    // decide will execute order

    abstract flowSimulation(any): Array<Decision> | undefined; // Flow function for simulation
    // decide will not execute any order*/
}

export { Strategy }