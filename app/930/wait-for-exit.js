const cron = require('node-cron')

class Exit {

    constructor(emitter, exitTime){
        this.emitter = emitter
        this.schedule(exitTime)
        this.job = null;
    }

    schedule(cronTime){
        let self = this;
        console.log('Exit Cron is waiting ')
        this.job = cron.schedule(cronTime, () => {
            console.log('Exit of cron')
            self.emitter.emit('exit-trade-done')
        });
    }

    stop(){
        this.job.stop()
    }
}

module.exports = Entry
