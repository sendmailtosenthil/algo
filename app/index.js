const db = require('db')(process.env.dbFile)
const {user} = db
const m = require('moment')
const { fork } = require("child_process");
const notifier = require('notify')
const token = require('./token')

async function getAllTrades(){
    try{
        const userStrategies = user.retrieveStrategies(m().format('YYYYMMDD'))
        const userTokenMap = token.getUserTokens(userStrategies);   
        userStrategies.map(async userStrategy => {
            if(userTokenMap.get(userStrategy.uid)){
                const child = fork("930/execute-930-strategy.js",[userStrategy.uid, userTokenMap.get(userStrategy.uid), userStrategy.sid, userStrategy.tradeDay]);
                console.log(`Child Process ${child.pid}`)
                return child
            } else {
                await notifier(`Unable to execute ${userStrategy.sid} as token is invalid for ${userStrategy.uid}`, 'Telegram')
                return null
            }
        })
    } catch(e){
        await notifier('Failure '+e,'Telegram')
        console.log(e)
    }
}

getAllTrades()
