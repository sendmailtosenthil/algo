require('dotenv').config()
const cron = require('node-cron')
const m = require('moment')

// Starts the login process at start of program
function start(loginAttempt) {

    //console.log(`Run mode ${process.env.runNow} ${process.env.authUrl}`)
    let runtime = getTriggerTime();
    const job = cron.schedule(`${runtime[2]} ${runtime[1]} ${runtime[0]} * * *`, () => {
      console.log('Going to trigger login feature');
      login()
      stop()
    })
  
    function getTriggerTime() {
      // Will start in 5 secs for testing else default timing is 8:30 AM
      let time = Boolean(process.env.loginNow) || loginAttempt > 0 ? m().add(5 * loginAttempt, 's').format("HH:mm:ss") : '08:30:00';
  
      // Override default time with custom time configured in .env file
      if (process.env.loginTime) {
        time = process.env.loginTime;
      }
      
      let runtime = time.split(':');
      return runtime;
    }
  
    function stop() {
      job.stop()
      console.log("As login process starts, Cron Stopped....")
    }

    async function login(){
        require('./server').start()
        const success = await require('./client').login()
        if(success){
          process.exit(0) 
        } else if(loginAttempt < 20){
          start(loginAttempt+1)
        }
    }
  }

start(1)