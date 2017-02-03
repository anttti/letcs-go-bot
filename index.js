const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

const logger = require('winston');
const TelegramBot = require('node-telegram-bot-api');
const telegram = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const Brain = require('./brain');

telegram.onText(/^\/status/, (message) => {
  Brain.status(telegram, { message });
});

telegram.onText(/^\/go$/, (message) => {
  Brain.register(telegram, { message });
});

telegram.onText(/^\/go (.+)$/, (message, match) => {
  Brain.register(telegram, { message, timeout: parseInt(match[1], 10) });
});

telegram.onText(/^\/nogo$/, (message) => {
  Brain.unregister(telegram, { message });
});
