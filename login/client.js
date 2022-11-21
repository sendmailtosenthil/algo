require('dotenv').config()
const puppeteer =require('puppeteer');
const notifier = require('notify')

const delay = (time) =>{
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

const login = async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  let success = true

  try{
    await page.goto(process.env.clientAuthUrl);
    console.log('Loading...', process.env.clientAuthUrl)
    await delay(2000)
    
    console.log('Entering details...')
    await page.type('#input-17', process.env.user);
    await page.type('#pwd', process.env.pwd);
    await page.type('#pan', process.env.pan);

    await delay(500)
    // Wait for suggest overlay to appear and click "show all results".
    const allResultsSelector = '#sbmt';
    await page.waitForSelector(allResultsSelector, {timeout: 5000});
    await page.click(allResultsSelector);

    console.log('Login clicked to generate token')

    const loginResult = await page.waitForSelector('#super') 
    const message = await loginResult.evaluate(el => el.textContent);  
    await notifier(message,'Telegram')
  
    if(!message.includes('Login Successful')){
      success = false
    }
  
  } catch(e) {
    await notifier('Login Failed :'+e, 'Telegram')
    console.log(e)
    success = false
  }
  await browser.close();
  console.log('Client exited.... with ',success)
  return success
}

module.exports.login = login