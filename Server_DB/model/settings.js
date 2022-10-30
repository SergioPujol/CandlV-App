const mongoose = require('mongoose')

const SettingsSchema = new mongoose.Schema(
	{
		pb_bkey: { type: String, required: true },
		pv_bkey: { type: String, required: true },
		testnet: { type: Boolean, required: true }
	},
	{ collection: 'settings' }
)

const model = mongoose.model('SettingsSchema', SettingsSchema)

module.exports = model
