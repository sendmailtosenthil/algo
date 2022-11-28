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
        this.ticker = new Ticker(this.emitter)
        this.slMonitorMap = new Map();
    }
}

function registerEvents(app){
    console.log('Loading register events ')
    app.emitter.on('get-strategy',async () => {
        app.strategy = strategyDB.retrieve(app.strategyId)
        mock(app)
        // Will send find-entry once the time reaches
        new Entry(app.strategy.entryTime, () => {
            app.emitter.emit('find-expiry')    
        })
    })

    app.emitter.on('get-open-trades',async () => {
        app.openTrades = transactionsDB.retrieve(app.tid)
    })

    app.emitter.on('find-expiry', async () => {
        console.log('Fining the expiry for ', app.strategy.name)
        // Will send enter-trade once it finds expiry date
        new FindExpiry(app.strategy.expiry, (expiryVal) => {
            console.log('Expiry Val '+expiryVal)
            app.emitter.emit('enter-trade', expiryVal)
        })  
    })

    app.emitter.on('enter-trade', async (expiry) => {
        app.strategy.expiry = expiry
        console.log('Enter trade.....')
        // Will send find-nifty-atm event once it finds ATM
        new ATMStrikeFinder(app.emitter, app.ticker, {round:50}, (atmStrike)=>{
            app.emitter.emit('nifty-atm', atmStrike);
        })
    })

    // Find the symbol before order place TODO: 
    app.emitter.on('nifty-atm', async (atmStrike)=>{
        console.log('ATM :',atmStrike)
        let userInfo = {userId: app.userId, authToken: app.token}
        // Will place an order and persist record into DB
        const orderInfo = {
            exchange:'NFO',
            otype:'MKT',
            expiry:app.strategy.expiry, 
            strike:atmStrike, 
            qty: 50,
            trantype:'S'
        }
        const peOrderInfo = {...orderInfo, type: 'p', tid:`${app.tid}-`}
        new PlaceOrder(app.ticker, peOrderInfo, userInfo)
        
        // Will place an order and persist record into DB
        //const ceOrderInfo = {type: 'c', ...orderInfo, tid:`${app.tid}-c`}
        //new PlaceOrder(app.ticker, ceOrderInfo, userInfo)
    })

    // Will be sent by ticker object as there is order placed by above steps
    app.emitter.on('order', (order) =>{
        console.log('Order received', order)
        new OrderUpdate({
            symbol:order.tsym, 
            oid:order.norenordno, 
            trantype:order.trantype, 
            tid:order.remarks,
            qty:order.flqty,
            price:order.flprc,
            status:order.status
        }, (o) => {
            if(o.status === 'ACTION_PENDING'){
                app.emitter.emit(`sl-update`,o)
            }
        })
    })

    app.emitter.on('open-order', (data) =>{
        console.log('Order received', data)
        new OrderUpdate({...data, tid:app.tid})
    })

    app.emitter.on('sl-update', (o) =>{
        console.log('Working on sl-update ', {...o, expiry: app.strategy.expiry})
        let updateSL = new UpdateSL(app.ticker, 
            {tradePrice:o.price, oid:o.oid, tid: o.tid, symbol: o.symbol, expiry: app.strategy.expiry}, 
            JSON.parse(app.strategy.sl), (ord) => {
            app.emitter.emit(`sl-hit`,ord)
        })
        app.slMonitorMap.set(o.symbol, updateSL)
    })

    app.emitter.on('sl-hit', (o) =>{
        console.log('SL hit', o)
        const orderInfo = {
            exchange:'NFO',
            otype:'MKT',
            expiry:app.strategy.expiry, 
            strike:o.symbol, 
            qty: 50,
            trantype:'B',
            type:'p'
        }
        let userInfo = {userId: app.userId, authToken: app.token}
        new PlaceOrder(app.ticker, orderInfo, userInfo)
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