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
        interval: '5',
        strategy: '2EMA',
        botOptions: { ema_short_period:"3", ema_long_period: "6"},
        investment: {
            "investmentType": "fixedInvestment",
            "quantity": "20"
        },
        isStrategyCustom: false
    }

    it('should create a bot for simulation from 03/11/2022 at 09:00 to 03/11/2022 at 21:00', async () => {
        const simulationBot = new Bot(false, bot_settings.id, bot_settings.chartId,bot_settings.symbol, bot_settings.interval, bot_settings.strategy, bot_settings.botOptions, bot_settings.investment, bot_settings.isStrategyCustom, { from: '1667462400000', to: '1667505600000' })
        expect(simulationBot.isBotSimulation()).to.be.true;
    })

    // it should get a list of trades --> create a simulation from 03/11/2022 at 09:00 to 03/11/2022 at 21:00 with 2EMA strategy and interval 5m and get list of values
    it('should get a list of 72 trades by simulating from 03/11/2022 at 09:00 to 03/11/2022 at 21:00 with 2EMA strategy and interval 5m', async () => {
        const simulationBot = new Bot(false, bot_settings.id, bot_settings.chartId, bot_settings.symbol, bot_settings.interval, bot_settings.strategy, bot_settings.botOptions, bot_settings.investment, bot_settings.isStrategyCustom, { from: '1667462400000', to: '1667505600000' })
        const simulationData = await simulationBot.startSimulation();
        expect(simulationData.length).to.equal(72)
    })

    // it should get same list of trades --> same configuration
    it('should get a 2 different data lists if the simulation strategy configuration is different, 2EMA with Short Period: 3, Long Period: 6 and 2EMA with Short Period: 10, Long Period: 21', async () => {
        const simulationBot1 = new Bot(false, bot_settings.id, bot_settings.chartId, bot_settings.symbol, bot_settings.interval, bot_settings.strategy, { ema_short_period:"3", ema_long_period: "6"}, bot_settings.investment, bot_settings.isStrategyCustom, { from: '1667462400000', to: '1667505600000' })
        const simulationBot2 = new Bot(false, bot_settings.id, bot_settings.chartId, bot_settings.symbol, bot_settings.interval, bot_settings.strategy, { ema_short_period:"3", ema_long_period: "6"}, bot_settings.investment, bot_settings.isStrategyCustom, { from: '1667462400000', to: '1667505600000' })
        const simulationData1 = await simulationBot1.startSimulation();
        const simulationData2 = await simulationBot2.startSimulation();
        expect(simulationData1.length == simulationData2.length).to.be.true;
    })

    // it should get different list of trades --> changing the strategy
    it('should get a 2 different data lists if the simulation strategy configuration is different, 2EMA with Short Period: 3, Long Period: 6 and 2EMA with Short Period: 10, Long Period: 21', async () => {
        const simulationBot1 = new Bot(false, bot_settings.id, bot_settings.chartId, bot_settings.symbol, bot_settings.interval, bot_settings.strategy, { ema_short_period:"3", ema_long_period: "6"}, bot_settings.investment, bot_settings.isStrategyCustom, { from: '1667462400000', to: '1667505600000' })
        const simulationBot2 = new Bot(false, bot_settings.id, bot_settings.chartId, bot_settings.symbol, bot_settings.interval, bot_settings.strategy, { ema_short_period:"10", ema_long_period: "21"}, bot_settings.investment, bot_settings.isStrategyCustom, { from: '1667462400000', to: '1667505600000' })
        const simulationData1 = await simulationBot1.startSimulation();
        const simulationData2 = await simulationBot2.startSimulation();
        expect(simulationData1.length == simulationData2.length).to.be.false;
    })

    // it should get different list of trades --> changing the strategy options
    it('should get a 2 different data lists if the simulation strategy used is different, first Simulation with 2EMA and second Simulation with MACD, both with default values', async () => {
        const simulationBot1 = new Bot(false, bot_settings.id, bot_settings.chartId, bot_settings.symbol, bot_settings.interval, '2EMA', { ema_short_period:"3", ema_long_period: "6"}, bot_settings.investment, bot_settings.isStrategyCustom, { from: '1667462400000', to: '1667505600000' })
        const simulationBot2 = new Bot(false, bot_settings.id, bot_settings.chartId, bot_settings.symbol, bot_settings.interval, 'MACD', {ema_short_period: "12",ema_long_period: "26",signal_period: "9" }, bot_settings.investment, bot_settings.isStrategyCustom, { from: '1667462400000', to: '1667505600000' })
        const simulationData1 = await simulationBot1.startSimulation();
        const simulationData2 = await simulationBot2.startSimulation();
        expect(simulationData1.length == simulationData2.length).to.be.false;
    })

    // it should get an empty list of trades --> or with a non possible strategy or just 2ema with 3 and 200, so they will not close
    it('should get a empty list of trades by simulating from 03/11/2022 at 00:00 to 04/11/2022 at 00:00 with 5m interval and the following bot configuration: Strategy 2EMA, Short Period 50, Long Period: 400', async () => {
        const simulationBot = new Bot(false, bot_settings.id, bot_settings.chartId, bot_settings.symbol, bot_settings.interval, '2EMA', { ema_short_period:"50", ema_long_period: "400"}, bot_settings.investment, bot_settings.isStrategyCustom, { from: '1667430000000', to: '1667516400000' })
        const simulationData = await simulationBot.startSimulation();
        expect(simulationData.length).to.equal(0)
    })

    // it should use a custom strategy --> create simulation with custom strategy
    it('should iniciate a simulation with a custom strategy')
    
})