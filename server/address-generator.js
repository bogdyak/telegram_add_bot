/**
 * @modules
 */
const cote = require('cote')
const Minter  = require('@aloborio/blockchain/dist/index')
const mongo = require('../api/mongo')

/**
 * @connections
 */
const requester = new cote.Requester({ name:"address-service-requester", key:"address-generate-tool" });
const responder = new cote.Responder({ name:"address-service-responder", key:"address-generate-tool" })

const minter = new Minter.default()


responder.on('generate-address', async (msg, cb) => {
    const data = msg.data

    try {
        const acc = await minter.wallet.create()
        let obj = {}
        obj[data.blockchain.toUpperCase()] = acc
        await mongo.addPendingAddresses(data.id, data.tx_id, obj)
        
        cb(null, obj)
    }
    catch (e) {
        console.log(e)
        reject(e)
    }
})