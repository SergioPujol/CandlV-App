import { expect } from 'chai';
import 'mocha';
import 'sinon'
import { Bot } from '../Classes/Bot';
import { Client } from '../Classes/Client';
import { sleep } from '../Classes/Utils';
const dotenv = require('dotenv');
import path from "path";
import Sinon from 'sinon';

dotenv.config({ path: path.resolve(__dirname, "../../tests.env") })

describe('Simulation tests', function () {
    
    this.timeout(0) // disable timemouts on mocha 

    const bot_settings = {
        id: 'testSimulation',
        chartId: 'testChart',
        symbol: 'btcusdt',
        interval: '1',
        strategy: '2EMA',
        botOptions: { ema_short_period:"3", ema_long_period: "6"},
        investment: {
            "investmentType": "fixedInvestment",
            "quantity": "20"
        },
        isStrategyCustom: false
    }

    it('should create a bot for simulation from 03/11/2022 at 09:00 to 03/11/2022 at 21:00', async () => {
        const simulationBot = new Bot(false, bot_settings.id, bot_settings.chartId,bot_settings.symbol, bot_settings.interval, bot_settings.strategy, bot_settings.botOptions, bot_settings.investment, bot_settings.isStrategyCustom, { from: '1667466000', to: '1667509200' })
    })

    // it should get a list of trades --> create a simulation from 03/11/2022 at 09:00 to 03/11/2022 at 21:00 with 2EMA strategy and interval 5m and get list of values

    // it should get different list of trades --> changing the strategy

    // it should get different list of trades --> changing the strategy options

    // it should use a custom strategy --> create simulation with custom strategy

    // it should get an empty list of trades --> or with a non possible strategy or just 2ema with 3 and 200, so they will not close
    /*^^ ESTE OBJETO OBTIENE UNA LISTA VACIA PORQUE NO SE la ema de periodo largo va por encima durante todo la simulacion de la ema corta {
        "bot_id": "simulation-bot",
        "symbol": "BTCUSDT",
        "interval": "5",
        "period": {
            "to": 1667516400000,
            "from": 1667430000000
        },
        "strategy": "2EMA",
        "botOptions": {
            "ema_short_period": "50",
            "ema_long_period": "400"
        },
        "isStrategyCustom": false
    }*/
    
})