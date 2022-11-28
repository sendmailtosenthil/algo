const cron = require('node-cron')

class Entry {

    constructor(entryTime, cb){
        this.schedule(entryTime, cb)
    }

    schedule(cronTime, cb){
        console.log('Start Cron is waiting ')
        let job = cron.schedule(cronTime, () => {
            console.log('Start of cron')
            cb()
            stop(job)
        });

        function stop(job){
            job.stop()
        }
    }
}

module.exports = Entry
