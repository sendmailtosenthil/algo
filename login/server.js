function startServer() {
    const port = process.env.port || 80
    const authUrl = process.env.serverAuthUrl
    const apiKey = process.env.apiKey
    const secret = process.env.secret

    const express = require('express')
    const app = express()

    var crypto = require('crypto');
    //creating hash object 
    var request = require('request');

    const {token} = require('db')(process.env.dbFile);

    function login(req, res){
        console.log(req.query.code)
        var hash = crypto.createHash('sha256');
        //passing the data to be hashed
        const data = hash.update(`${apiKey}${req.query.code}${secret}`, 'utf-8');
        //Creating the hash in the required format
        const gen_hash = data.digest('hex');
        //Printing the output on the console
        console.log("hash : " + gen_hash);
        request.post(
            authUrl,
            { json: { 'api_key': apiKey, 'request_code':req.query.code, 'api_secret': gen_hash} },
            async function (error, response, body) {
                try{
                    if (!error && response.statusCode == 200) {
                        console.log(body);
                        await token.save({id:body.client, token:body.token})
                        res.send('<h1><div id="super">Login Successful</div></h1><br><b>Thanks for your kind support, keep trading everyday</b>')
                    } else {
                        throw Error(`Invalid Status code ${response.statusCode}, ${error}`)
                    }
                }catch(e){
                    res.send(`<h1><div id="super">Login Failed. Reach out to Telegram user @FNODailyTrade Error ${e}</div></h1>`)
                }
            }
        );
    }

    app.get('/v1/dashboard', (req1, res1) => {
        login(req1, res1)
    })

    app.listen(port, () => {
        console.log(`Login server listening on port ${port}`)
    })

}
let serverStarted = false;
module.exports.start = function(){
    if(!serverStarted){
        startServer()
        serverStarted = true;
    } else {
        console.log('Server already running')
    }

}