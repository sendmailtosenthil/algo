const cron = require('node-cron')

class Entry {

    constructor(emitter, entryTime){
        this.emitter = emitter
        this.schedule(entryTime)
    }

    schedule(cronTime){
        let self = this;
        console.log('Start Cron is waiting ')
        let job = cron.schedule(cronTime, () => {
            console.log('Start of cron')
            self.emitter.emit('find-expiry')
            stop(job)
        });

        function stop(job){
            job.stop()
        }
    }
}

module.exports = Entry
