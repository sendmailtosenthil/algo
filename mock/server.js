
function execute(){
  // Importing the required modules
  const WebSocketServer = require('ws');
  
  // Creating a new websocket server
  const wss = new WebSocketServer.Server({ port: 8080 })

  const connections = new Set()

  let respMap = new Map()
  respMap.set('c', { t: 'ck', s: 'OK', uid: 'FT009295' })
  respMap.set('t-NSE|26000', {
      t: 'tk',       
      e: 'NSE',      
      tk: '26000',   
      ts: 'Nifty 50',
      pp: '2',       
      ls: '1',       
      ti: '0.05',
      lp: '18117.15',
      pc: '0.00',
      o: '0.00',
      h: '0.00',
      l: '0.00',
      c: '18117.15',
      toi: '11398350'
    })
    respMap.set('t-NFO|53395',{
      t: 'tk',
      e: 'NFO',
      tk: '53395',
      ts: 'NIFTY24NOV22F',
      pp: '2',
      ls: '50',
      ti: '0.05',
      lp: '18194.00',
      pc: '0.00',
      c: '18194.00',
      oi: '11786850',
      poi: '11786850'
    })
    respMap.set('t-NFO|61369',{
      t: 'tk',
      e: 'NFO',
      tk: '48287',
      ts: 'NIFTY10NOV22C18100',
      pp: '2',
      ls: '50',
      ti: '0.05',
      lp: '136.70',
      pc: '0.00',
      c: '136.70',
      oi: '5186100',
      poi: '5186100'
    })
    respMap.set('t-NFO|61370',{
      t: 'tk',
      e: 'NFO',
      tk: '48289',
      ts: 'NIFTY10NOV22P18100',
      pp: '2',
      ls: '50',
      ti: '0.05',
      lp: '99.00',
      pc: '0.00',
      c: '99.00',
      oi: '4248900',
      poi: '4248900'
    })

  let orderInfo = new Map()
  orderInfo.set('O',[{
      t: 'om',
      norenordno: '22110500000061',
      uid: 'FT009295',
      actid: 'FT009295',
      exch: 'NFO',
      tsym: 'NIFTY10NOV22C18100',
      trantype: 'S',
      qty: '50',
      prc: '0.00',
      pcode: 'M',
      remarks: '9:30 Test',
      status: 'PENDING',
      reporttype: 'NewAck',
      prctyp: 'MKT',
      ret: 'DAY',
      exchordid: '',
      dscqty: '0'
    },{
      t: 'om',
      norenordno: '22110500000061',
      uid: 'FT009295',
      actid: 'FT009295',
      exch: 'NFO',
      tsym: 'NIFTY10NOV22C18100',
      trantype: 'S',
      qty: '50',
      prc: '0.00',
      pcode: 'M',
      remarks: '9:30 Test',
      status: 'PENDING',
      reporttype: 'PendingNew',
      prctyp: 'MKT',
      ret: 'DAY',
      exchordid: '',
      dscqty: '0'
    },{
      t: 'om',
      norenordno: '22110500000061',
      uid: 'FT009295',
      actid: 'FT009295',
      exch: 'NFO',
      tsym: 'NIFTY10NOV22C18100',
      trantype: 'S',
      qty: '50',
      prc: '0.00',
      pcode: 'M',
      remarks: '9:30 Test',
      status: 'OPEN',
      reporttype: 'New',
      prctyp: 'MKT',
      ret: 'DAY',
      exchordid: '',
      dscqty: '0'
    },{
      t: 'om',
      norenordno: '22110500000061',
      uid: 'FT009295',
      actid: 'FT009295',
      exch: 'NFO',
      tsym: 'NIFTY10NOV22C18100',
      trantype: 'S',
      qty: '50',
      prc: '0.00',
      pcode: 'M',
      remarks: '9:30 Test',
      rejreason: '16278 The markets have not been opened for trading',   
      status: 'COMPLETE',
      reporttype: 'Rejected',
      prctyp: 'MKT',
      ret: 'DAY',
      exchordid: '1000000000000770',
      dscqty: '0',
      exch_tm: '05-11-2022 10:51:20',
      flqty:50,
      flprc:90.0
    }])

  let priceMap = new Map()
  respMap.forEach((v,k) => priceMap.set(k,v.lp))
  // Creating connection using websocket
  wss.on("connection", ws => {
      console.log("new client connected");
      connections.add(ws)
      // sending message
      ws.on("message", data => {
          let jData = JSON.parse(data)
          switch(jData.t){
              case 'c':
                  ws.send(JSON.stringify(respMap.get('c')));
                  break;
              case 't':
                  let res = respMap.get(`t-${jData.k}`)
                  ws.send(JSON.stringify(res))
                  priceMap.set(jData.k, res.lp)
                  keepSending(ws, jData.k)
                  break;
              case 'o':
                  console.log('Order received')   
                  break;
              case 'c1':
                  let price = priceMap.get(`t-${jData.tsym.includes('C')?'NFO|61369' : 'NFO|61370'}`)
                  connections.forEach(conn => sendOrder(conn, jData, price)) 
                  break;
              default:
                  //ws.send('Unknown from mock')
                  break;
          }
          console.log(`Client has sent us: ${data}, connections `+connections.size)
      });
      // handling what to do when clients disconnects from server
      ws.on("close", () => {
          console.log("the client has disconnected, remaining "+connections.size);
          connections.delete(ws);
      });
      // handling client connection error
      ws.onerror = function () {
          console.log("Some Error occurred, remaining "+connections.size)
      }
  });
  console.log("The WebSocket server is running on port 8080");

  function sendOrder(conn, jData, price){
      let orders = orderInfo.get('O');
      orders.forEach((o,i) => {
          setTimeout((conn, o, jData, price) => {
              o.norenordno = jData.orderId
              o.tsym = jData.tsym
              o.qty = jData.qty
              o.prc = price
              o.trantype = jData.trantype
              o.flprc = price
              conn.send(JSON.stringify(o))    
          }, 1000 + i * 500, conn, o, jData, price)
      })
  }

  function keepSending(ws, k){
      setTimeout((ws, priceMap) => {
          let d = k.split('|');
          let lp = priceMap.get(k);
          let roundFig = Math.round(Math.random() * (lp > 10000 ? 3 : 2) * 100)
          let priceChange = roundFig/100;
          let lp1 = roundFig % 2 == 0 ? Number(lp) + priceChange : Number(lp) - priceChange;
          priceMap.set(k, lp1.toFixed(2))
          ws.send(JSON.stringify({
              t: 'tk',
              e: d[0],
              tk: d[1],
              lp: lp1.toFixed(2)
            }))
          keepSending(ws, k)
          //console.log(priceMap)
      }, 1000, ws, priceMap)    
  }
}

execute()
