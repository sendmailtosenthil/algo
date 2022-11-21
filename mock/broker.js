require('dotenv').config()
const express = require('express')
const app = express()
require('./server')

const WebSocket = require ('ws');
const m = require('moment')
const port = process.env.port

let orderId = m().valueOf();
let ws = null;


app.use(express.text())

app.post('/PiConnectTP/PlaceOrder', (req, res) => {
    console.log('Request receieved..............')
    orderId += 1;
    let data = {
        stat:'Ok',
        norenordno:`${orderId}`
    }
    //ws.send(JSON.stringify(data))
    sendOrder(toJson(req.body), orderId)
    res.json(data)
})

app.post('/PiConnectTP/SearchScrip', (req, res) => {
    const body = toJson(req.body);
    //console.log("In Mock.... ",body)
    let data = {
        stat: "Ok",
        values:[{
        "exch": body.exch,
        "token": body.stext.includes("P") ? '48287' : '48289',
        "tsym": body.stext
    }]}
    //ws.send(JSON.stringify(data))
    res.json(data)
})

function toJson(body){
    let data = body.substr("jData=".length, body.indexOf("&")-"jData=".length)
    //console.log(data)
    return JSON.parse(data)
}

function sendOrder(body, orderId){
    if(ws == null){
        ws = new WebSocket (process.env.socketUrl)
    }
    ws.send(JSON.stringify({
        ...body,
        orderId,
        "t": "c1"
    }))    
}

app.listen(port, () => {
    console.log(`Mock app listening on port ${port}`)
    try{
        if(ws == null){
            ws = new WebSocket (process.env.socketUrl)
        }
    }catch(e){
        console.log(e)
    }
})