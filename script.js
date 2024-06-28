const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const botToken = 'YOUR_BOT_TOKEN';
const bot = new TelegramBot(botToken, { polling: true });

const userSubmittedData = {};

const csvWriter = createCsvWriter({
  path: 'all_user_data.csv',
  header: [
    { id: 'user', title: 'User' },
    { id: 'data', title: 'Data' }
  ],
  append: true
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Hi! Send me data');
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.username || userId.toString();
  const userData = msg.text;

  if (userData === '/start') return;

  if (userSubmittedData[userId] && userSubmittedData[userId].includes(userData)) {
    bot.sendMessage(chatId, 'You have already submitted the data.');
    return;
  }

  csvWriter.writeRecords([{ user: userName, data: userData }])
    .then(() => {
      bot.sendMessage(chatId, 'Data received success!');
      if (!userSubmittedData[userId]) {
        userSubmittedData[userId] = [];
      }
      userSubmittedData[userId].push(userData);
    })
    .catch((err) => {
      console.error('Error writing to CSV', err);
      bot.sendMessage(chatId, 'There was an error saving your data. Try again');
    });
});