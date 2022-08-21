const Bot = require('../model/bot');
const Chart = require('./chart')

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

const updateOptionsBot = async (data) => {
    console.log('updateOptionsBot')

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

}