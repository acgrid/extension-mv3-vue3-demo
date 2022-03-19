const port = chrome.runtime.connect()
port.postMessage('Hello world')
