const {expiryInfo} = require('db')(process.env.dbFile);

const populateExpiry = () => {
    const expiryMap = new Map();
    expiryMap.set('CURRENT_WEEK', expiryInfo.currentWeek().expiry)
    console.log(expiryMap)
    return expiryMap;
}

class FindExpiry {

    constructor(emitter, expiry){
        this.emitter = emitter
        this.expiry = expiry
        this.expiryMap = populateExpiry()
    }

    getExpiry(){
        let expiryVal = ""
        switch(this.expiry){
            case 'CURRENT_WEEK':
                expiryVal = this.expiryMap.get(this.expiry);
                break;
            default:
                expiryVal = ""
        }
        this.emitter.emit('enter-trade', expiryVal)
    }
}
module.exports.FindExpiry = FindExpiry 