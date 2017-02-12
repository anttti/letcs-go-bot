const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

const express = require('express');
const logger = require('winston');
const TelegramBot = require('node-telegram-bot-api');
const Brain = require('./brain');
const packageInfo = require('./package.json');

const telegram = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

telegram.onText(/^\/status/, (message) => {
  Brain.status(telegram, { message });
});

telegram.onText(/^\/go/, (message) => {
  Brain.register(telegram, { message });
});

// telegram.onText(/^\/go (.+)$/, (message, match) => {
//   Brain.register(telegram, { message, timeout: parseInt(match[1], 10) });
// });

telegram.onText(/^\/nogo/, (message) => {
  Brain.unregister(telegram, { message });
});

const app = express();
app.get('/', function (req, res) {
  res.json({ version: packageInfo.version });
});
const server = app.listen(process.env.PORT || 3000, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log('Web server started at http://%s:%s', host, port);
});
