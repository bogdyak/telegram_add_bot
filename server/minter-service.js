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
    // let final_minter_wallet = msg.merchant.wallets.Minter[0]
    // let temp_minter_wallet  = msg.details.wallets.MINTER
    // let amount = msg.details.amount.MINTER
    
    // watcher = new Watcher(msg.details.order_id, msg.merchant, 'MINTER', temp_minter_wallet, amount, final_minter_wallet)

    watcher = new Watcher(msg.data)
})

responder.on('stop_watching', async () => {
    try {
        watcher.stop()
    }
    catch (e) {}
})