console.log('Service Worker')

chrome.runtime.onConnect.addListener(port => {
  port.onMessage.addListener((msg) => {
    console.log('got message', msg)
  })
})
