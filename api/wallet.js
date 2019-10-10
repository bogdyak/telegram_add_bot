const Minter     = require('@aloborio/blockchain/dist/index')
const debug      = require('./debug')
const markup_api = require('../api/markups')
const request    = require('request')


const minter   = new Minter.default()


module.exports = {
    async withdraw (ctx, context, amount) {
        const to      = context.withdraw_data.address
        const profile = context.profile

        const payment = await minter.payment(to, amount, context.withdraw_data.coin)
        const signed  = await minter.wallet.signTransaction(payment, profile.settings.wallet.private)
                            
        ctx.editMessageText(`🕐 Processing withdrawal, please wait...`)

        minter.submitSigned(signed)
        .on('confirmation', (data) => {
            console.log(data)
            const parse_tx_object = minter.util.parseHashFromReceipt("MINTER", data)
            const explorerUrl = minter.explorer.transaction(parse_tx_object.hash)
            
            ctx.editMessageText(
                `✅ <b>Withdrawal done</b>\n\nClick the button below to check transaction on explorer`,
                {
                    parse_mode:"HTML",
                    reply_markup:markup_api.explorer_url(explorerUrl).reply_markup
                }
            )
        })
        .on('error', (e) => {
            debug.notifyAndReply(ctx, e)
        })
    }
}