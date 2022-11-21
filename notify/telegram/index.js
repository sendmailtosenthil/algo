require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.telegramToken;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: false});

async function send(msg){
    return new Promise(async (resolve, reject) => {
        bot.sendMessage(process.env.telegramUser, msg).then(r => resolve('Done')).catch(e => reject(e))
    })
}

module.exports.send = send