const mongoose = require('mongoose')

const ChartSchema = new mongoose.Schema(
	{
		bot_id: { type: String, required: true, unique: true },
        bot_name: { type: String, required: true },
		bot_options: { type: Object, required: true },
        /** bot_options example
         * {
         *  strategy: '2EMA',
         *  ema_short_period: 3, // default value
         *  ema_long_period: 6 // default value
         * }
         */
		status: { type: Boolean, required: true },
		chart_id: { type: mongoose.Schema.ObjectId, ref: 'ChartSchema', required: true },
        //TODO: Change ^^ type, is not the ObjectId of Charts, is the chart_id
    },
	{ collection: 'bots' }
)

const model = mongoose.model('BotSchema', ChartSchema)

module.exports = model
