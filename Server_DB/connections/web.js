const got = require('got');

const sendUpdateOperationOnWeb = async (data) => {
    return await webReq('updateOperation', data)
}

const webReq = async (req, data) => {
	const res = await got.post(`http://localhost:3000/${req}/`, { json: data });
	if(res.statusCode == 200 && JSON.parse(res.body).status) return true 
	return false
}

module.exports = {
	sendUpdateOperationOnWeb
}