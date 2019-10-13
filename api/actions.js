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
            ctx.telegram.sendPhoto(
                id,
                `https://chart.googleapis.com/chart?cht=qr&chs=200x200&choe=utf-8&chl=${data.extra}`,
                {
                    caption: data.extra
                }
            )
        })
        .catch(e => debug.notifyAndReply(ctx, e))
    },

    help_withdraw (ctx) {
        messages.HelpWithdraw(ctx.update.callback_query.from.id)
        .then(data => editMessageReply(ctx, data))
        .catch(e => debug.notifyAndReply(ctx, e))
    },

    help_addedit_pricelist (ctx) {
        messages.helpAddEditToPriceList(ctx.update.callback_query.from.id)
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
        const channelName = data[2]

        messages.EditChannelPostOptions(from_id, channelName, data)
        .then(_data => editMessageReply(ctx, _data))
        .catch(e => debug.notifyAndReply(ctx, e))
    },
    
    addpostoptions (ctx, data, sessions) {
        const from_id     = ctx.update.callback_query.from.id
        const channelName = data[1]

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
            /**
             * update this stuff, make it through db
             */
            const context   = sessions[`${from_id}_${data[3]}`].context
            const profile   = context.profile
            const wallet    = profile.profile.settings.wallet.public
            const text      = context.text
            
            const requester_id = data[5]

            ctx.editMessageText(
                `Client notified ❗ \n\nYou can safely leave this chat. Post will be automatically posted after you get paid. `,
                {
                    parse_mode: "HTML"
                }
            )

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

            console.log({
                order_id: temp_tx_result.id,
                temp_wallet: wallet_to_watch.MINTER.public,
                amount: context.amount,
                balance: balance,
                final_wallet: wallet,
                text: text,
                duration: context.duration,
                admin: from_id,
                client: data[5],
                channel: data[3],
                hash: crypto.randomBytes(8).toString('hex')
            })

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
                    `⚠️ Not enough funds on internal wallet ⚠️ \n\nPlease send <b>${context.amount} BIP or equivalent of Custom Minter coins</b> to the following address`,
                    { parse_mode: "HTML" }
                )
                ctx.telegram.sendPhoto(
                    data[5],
                    `https://chart.googleapis.com/chart?cht=qr&chs=200x200&choe=utf-8&chl=${wallet_to_watch.MINTER.public}`,
                    {
                        caption: wallet_to_watch.MINTER.public
                    }
                )
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
            console.log(e)
            debug.notifyAndReply(ctx, e)
        }
    },
    
    declinedpostfor (ctx, data) {
        ctx.editMessageText(
            `Client notified ❗ \n\nYou can safely leave this chat.`,
            {
                parse_mode: "HTML"
            }
        )
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
    },

    async delete_price_list_option (ctx, _data, sessions) {
        const channelName = _data[1]
        const id = ctx.update.callback_query.from.id

        const pots_options = await db_api.delete_price_list_option(id, channelName, _data[2], _data[3], _data[4])

        messages.PriceListOptionDeleted(channelName, pots_options)
        .then(data => {
            editMessageReply(ctx, data)
            setTimeout(() => {
                messages.EditChannel(id, channelName)
                .then(_data => editMessageReply(ctx, _data))
                .catch(e => debug.notifyAndReply(ctx, e))
            }, 1500)
        })
        .catch(e => debug.notifyAndReply(ctx, e))
    },

    edit_price_list_option (ctx, data, sessions) {

    }
}