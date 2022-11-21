var request = require('request');

let FlatTrade = function (userId, token) {
    let flattrade = Object.create(Actions);
    flattrade.url = process.env.apiUrl
    flattrade.userId = userId
    flattrade.token = token
    return flattrade;
}

let Actions = {

    async searchScript(text) {
        const values = (await this.makeRequest('SearchScrip',`jData={"uid":"${this.userId}","stext":"${text}","exch":"NFO"}&jKey=${this.token}`)).values
        return {token: values[0].token, exch:values[0].exch, script:text};
    },

    async placeOrder(data){
        let action = 'PlaceOrder';
        let body = `jData={"uid":"${this.userId}","actid":"${this.userId}","exch":"${data.exch}",`;
        body += `"tsym":"${data.symbol}","qty":"${data.qty}","prc":"${data.price}",`
        body += `"prd":"M","trantype":"${data.type}","prctyp":"${data.otype}","ret":"DAY",`
        body += `"ordersource":"API","remarks":"${data.id}","mkt_protection":"1"}&`
        body += `jKey=${this.token}`
        const orderInfo = await this.makeRequest(action, body);
        return orderInfo;
    },

    async tpSeries(text){

    },

    makeRequest(action, body){
        return new Promise((resolve, reject)  => {
            var options = {
                method: 'POST',
                url: `${this.url}/${action}`,
                headers: {
                'Content-Type': 'text/plain'
                },
                'body': body
            
            };
            console.log(options)
            request(options, function (error, response) {
                console.log(error, response.body)
                if (error) 
                    reject(error);
                else{
                    let body = JSON.parse(response.body) || {};
                    console.log(body.stat, body.stat=='ok')
                    if(body.stat === "Ok"){
                        return resolve(body)
                    }
                    reject('No results');
                }
            });
        })
    }
}


module.exports.Broker = FlatTrade

//new FlatTrade("FT009295","da20798cb384537aa582333dbf58e9137479e191920187b988ca52588b808583").searchScript("NIFTY27OCT22C17650")