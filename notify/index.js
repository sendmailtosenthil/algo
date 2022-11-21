
module.exports = async function (message, channel){
    if((process.env.notification || "").toLowerCase() === 'off'){
        console.log('No notification... change notification property in env to on')
        return
    }
    console.log(`Sending message ${message}`)
    switch(channel){
        case 'Telegram':
            let telgram = require('./telegram/index');
            return telgram.send(message)
        default :
            console.log(`Wrong channel: ${channel}, Discarded message: ${message}`)
            return null;
    }    
}