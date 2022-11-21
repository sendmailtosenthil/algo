const EventEmitter = require("events")
const Entry = require("./wait-for-entry")
const {strategyDB, transactionsDB} = require('db')(process.env.dbFile)
const m = require('moment')
const ATMStrikeFinder = require("./find-strike")
const PlaceOrder = require("./place-order")
const { Ticker } = require("../flattrade/ticker")
const OrderUpdate = require("./update-order")
const UpdateSL = require("./update-sl")
const { FindExpiry } = require("./find-expiry")

/**
 args 2 => user id
 args 3 => token
 args 4 => strategy id 
 */
class StrategyApp {

    constructor(args) {
        this.userId = args[2]
        this.token = args[3]
        this.strategyId = args[4]
        this.tradeDay = args[5]
        this.tid = `${this.userId}-${this.strategyId}-${this.tradeDay}`
        this.emitter = new EventEmitter()
        this.ticker = new Ticker(this.emitter, 'NSE', '26000')
        this.slMonitorMap = new Map();
    }
}

function registerEvents(app){
    console.log('Loading register events ')
    app.emitter.on('get-strategy',async () => {
        app.strategy = strategyDB.retrieve(app.strategyId)
        mock(app)
        // Will send find-entry once the time reaches
        new Entry(app.emitter, app.strategy.entryTime)
    })

    app.emitter.on('get-open-trades',async () => {
        app.openTrades = transactionsDB.retrieve(app.tid)
    })

    app.emitter.on('find-expiry', async () => {
        // Will send enter-trade once it finds expiry
        new FindExpiry(app.emitter, app.strategy.expiry)  
    })

    app.emitter.on('enter-trade', async (expiry) => {
        app.strategy.expiry = expiry
        console.log('Enter trade.....')
        // Will send find-nifty-atm event once it finds ATM
        new ATMStrikeFinder(app.emitter, app.ticker, {round:50})
    })

    app.emitter.on('nifty-atm', async (atmStrike)=>{
        console.log('ATM :',atmStrike)
        let userInfo = {userId: app.userId, authToken: app.token}
        // Will place an order and persist record into DB
        let peOrderInfo = {type: 'p', trans:'S', expiry:app.strategy.expiry, strike:atmStrike, tid:app.tid, sid: app.strategyId}
        new PlaceOrder(app.emitter, app.ticker, peOrderInfo, userInfo)
        
        // Will place an order and persist record into DB
        let ceOrderInfo = {type: 'c', trans:'S', expiry:app.strategy.expiry, strike:atmStrike, tid:app.tid, sid: app.strategyId}
        new PlaceOrder(app.emitter, app.ticker, ceOrderInfo, userInfo)
    })

    // Will be sent by ticker object as there is order placed by above steps
    app.emitter.on('order', (data) =>{
        console.log('Order received', data)
        new OrderUpdate(app.emitter, {...data, tid:app.tid})
    })

    app.emitter.on('open-order', (data) =>{
        console.log('Order received', data)
        new OrderUpdate(app.emitter, {...data, tid:app.tid})
    })

    app.emitter.on('sl-update', (data) =>{
        console.log('Working on sl-update ', {...data, expiry: app.strategy.expiry})
        let updateSL = new UpdateSL(app.emitter, app.ticker, {...data, expiry: app.strategy.expiry, uid: app.userId}, JSON.parse(app.strategy.sl))
        app.slMonitorMap.put(data.symbol, updateSL)
    })

    app.emitter.on('sl-hit', (data) =>{
        console.log('SL hit', data)
        let orderInfo = {type: 'c', trans:'B', expiry:app.strategy.expiry, strike:atmStrike, tid:app.tid, sid: app.strategyId, symbol:data.symbol}
        new PlaceOrder(app.emitter, app.ticker, orderInfo, userInfo)
        app.slMonitorMap.delete(data.symbol)
        if(app.slMonitorMap.size == 0){
            app.emitter.emit('stop-exit')
        }
    })
    
    app.emitter.on('stop-exit', ()=>{
        console.log('Going to stop exit cron')

    })

    app.emitter.on('exit-time', ()=>{
        console.log('Adding exit cron')
        
    })
}

function loadInfo(app){
    app.emitter.emit('get-strategy')
    app.emitter.emit('get-open-trades')
    app.emitter.emit('exit-time')
}

function mock(app){
    const now = m().add(5,'s')
    app.strategy.entryTime=`${now.seconds()} ${now.minutes()} ${now.hours()} * * *`
    const exit = m().add(5,'m')
    app.strategy.exitTime=`${exit.seconds()} ${exit.minutes()} ${exit.hours()} * * *`
}

const childApp = new StrategyApp(process.argv)
registerEvents(childApp)
loadInfo(childApp)
console.log(childApp)