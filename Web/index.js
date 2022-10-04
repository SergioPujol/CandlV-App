const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const got = require('got');

const app = express();
const router = express.Router();

const port = 3000;

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/', router);
app.use(bodyParser.json());

router.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/public/home.html'));
    //__dirname : It will resolve to your project folder.
});

app.post('/api/login', async (req, res) => {
	return await res.json(await serverDBReq('user', {
		method: 'login',
		data: req.body
	}))
})


app.post('/api/register', async (req, res) => {
	const { username, password: plainTextPassword } = req.body

	if (!username || typeof username !== 'string') {
		return res.json({ status: 'error', error: 'Invalid username' })
	}

	if (!plainTextPassword || typeof plainTextPassword !== 'string') {
		return res.json({ status: 'error', error: 'Invalid password' })
	}

	if (plainTextPassword.length < 5) {
		return res.json({
			status: 'error',
			error: 'Password too small. Should be atleast 6 characters'
		})
	}

	return await res.json(await serverDBReq('user', {
		method: 'register',
		data: { username, plainTextPassword }
	}))
})

app.post('/api/checktoken', async (req, res) => {
	return await res.json(await serverDBReq('user', {
		method: 'checkToken',
		data: req.body
	}))
})

app.post('/api/createChart', async (req, res) => {
	return await res.json(await serverDBReq('chart', {
		method: 'createChart',
		data: req.body
	}))
})

app.post('/api/getCharts', async (req, res) => {
	return await res.json(await serverDBReq('chart', {
		method: 'getCharts',
		data: req.body
	}))
})

app.post('/api/deleteChart', async (req, res) => {
	return await res.json(await serverDBReq('chart', {
		method: 'deleteChart',
		data: req.body
	}))
})

app.post('/api/updateChart', async (req, res) => {
	return await res.json(await serverDBReq('chart', {
		method: 'updateChart',
		data: req.body
	}))
})

app.post('/api/createBot', async (req, res) => {
	return await res.json(await serverDBReq('bot', {
		method: 'createBot',
		data: req.body
	}))
})

app.post('/api/deleteBot', async (req, res) => {
	return await res.json(await serverDBReq('bot', {
		method: 'deleteBot',
		data: req.body
	}))
})

app.post('/api/updateStatusBot', async (req, res) => {
	return await res.json(await serverDBReq('bot', {
		method: 'updateStatusBot',
		data: req.body
	}))
})

app.post('/api/updateStrategyOptionsBot', async (req, res) => {
	return await res.json(await serverDBReq('bot', {
		method: 'updateStrategyOptionsBot',
		data: req.body
	}))
})

app.post('/api/getBots', async (req, res) => {
	return await res.json(await serverDBReq('bot', {
		method: 'getBots',
		data: req.body
	}))
})

// Post Server Process for the simulation
app.post('/api/simulation', async (req, res) => {
	
})

app.listen(port, () => console.log(`Server_DB listening on port ${port}!, http://localhost:${port}`));

const serverDBReq = async (req, data) => {
	const res = await got.post(`http://localhost:3100/${req}/`, { json: data });
	if(res.statusCode == 200) return JSON.parse(res.body)
	return { status: 'error', error: 'Server not available' }
}