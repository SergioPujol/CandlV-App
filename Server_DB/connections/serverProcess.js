const got = require('got');

const sendCreateBot = async (data) => {
    return await serverDBReq('createBot', data)
}

const serverDBReq = async (req, data) => {
	const res = await got.post(`http://localhost:3330/${req}/`, { json: data });
	if(res.statusCode == 200 && res.data.status) return true 
	return false
}

module.exports = {
    sendCreateBot,
}