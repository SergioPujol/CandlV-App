const mongoose = require('mongoose')
const User = require('./routes/user')
const Chart = require('./routes/chart')
const Bot = require('./routes/bot')

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });

const app = express();
const port = process.env.PORT | 3100;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/user', async (req, res) => {
  const { method, data } = req.body; // ex { method: register, data: {username: 'admin' , plainTextPassword: 'psswd'} }
  res.send(await callUserMethod(method, data))
});

app.post('/chart', async (req, res) => {
  const { method, data } = req.body; // ex { method: register, data: {username: 'admin' , plainTextPassword: 'psswd'} }
  res.send(await callChartMethod(method, data))
});

app.post('/bot', async (req, res) => {
  const { method, data } = req.body; // ex { method: register, data: {username: 'admin' , plainTextPassword: 'psswd'} }
  res.send(await callBotMethod(method, data))
});

app.listen(port, () => console.log(`Server_DB listening on port ${port}!`));

mongoose.connect('mongodb://localhost:27017/candlv', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
});

(async () => {



})();

const callUserMethod = (method, data) => {
  if(method == 'register') return User.register(data)
  else if(method == 'login') return User.login(data)
  else if(method == 'checkToken') return User.checkToken(data)
  else if(method == 'getIdByName') return User.getIdByName(data)
}

const callChartMethod = (method, data) => {
  if(method == 'createChart') return Chart.createChart(data)
  else if(method == 'getCharts') return Chart.getUserCharts(data)
  else if(method == 'deleteChart') return Chart.deleteChart(data)
  else if(method == 'updateChart') return Chart.updateChart(data)
}

const callBotMethod = (method, data) => {
  if(method == 'createBot') return Bot.createBot(data)
  else if(method == 'deleteBot') return Bot.deleteBot(data)
  else if(method == 'updateStatusBot') return Bot.updateStatusBot(data)
  else if(method == 'updateStrategyOptionsBot') return Bot.updateOptionsBot(data)
  else if(method == 'getBots') return Bot.getChartsBots(data)
}