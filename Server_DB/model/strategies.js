const mongoose = require('mongoose')

const StrategiesSchema = new mongoose.Schema(
	{
		name: { type: String, unique: true, required: true },
		strategyObject: { type: Object, required: true },
		path: { type: String, required: true },
	},
	{ collection: 'strategies' }
)

const model = mongoose.model('StrategiesSchema', StrategiesSchema)

module.exports = model
