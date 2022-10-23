const User = require('../model/user');

const verify = async (data) => {
    console.log('login')
    const { key, instanceID } = data
    const userData = await User.findOne({ key }).lean()
	console.log(userData)
	if (!userData) {
		return { status: 'error', error: 'Invalid key' }
	}

	if(userData.instanceID === '') {
		// put instanceID
		const response = await updateInstace(key, instanceID)
		console.log('User instace updated: ', response)
		if(response.nModified == 0) return { status: 'error', error: 'Bot trying to update does not exist' }
		return { status: 'ok' }
	} else if(userData.instanceID === instanceID) {
		return { status: 'ok' }
	} else if(userData.instanceID != instanceID) {
		return { status: 'error', error: 'Key already being used, contact support for reseting the key' }
	}
    
}

const updateInstace = async (key, instanceID) => {
	return await User.updateOne({ key }, { instanceID })
} 

module.exports = {
    verify
}