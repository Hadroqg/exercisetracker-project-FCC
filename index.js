const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

let users = [];
let exercises = [];
let logs = [];

app.use(cors());
app.use("/", bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/users/:_id/logs', (req, res) => {
  let idLogs = req.params._id;
  let ind = logs.findIndex(u => { return u._id == idLogs; });

  console.log(req.query);

  let from = (new Date(req.query.from)).toDateString();
  let to = (new Date(req.query.to)).toDateString();
  let limit = parseInt(req.query.limit);
  let arr;

  let objLogs = {
    username: users[ind].username,
    _id: users[ind]._id
  };

  if (from && from != "Invalid Date") {
    arr = logs[ind].log.filter(x => new Date(x.date) >= new Date(from));
    objLogs.from = from;
  }

  if (to && to != "Invalid Date") {
    arr = (arr ? arr : logs[ind].log);
    arr = arr.filter(x => new Date(x.date) <= new Date(to));
    objLogs.to = to;
  }

  if (limit && !isNaN(limit)) {
    arr = (arr ? arr : logs[ind].log);
    arr = (limit >= arr.lenth ? arr.slice(0, arr.lenth) : arr.slice(0, limit));
  }

  if (Object.keys(req.query).length > 0) {
    objLogs.count = (arr ? arr.length : logs[ind].log.length);
    objLogs.log = (arr ? arr : logs[ind].log);
    res.json(objLogs);
  }
  else {
    res.json(logs[ind]);
  }

});

app.post('/api/users', (req, res) => {
  let username = req.body.username;
  let id = Math.floor(Math.random() * 99999);
  let obj = { username: username, _id: id.toString() };
  users.push(obj);

  let UserLog = JSON.parse(JSON.stringify(obj));
  UserLog.count = 0;
  UserLog.log = [];
  logs.push(UserLog);

  res.json(obj);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  let userId = req.params._id;
  let description = req.body.description;
  let duration = parseInt(req.body.duration);
  let date = (req.body.date ? new Date(req.body.date) : new Date()).toDateString();

  let user = users.findIndex(u => { return u._id == userId; });

  if (isNaN(duration)) { return res.send('"duration" must be a number.') }
  if (user < 0) { return res.send('id do not match with any user.') }
  if (date == "Invalid Date") { return res.send('"date" must be a valid date.') }

  let obj = {
    _id: userId,
    username: users[user].username,
    description: description,
    duration: duration,
    date: date,
  };

  exercises.push(obj);
  logs[user].count += 1;
  logs[user].log.push(obj);

  res.json(obj);
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
