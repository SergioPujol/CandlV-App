import { Client } from "../Classes/Client";

export interface BotModel {
    client: Client | false; // not necessary of simulation

    botId: string;
    chartId: string;
    symbol: string;
    interval: string;
    strategy: string;
    botOptions: any;

    investment: { investmentType: string, quantity: string };
    simulationPeriod?: {from:string, to:string}; // only necessary for simulation
}