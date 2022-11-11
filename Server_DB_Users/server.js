const mongoose = require('mongoose')
const User = require('./routes/user')

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3101;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/user', async (req, res) => {
  const { method, data } = req.body; // ex { method: register, data: {username: 'admin' , plainTextPassword: 'psswd'} }
  res.send(await callUserMethod(method, data))
});

app.listen(port, () => console.log(`Server_DB listening on port ${port}!`));

mongoose.connect('mongodb://localhost:27017/candlv_users_desktop', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
});

const callUserMethod = (method, data) => {
  if(method == 'verify') return User.verify(data)
  //else if(method == 'checkToken') return User.checkToken(data)
  //else if(method == 'getIdByName') return User.getIdByName(data)
}