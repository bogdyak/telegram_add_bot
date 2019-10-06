/**
 * @modules
 */
const cote    = require('cote')
const Watcher = require('./blockchain-service')

/**
 * @connections
 */
const responder = new cote.Responder({ name: "minter-service-responder", key:"minter-service" })

let watcher = {}

responder.on('start_watching', async (msg) => {
    watcher = new Watcher(msg.data)
})

responder.on('stop_watching', async () => {
    try {
        watcher.stop()
    }
    catch (e) {}
})