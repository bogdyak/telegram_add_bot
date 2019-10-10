const messages = require('./messages')
const debug    = require('./debug')
const fs       = require('fs')
const path     = require('path')
const cote     = require('cote')
const crypto   = require('crypto')
const db_api   = require('./mongo')
const tx_store = require('../mongoose/EcommTempTxStore')
const Minter   = require('@aloborio/blockchain/dist/index')
const markup_api = require('./markups')


const minter = new Minter.default()


const minter_requester = new cote.Requester({ name:"server-minter-requester", key:"minter-service" })
const address_requester = new cote.Requester({ name:"server-address-requester", key:"address-generate-tool" })


const editMessageReply = (ctx, data) => {
    ctx.editMessageText(data.text, {
        parse_mode: 'HTML',
        reply_markup: data.reply_markup
    })
}


module.exports = {
    before_add_channel (ctx) {
        messages.BeforeAddChannel()
        .then(data => editMessageReply(ctx, data))
        .catch(e => debug.notifyAndReply(ctx, e))
    },

    back_to_before_add_channel (ctx) {
        messages.BeforeAddChannel()
        .then(data => editMessageReply(ctx, data))
        .catch(e => debug.notifyAndReply(ctx, e))
    },

    add_channel (ctx) {
        messages.AddChannelGet()
        .then(data => editMessageReply(ctx, data))
        .catch(e => debug.notifyAndReply(ctx, e))
    },

    help_add_channel (ctx) {
        messages.HelpAddChannel()
        .then(data => editMessageReply(ctx, data))
        .catch(e => debug.notifyAndReply(ctx, e))
    },

    back_to_help (ctx) {
        messages.Help()
        .then(data => editMessageReply(ctx, data))
        .catch(e => debug.notifyAndReply(ctx, e))
    },

    show_add_channel_instructions (ctx) {
        messages.AddChannelInstruction()
        .then((data) => { 
            editMessageReply(ctx, data.text, { parse_mode:"HTML" })
        })
        ctx.replyWithMediaGroup([
            {
                media: { source: fs.readFileSync(path.join(__dirname, '../media/1.png')) },
                caption: 'From buffer',
                type: 'photo'
            },
            {
                media: { source: fs.readFileSync(path.join(__dirname, '../media/2.png')) },
                caption: 'From buffer',
                type: 'photo'
            },
            {
                media: { source: fs.readFileSync(path.join(__dirname, '../media/3.png')) },
                caption: 'From buffer',
                type: 'photo'
            },
            {
                media: { source: fs.readFileSync(path.join(__dirname, '../media/4.png')) },
                caption: 'From buffer',
                type: 'photo'
            },
            {
                media: { source: fs.readFileSync(path.join(__dirname, '../media/5.png')) },
                caption: 'From buffer',
                type: 'photo'
            },
            {
                media: { source: fs.readFileSync(path.join(__dirname, '../media/6.png')) },
                caption: 'From buffer',
                type: 'photo'
            }
        ])
        .catch(e => debug.notifyAndReply(ctx, e))
    },

    back_to_settings (ctx) {
        messages.Settings(ctx.update.callback_query.from.id)
        .then(data => editMessageReply(ctx, data))
        .catch(e => debug.notifyAndReply(ctx, e))
    },

    back_to_profile (ctx) {
        messages.Profile(ctx.update.callback_query.from.id)
        .then(data => editMessageReply(ctx, data))
        .catch(e => debug.notifyAndReply(ctx, e))
    },

    channels (ctx) {
        messages.Channels(ctx.update.callback_query.from.id)
        .then(data => editMessageReply(ctx, data))
        .catch(e => debug.notifyAndReply(ctx, e))
    },

    edit_channel (ctx) {
        messages.ChannelsToEdit(ctx.update.callback_query.from.id)
        .then(data => editMessageReply(ctx, data))
        .catch(e => debug.notifyAndReply(ctx, e))
    },

    withdraw (ctx) {
        messages.Withdraw(ctx.update.callback_query.from.id)
        .then(data => editMessageReply(ctx, data))
        .catch(e => debug.notifyAndReply(ctx, e))
    },

    deposit (ctx) {
        const id = ctx.update.callback_query.from.id
        messages.Deposit(id)
        .then(data => {
            editMessageReply(ctx, data)
            ctx.telegram.sendPhoto(id, `https://chart.googleapis.com/chart?cht=qr&chs=200x200&choe=utf-8&chl=${data.extra}`)
        })
        .catch(e => debug.notifyAndReply(ctx, e))
    },

    help_withdraw (ctx) {
        messages.HelpWithdraw(ctx.update.callback_query.from.id)
        .then(data => editMessageReply(ctx, data))
        .catch(e => debug.notifyAndReply(ctx, e))
    },
    
    editchannel (ctx, data) {
        const from_id     = ctx.update.callback_query.from.id
        const channelName = data[2]   
        messages.EditChannel(from_id, channelName)
        .then(_data => editMessageReply(ctx, _data))
        .catch(e => debug.notifyAndReply(ctx, e))
    },
    
    editchannellanguage (ctx, data) {
        const from_id     = ctx.update.callback_query.from.id
        const channelName = data[1]
        messages.EditChannelLanguage(from_id, channelName)
        .then(_data => editMessageReply(ctx, _data))
        .catch(e => debug.notifyAndReply(ctx, e))
    },
    
    setchannellanguage (ctx, data) {
        const from_id     = ctx.update.callback_query.from.id
        const langToSet   = data[3]
        const channelName = data[4]
        
        db_api.setChannelConfiguation(from_id, channelName, 'channel_language', langToSet)
        .then(() => {
            return messages.EditChannel(from_id, channelName)
        })
        .then(data => {
            ctx.editMessageText("✅ Channel language successfully changed, going back ...")
            setTimeout(() => {
                ctx.editMessageText(data.text, {
                    reply_markup: data.reply_markup,
                    parse_mode: "HTML"
                })
            }, 4000)
        })
        .catch(e => debug.notifyAndReply(ctx, e))
    },
    
    editpostoptions (ctx, data) {
        const from_id     = ctx.update.callback_query.from.id
        const channelName = data[1]

        messages.EditChannelPostOptions(from_id, channelName)
        .then(_data => editMessageReply(ctx, _data))
        .catch(e => debug.notifyAndReply(ctx, e))
    },
    
    addpostoption (ctx, data, sessions) {
        const from_id     = ctx.update.callback_query.from.id
        const channelName = data[3]

        messages.AddNewChannelOption(from_id, channelName)
        .then(data => {
            sessions[from_id].context_1 = channelName
            ctx.editMessageText(data.text, {
                reply_markup: data.reply_markup,
                parse_mode: "HTML"
            })
        })
        .catch(e => debug.notifyAndReply(ctx, e))
    },
    
    chooseadvoption (ctx, data, sessions) {
        const from_id     = ctx.update.callback_query.from.id
        const channelName = data[6]

        messages.BuyPostOptionSelected(from_id, channelName)
        .then(_data => {
            ctx.editMessageText(_data.text, {
                parse_mode: "HTML"
            })
        })
        .catch(e => debug.notifyAndReply(ctx, e))
    },
    
    async approvedpostfor (ctx, data, sessions) {
        const from_id     = ctx.update.callback_query.from.id
        try {
            const context   = sessions[from_id].context
            const profile   = context.profile
            const wallet    = profile.profile.settings.wallet.public
            const text      = context.text
            
            const requester_id = data[5]

            const temp_tx_result = await tx_store.methods.set({
                duration: context.duration,
                amount: context.amount,
                profile: profile
            })
    
            const wallet_to_watch = await address_requester.send({ type:'generate-address', data:{
                blockchain: "MINTER",
                id: profile.profile.id,
                tx_id: temp_tx_result.id
            }})
    
            const updated_profile = await db_api.get_user(profile.profile.id)
            const requester = await db_api.get_user(requester_id)
            const balance = await minter.getBalance(requester.settings.wallet.public, 3)

            minter_requester.send({ type:"start_watching", data: {
                order_id: temp_tx_result.id,
                profile: updated_profile,
                chain: "MINTER",
                temp_wallet: wallet_to_watch.MINTER.public,
                amount: context.amount,
                final_wallet: wallet,
                post_details: {
                    text: text,
                    duration: context.duration,
                    full_profile: updated_profile,
                    admin: from_id,
                    client: data[5],
                    channel: data[3],
                    hash: crypto.randomBytes(8).toString('hex')
                }
            }})
        
            if (balance < context.amount) {
                ctx.telegram.sendMessage(
                    data[5],
                    `Please send <b>${context.amount} BIP</b> to \n<code>${wallet_to_watch.MINTER.public}</code>`,
                    { parse_mode: "HTML" }
                )
                ctx.telegram.sendPhoto(data[5], `https://chart.googleapis.com/chart?cht=qr&chs=200x200&choe=utf-8&chl=${wallet_to_watch.MINTER.public}`)
            }
            else {
                const to      = wallet_to_watch.MINTER.public
                const payment = await minter.payment(to, context.amount)
                const signed  = await minter.wallet.signTransaction(payment, requester.settings.wallet.private)

                ctx.telegram.sendMessage(
                    data[5],
                    `Paying ${context.amount} BIP from internal wallet, please wait...`
                )                

                minter.submitSigned(signed)
                .on('confirmation', (data) => {
                    console.log(data)
                })
                .on('error', (e) => {
                    debug.notifyAndReply(ctx, e)
                })
            }
        }
        catch (e) {
            debug.notifyAndReply(ctx, e)
        }
    },
    
    declinedpostfor (ctx, data) {
        ctx.telegram.sendMessage(data[5], `@${data[0]} - creator of @${data[3]} channel declined your post. Consider contacting him/her for details.`)
    },

    withdrawcurrency (ctx, currency_to_withdraw) {
        try {
            ctx.editMessageText(
                `Please send me Minter address which should receive ${currency_to_withdraw} withdrawal`,
                {
                    reply_markup: markup_api.show_channels.reply_markup,
                    parse_mode: "HTML"
                }
            )
        }
        catch (e) {
            debug.notifyAndReply(ctx, e)
        }
    }
}