const Trade = require('../model/trade');
const Web = require('../connections/web');
const Bot = require('./bot')

const createTrade = async (data) => {
    // Request from ServerProcess: create trade on the db and send trade to web
    console.log('createTrade');
    const { type, symbol, entry_price, symbol_quantity, usdt_quantity, time, bot_strategy, bot_options, chart_id, bot_id } = data;
    var trade_id = '';

    const bot_name = await Bot.getBotNameByBotId(bot_id);

    try {
        const response = await Trade.create({ type, symbol, entry_price, symbol_quantity, usdt_quantity, time, bot_strategy, bot_options, chart_id, bot_id, bot_name: bot_name ? bot_name : '' })
        trade_id = response._id
		console.log('Trade created successfully: ', response)
    } catch (error) {
        if (error.code === 11000) {
			// duplicate key
			return { status: 'error', error: 'Trade could not be created' }
		}
		throw error
    }

    const webRes = await Web.sendAddTradeOnWeb({ type, symbol, entry_price, symbol_quantity, usdt_quantity, time, bot_strategy, bot_options, chart_id, bot_id, bot_name, trade_id })

    if(webRes) return { status: 'ok' }
    return { status: 'error', error: 'Operation could not be updated on Web' }
}

const getAllTrades = async () => {
    // get all trades
    const trades = await Trade.find({ })

    return trades
}

const getLast20Trades = async () => {
    // get some trades to display on the web
    const first20Trades = (await getAllTrades()).slice(0, 20);
    return { status: 'ok', data: first20Trades }
}

const deleteTrade = async (data) => {

}

module.exports = {
	createTrade,
    getLast20Trades,
    deleteTrade,
}