const mongoose = require('mongoose')

const ChartSchema = new mongoose.Schema(
	{
		chart_id: { type: String, required: true, unique: true },
		chart_options: { type: {
            symbol: String,
            interval: String
        }, required: true },
		minimized: { type: Boolean, required: true },
		//user_id: { type: mongoose.Schema.ObjectId, ref: 'UserSchema', required: true },
	},
	{ collection: 'charts' }
)

const model = mongoose.model('ChartSchema', ChartSchema)

module.exports = model
