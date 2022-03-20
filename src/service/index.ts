import DB from './db'
console.log('Service Worker')

chrome.runtime.onConnect.addListener(port => {
  port.onMessage.addListener((msg) => {
    switch (msg.type) {
      case 'save':
        if (msg.message) DB.messages.put({ timestamp: new Date(), message: msg.message })
        break
      case 'load':
        DB.messages.orderBy('timestamp').reverse().limit(10).toArray().then(messages => {
          port.postMessage(messages)
        })
        break
      default:
        console.log('Unknown type')
    }
  })
})
