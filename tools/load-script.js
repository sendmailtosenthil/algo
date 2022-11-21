var request = require('request');
const {scriptInfo, token, expiryInfo} = require('db')(process.env.dbFile)
const m = require('moment');

let FlatTrade = function (userId, token) {
    let flattrade = Object.create(Actions);
    flattrade.url = process.env.apiUrl
    flattrade.userId = userId
    flattrade.token = token
    return flattrade;
}

let Actions = {

    async searchScript(text) {
        try{
            const values = await this.makeRequest('SearchScrip',`jData={"uid":"${this.userId}","stext":"${text}","exch":"NFO"}&jKey=${this.token}`)
            return values.values;
        }catch(e){
            console.log(e)
            return []
        }
    },

    makeRequest(action, body){
        return new Promise((resolve, reject)  => {
            var options = {
                method: 'POST',
                url: `https://piconnect.flattrade.in/PiConnectTP/${action}`,
                headers: {
                'Content-Type': 'text/plain'
                },
                'body': body
            
            };
            console.log(options)
            request(options, function (error, response) {
                console.log(error, ((response) || {}).body )
                if (error) 
                    reject(error);
                else{
                    let body = JSON.parse(response.body) || {};
                    console.log(body.stat, body.stat=='ok')
                    if(body.stat === "Ok"){
                        return resolve(body)
                    }
                    reject([]);
                }
            });
        })
    }
}

async function insert(searchText, expiry){
    let tokenInfo = process.env.token || token.retrieve({id:process.env.userid}) 
    let ft = new FlatTrade(process.env.userid,tokenInfo.token);
    try{
        let values = await ft.searchScript(searchText)
        values.forEach(d => {
            console.log(`Saving ${d.tsym} ${expiry}`)
            scriptInfo.save({name:d.tsym, token:d.token, expiry:expiry})
        });
    }catch(e){
        console.log(e)
    }
}

const expiryDays = () => {
    const now = m().hour(0).minute(0).second(0);
    const after90Days = m().add(90, 'd')
    const expiryDays = []
    now.add(4-now.isoWeekday(),'d')
    if(now.isBefore(m().hour(0).minute(0).second(0))){
        now.add(7, 'd')
    }
    while(now.isSameOrBefore(after90Days)){
        expiryDays.push(now.clone())
        now.add(7, 'd')
    }
    expiryDays.forEach(expiryDay => console.log(expiryDay))
    return expiryDays;
}

const niftyExpires = async (expiryDay) => {
    let startRange = Math.round(Number(process.env.strikeRange.split('-')[0])/1000)
    const endRange = Math.round(Number(process.env.strikeRange.split('-')[1])/1000)
    const strikes = [];
    while(startRange < endRange){
        strikes.push(startRange)
        startRange++
    }
    strikes.forEach(async strike => {
        await insert(`NIFTY${expiryDay.format('DDMMMYY').toUpperCase()}P${strike}%`, expiryDay.format('YYYYMMDD'))
        await insert(`NIFTY${expiryDay.format('DDMMMYY').toUpperCase()}C${strike}%`, expiryDay.format('YYYYMMDD'))
    })
} 

function cleanUp(){
    scriptInfo.clean()
    expiryInfo.clean()
}

cleanUp()

expiryDays().forEach(async expiryDay => {
    await expiryInfo.save(expiryDay.format('YYYYMMDD'))
    await niftyExpires(expiryDay)
})
