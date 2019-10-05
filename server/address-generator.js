/**
 * @modules
 */
const cote = require('cote')
const Abr  = require('@aloborio/blockchain/dist/index')
const mongo = require('../api/mongo')

/**
 * @connections
 */
const requester = new cote.Requester({ name:"address-service-requester", key:"address-generate-tool" });
const responder = new cote.Responder({ name:"address-service-responder", key:"address-generate-tool" })

const abr = new Abr.default()


responder.on('generate-address', async (msg, cb) => {
    const data = msg.data

    try {
        const acc = await abr[data.blockchain.toUpperCase()].wallet.create()
        let obj = {}
        obj[data.blockchain.toUpperCase()] = acc
        await mongo.addPendingAddresses(data.id, data.tx_id, obj)
        
        cb(null, obj)
    }
    catch (e) {
        console.log(e)
        reject(e)
    }

    // const proceed = async (body) => {
    //     try {
    //         await mongo.addPendingAddresses(data.id, data.order_id, body)
    //         resolve(body)
    //     }
    //     catch (e) {
    //         requester.
    //     }
    // }

    // try {
    //     const companyProfile = await BusinessProfile.methods.getById(data.merchant_id)
        
    //     const startFromUpperCase = (string) => {
    //     if (typeof string != "undefined")
    //         return string.toLowerCase().charAt(0).toUpperCase() + string.toLowerCase().slice(1)
    //     }
        
    //     let n_wallets = 0
    //     let existing_wallets = []

    //     for (let i = 0; i < 3; i++) {
    //     if (Object.keys(companyProfile.wallets).indexOf(startFromUpperCase(av_chain[i])) != -1) {
    //         let focus_wallet = companyProfile.wallets[startFromUpperCase(av_chain[i])]
    //         if (focus_wallet.length) {
    //         n_wallets++
    //         existing_wallets.push(av_chain[i])
    //         }
    //     }
    //     }

    //     existing_wallets = existing_wallets.join()

    //     if (companyProfile.wallets.length == 3)
    //     request.get('http://localhost:8081/utils/create_account/all', async function (err, result, body) {
    //         proceed(body)
    //     })
        
    //     else 
    //     request.get(`http://localhost:8081/utils/create_account/${existing_wallets}`, async function (err, result, body) {
    //         proceed(body)
    //     })  
    // }
    // catch (e) {
    //     console.log(e)
    // }
})