const mongoose = require('mongoose')
const User = require('./routes/user')

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });

const app = express();
const port = process.env.PORT;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/user', async (req, res) => {
  const { method, data } = req.body; // ex { method: register, data: {username: 'admin' , plainTextPassword: 'psswd'} }
  res.send(await callUserMethod(method, data))
});

app.listen(port, () => console.log(`Server_DB listening on port ${port}!`));

mongoose.connect('mongodb://localhost:27017/candlv', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
});

(async () => {

  /**/

  //console.log(await User.login({username: 'admin', password: 'admin'}))

})();

const callUserMethod = (method, data) => {
  if(method == 'register') return User.register(data)
  else if(method == 'login') return User.login(data)
  else if(method == 'checkToken') return User.checkToken(data)
  //else if(method == 'change-password') return User.login
}