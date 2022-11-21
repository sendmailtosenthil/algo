const {token} = require('db')(process.env.dbFile)
const m = require('moment')


function getUserTokens(trades) {
    const tokenValidTime =  m().seconds(0).minutes(0).hours(8)
    const users = new Set(trades.map(d => d.uid));
    const userMap = new Map();
    for (const user of users) {
        const tokenInfo = token.retrieve({ id: user })
        const loginTime = m(tokenInfo.loginTime,'YYYY-MM-DD HH:mm:ss',true)
        console.log(tokenInfo.loginTime, loginTime, tokenValidTime)
        if(loginTime.isSameOrAfter(tokenValidTime)){
            userMap.set(user, tokenInfo.token);
        }
    }
    return userMap;
}

module.exports.getUserTokens = getUserTokens