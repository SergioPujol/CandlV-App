import { hello } from './helloworld';
import { expect } from 'chai';
import 'mocha';
import { Bot } from '../Classes/Bot';
import { Client } from '../Classes/Client';
const dotenv = require('dotenv');
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "./tests.env") })

describe('Hello function', () => {

  it('should return hello world', () => {
    const result = hello();
    expect(result).to.equal('Hello world!');
  });

});

const bot_settings = {
    client: false,
    id: 'testBot',
    chartId: 'testChart',
    symbol: 'BTCUSDT',
    interval: '5m',
    strategy: '2EMA',
    botOptions: { ema_short_period:"3", ema_long_period: "6"},
    investment: {
        "investmentType": "fixedInvestment",
        "quantity": "100"
    },
    isStrategyCustom: false
}

describe('Bot creation', () => {

    it('should create a client', () => {
        var client = new Client('', '', true)
    })

    it('should create a bot', () => {
        var client = new Client('', '', true)
        const bot = new Bot(client, bot_settings.id, bot_settings.chartId,bot_settings.symbol, bot_settings.interval, bot_settings.strategy, bot_settings.botOptions, bot_settings.investment)
    })
})