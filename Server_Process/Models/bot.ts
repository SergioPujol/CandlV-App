import { Client } from "../Classes/Client";

export interface BotModel {
    client: Client;
    botId: string;
    chartId: string;
    symbol: string;
    interval: string;
    strategy: string;
    botOptions: any;

    simulationPeriod?: {from:string, to:string};
}