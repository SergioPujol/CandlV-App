const Bot = require('../model/bot');
const Chart = require('./chart')
const _ = require('lodash');

/**
 * TODO:
 * - create bot method -> start task on server process
 * - delete bot method -> delete bot task on server process
 * - change bot status -> if status false -> delete bot task on server process
 * - get bots from chart to load on trading html
 */

 const createBot = async (data) => {
    console.log('createBot')
    console.log(data)
    const { botId, botName, botStrategy, botOptions, botStatus, chartId } = data;
    
    const chart_id_relation = await Chart.getIdByChartId(chartId)
    if(!chart_id_relation) {
        return { status: 'error', error: 'Chart not found' }
    }

    try {
		const response = await Bot.create({
			bot_id: botId,
			bot_name: botName,
			bot_strategy: botStrategy,
			bot_strategy_options: botOptions,
			status: botStatus,
			chart_id: chartId,
			chart_id_relation,
		})
		console.log('Bot created successfully: ', response)
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return { status: 'error', error: 'Bot already exists' }
		}
		throw error
	}

	return { status: 'ok' }

}

const deleteBot = async (data) => {
    console.log('deleteBot')

    const { botId, chartId } = data;
    const chart_id = chartId, bot_id = botId;
    try {
		const response = await Bot.deleteOne({ bot_id, chart_id })
        console.log('Bot deleted: ', response)
        if(response.deletedCount == 0) {
            return { status: 'error', error: 'Chart trying to delete does not exist' }
        }
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return { status: 'error', error: 'Chart could not be deleted' }
		}
		throw error
	}
    
    return { status: 'ok' }
}

const getChartsBots = async (data) => {
    console.log('getChartsBots')

    const { chartId } = data
    const chart_id = chartId;

    const bots = await Bot.find({ chart_id })

    const data_charts = bots.map((bot) => {
        return {
            chartId,
			botId: bot.bot_id,
			name: bot.bot_name,
			strategy: bot.bot_strategy,
            botOptions: bot.bot_strategy_options,
            status: bot.status
        }
    })

    return { status: 'ok', data: data_charts }
}

const updateStatusBot = async (data) => {
    console.log('updateStatusBot')

	const { botId, chartId, status } = data;
    const chart_id = chartId, bot_id = botId;

    try {
		const response = await Bot.updateOne({ bot_id, chart_id }, { status })
        console.log('Bot updated: ', response)
        if(response.nModified == 0) {
            return { status: 'error', error: 'Bot trying to update does not exist' }
        }
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return { status: 'error', error: 'Bot could not be updated' }
		}
		throw error
	}

    return { status: 'ok' }
}

const updateOptionsBot = async (data) => {
    console.log('updateOptionsBot')

	/**Process
	 * 1. get bot by charts id and bot id
	 * 2. check if strategies from request and current on DB are the same
	 * 3. if are the same, dont do anything, status: ok
	 * 4. if not the same, SEND REQUEST TO SERVER PROCESS TO CHANGE BOT, 
	 * 5. IF request from server Process is OK, change on db
	*/

	const { botId, chartId, strategy, strategyOptions } = data;
	const chart_id = chartId, bot_id = botId;

	const bot = await Bot.findOne({ chart_id, bot_id, bot_strategy: strategy });

	if(bot) {
		if(_.isEqual(bot.bot_strategy_options, strategyOptions)) return { status: 'ok' }
		else {
			// Update values and send request to server process
			console.log('bot', bot)
			try {
				const response = await Bot.updateOne({ bot_id, chart_id, bot_strategy: strategy }, { bot_strategy_options: strategyOptions })
				console.log('Bot updated: ', response)
				if(response.nModified == 0) {
					return { status: 'error', error: 'Bot trying to update does not exist' }
				}
			} catch (error) {
				if (error.code === 11000) {
					// duplicate key
					return { status: 'error', error: 'Bot could not be updated' }
				}
				throw error
			}
		}
	}
	else return { status: 'error', error: 'Bot does not exist' }

    return { status: 'ok' }
}

const updateStrategyAndOptionsBot = async (data) => {
    console.log('updateOptionsBot')

	/* 
		changed strategy and options
	 */

    try {
		const response = await Chart.updateOne({ chart_id: data.chartId }, { chart_options: data.chartOptions })
        console.log('Chart updated: ', response)
        if(response.nModified == 0) {
            return { status: 'error', error: 'Chart trying to update does not exist' }
        }
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return { status: 'error', error: 'Chart could not be updated' }
		}
		throw error
	}

    return { status: 'ok' }
}

module.exports = {
	createBot,
	getChartsBots,
	deleteBot,
	updateStatusBot,
	updateOptionsBot
}