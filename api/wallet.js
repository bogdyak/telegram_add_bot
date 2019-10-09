const Abr        = require('@aloborio/blockchain/dist/index')
const debug      = require('./debug')
const markup_api = require('../api/markups')


const abr   = new Abr.default()


module.exports = {
    async withdraw (ctx, context, amount) {
        const to      = context.address
        const profile = context.profile

        const payment = await abr.MINTER.payment(to, amount)
        const signed  = await abr.MINTER.wallet.signTransaction(payment, profile.settings.wallet.private)
                            
        ctx.reply(`🕐 Processing withdrawal, please wait...`)

        abr.MINTER.submitSigned(signed)
        .on('confirmation', (data) => {
            const parse_tx_object = abr.parseHashFromReceipt("MINTER", data)
            const explorerUrl = abr.MINTER.explorer.transaction(parse_tx_object.hash)
            
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