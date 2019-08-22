import ddCli from '../src/core'

console.log('Initialize dd-cli and set up appkey and sercert, then wait for employee to complete.')

const dd = new ddCli('appkey***********','sercet******')

console.log('When employee is complete, all kinds of functions can be called to complete the task')

dd.gettoDayData()