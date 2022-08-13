const Chart = require('../model/chart');
const User = require('./user')

const createChart = async (data) => {
    console.log('createChart')

    const { chartId, chartOptions, minimized, username } = data
    /**Pasos a realizar
     * 1. Obtener usuario en el que se va a crear la chart con el String username
     * 2. Comprobar el usuario
     * 3. Obtener id del usuario en cuestion
     * 4. Crear chart en bbdd con los datos correspondientes
     */
    
    const user_id = await User.getIdByName(username)
    if(!user_id) {
        return { status: 'error', error: 'User not found' }
    }

    try {
		const response = await Chart.create({
			chart_id: chartId,
            chart_options: chartOptions,
            minimized,
			user_id
		})
		console.log('Chart created successfully: ', response)
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return { status: 'error', error: 'Chart already exists' }
		}
		throw error
	}

	return { status: 'ok' }

}

const getUserCharts = async (data) => {
    console.log('getUserCharts')

    const { username } = data
    const user_id = await User.getIdByName(username)
    if(!user_id) {
        return { status: 'error', error: 'User not found' }
    }

    const charts = await Chart.find({ user_id })

    const data_charts = charts.map((chart) => {
        return {
            chartId: chart.chart_id,
            chartOptions: chart.chart_options,
            minimized: chart.minimized
        }
    })

    return { status: 'ok', data: data_charts }
}

const deleteChart = async (data) => {
    console.log('getUserCharts')

    const { username, chartId } = data;
    const chart_id = chartId;
    const user_id = await User.getIdByName(username)
    if(!user_id) {
        return { status: 'error', error: 'User not found' }
    }
    console.log({ user_id, chart_id })
    try {
		const response = await Chart.deleteOne({ user_id, chart_id })
        console.log('Chart deleted: ', response)
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

module.exports = {
    createChart,
    getUserCharts,
    deleteChart
}