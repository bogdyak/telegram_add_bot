/**
 * @env
 */
const env = require('./env')
const fs  = require('fs')

/**
 * @node_modules
 */
const Telegraf = require('telegraf')
const session  = require('telegraf/session')
// const socket   = require('socket.io-client')
const cote     = require('cote')
const LocalSession = require('telegraf-session-local')


/**
 * @connection
 */
const bot = new Telegraf(env.BOT_TOKEN)
const minter_requester = new cote.Requester({ name:"server-minter-requester", key:"minter-service" })
const address_requester = new cote.Requester({ name:"server-address-requester", key:"address-generate-tool" })
const transaction_responder = new cote.Responder({ name:"server-tx-responder", key:"transactions" })
const pin_requester = new cote.Requester({ name:"server-pin-requester", key:"pin-service" })
const pin_responder = new cote.Responder({ name:"server-pin-responder", key:"pin-service" })


/**
 * @custom_modules_apis
 */
const db_api        = require('./api/mongo')
const markup_api    = require('./api/markups')
const messages      = require('./api/messages')
const channel_api   = require('./api/channelApi')
const actions       = require('./api/actions')
const lang_logo     = require('./api/language-logo')
const temp_tx_store = require('./mongoose/EcommTempTxStore')

let sessions = {}

let me = ""

bot.use(session())
bot.use((ctx, next) => {
    if (typeof ctx.update.callback_query != "undefined") {
        if (typeof sessions[ctx.update.callback_query.from.id] == "undefined")
            sessions[ctx.update.callback_query.from.id] = {}
        
        if (typeof sessions[ctx.update.callback_query.from.id].context == "undefined") 
            sessions[ctx.update.callback_query.from.id].context = {}
                
    }
    else if (typeof ctx.update.message != "undefined") {
        if (typeof sessions[ctx.update.message.from.id] == "undefined")
            sessions[ctx.update.message.from.id] = {}

        if (typeof sessions[ctx.update.message.from.id].context == "undefined") 
            sessions[ctx.update.message.from.id].context = {}
    }

    return next()
})

bot.telegram.getMe().then(data => {
    me = data.username
})

bot.start(async (ctx) => {
    try {
        await db_api.new_user(ctx.message.from)
        ctx.reply('Hello, my name is David Advertise. Thank you for choosing me.', markup_api.homePage)
    }
    catch (e) {
        console.log(e)

        try {
            if (e.message == "user_exists")
                ctx.reply('Welcome back', markup_api.homePage)
    
            else 
                ctx.reply('Oops, there is error accured. Please report to @b_sizov')
        }
        catch (e) {

        }
    }
})

/**
 * @add_channel is message that user call when want to add new channels. Replying with request to enter name
 */
bot.action('add/channel', (ctx) => actions.add_channel(ctx))
bot.action('back/to/settings', (ctx) => actions.back_to_settings(ctx))
bot.action('back/to/profile', (ctx) => actions.back_to_profile(ctx))
bot.action('channels', (ctx) => actions.channels(ctx))
bot.action('edit/channel', (ctx) => actions.edit_channel(ctx))

bot.action(/(^[A-Za-z0-9\[\]()*\-+/%]+)/, async (ctx) => {
    const data    = ctx.update.callback_query.data.split("/")
    const from_id = ctx.update.callback_query.from.id

    if (data[0]+data[1] == 'editchannel') {
        const channelName = data[2]   
        messages.EditChannel(from_id, channelName)
        .then(data => {
            ctx.editMessageText(data.text, {
                reply_markup: data.reply_markup,
                parse_mode: "HTML"
            })
        })
        .catch(e => {
            ctx.editMessageText(e.text)
        })
    }

    else if (data[0]+data[2]+data[3] == "editchannellanguage") {
        const channelName = data[1]
        messages.EditChannelLanguage(from_id, channelName)
        .then(data => {
            ctx.editMessageText(data.text, {
                reply_markup: data.reply_markup,
                parse_mode: "HTML"
            })
        })
        .catch(e => {
            console.log(e)
            ctx.editMessageText(e.text)
        })
    }

    else if (data[0]+data[1]+data[2] == "setchannellanguage") {
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
        .catch(e => {
            console.log(e)
            ctx.editMessageText(e.text)
        })
    }

    else if (data[0]+data[2]+data[3] == 'editpostoptions') {
        const channelName = data[1]

        messages.EditChannelPostOptions(from_id, channelName)
        .then(data => {
            ctx.editMessageText(data.text, {
                reply_markup: data.reply_markup,
                parse_mode: "HTML"
            })
        })
        .catch(e => {
            console.log(e)
            ctx.editMessageText(e.text)
        })
    }

    else if (data[0]+data[1]+data[2] == "addpostoption") {
        const channelName = data[3]

        messages.AddNewChannelOption(from_id, channelName)
        .then(data => {
            sessions[from_id].context = `set_post_option`
            sessions[from_id].context_1 = channelName
            ctx.editMessageText(data.text, {
                reply_markup: data.reply_markup,
                parse_mode: "HTML"
            })
        })
        .catch(e => {
            console.log(e)
            ctx.editMessageText(e.text)
        })
    }

    else if (data[0]+data[1]+data[2] == "chooseadvoption") {
        const channelName = data[6]

        messages.BuyPostOptionSelected(from_id, channelName)
        .then(_data => {
            sessions[from_id].context = {
                type: 'option_selected',
                duration: data[3] + "_" + data[4],
                amount: data[5],
                profile: sessions[from_id].context
            }
            ctx.editMessageText(_data.text, {
                parse_mode: "HTML"
            })
        })
        .catch(e => {
            console.log(e)
            ctx.editMessageText(e.text)
        })
    }

    else if (data[1]+data[2]+data[4] == "approvedpostfor") {
        try {
            const context = sessions[from_id].context
            const profile = context.profile
            const wallet  = profile.profile.settings.wallet.public
            const text    = context.text
    
            const temp_tx_result = await temp_tx_store.methods.set({
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
                    admin: data[0],
                    client: data[5],
                    channel: data[3]
                }
            }})
    
            ctx.telegram.sendMessage(data[5], `Please send <b>${context.amount} BIP</b> to \n<code>${wallet_to_watch.MINTER.public}</code>`,
                { parse_mode: "HTML" }
            )
            ctx.telegram.sendPhoto(data[5], `https://chart.googleapis.com/chart?cht=qr&chs=200x200&choe=utf-8&chl=${wallet_to_watch.MINTER.public}`)
        }
        catch (e) {
            console.log(e)
        }
    }

    else if (data[1]+data[2]+data[4] == "declinedpostfor") {
        ctx.telegram.sendMessage(data[5], `@${data[0]} - creator of @${data[3]} channel declined your post. Consider contacting him/her for details.`)
    }
})


/**
 * @description
 * This is handler for buttons clicks
 */
bot.on('message', async (ctx) => {
    let text = ctx.message.text
    const from_id = ctx.message.from.id

    console.log(me)

    if (!Object.keys(sessions[from_id].context).length && typeof text != 'undefined' && text) {
        switch (text) {
            /**
             * @Profile is details of user account, wallet, name, channels, etc.
             */
            case '👨‍💻 Profile': messages.Profile(from_id)
                .then(data => {
                    ctx.replyWithHTML(data.text, { reply_markup: data.reply_markup })
                })
                .catch(e => {

                })
                break

            case '📢 Buy Add': messages.BuyAdvertising(from_id)
                .then(data => {
                    sessions[from_id].context = "buy_add"
                    ctx.replyWithHTML(data.text, { reply_markup: data.reply_markup })
                })
                .catch(e => {

                })
                break

            /**
             * @Settings is where user can change language and some more configurations
             */   
            case '☸ Settings': messages.Settings(from_id)
                .then(data => {
                    ctx.replyWithHTML(data.text, { reply_markup: data.reply_markup })
                })
                .catch(e => {

                })
                break
                
        }
    }

    /**
     * @ctx_session_context if there is context in message use context as API and text as data.
     */
    if (Object.keys(sessions[from_id].context).length) {
        const context = sessions[from_id].context
        
        /**
         * @description hanlder for simple message with context: add_channel, set_post_option, buy_add
         */
        switch (context) {
            case 'add_channel':
                // if user not specified '@' at channel name need to prepend it
                if (text.indexOf("@") == -1)
                    text = "@" + text

                sessions[from_id].context = {}

                db_api.check_channel_exists(from_id, text)
                .then(async () => {

                    const res = await bot.telegram.sendMessage(text, 'david_advertise_channel_ping', { disable_notification:true })

                    const chatId = res.chat.id
                    const admin = await ctx.getChat(chatId)
                    
                    await channel_api.deletePingAndAddChannel(ctx, res, admin.id)
                
                    ctx.replyWithHTML(
                        `<b>Channel:</b> @${res.chat.username} successfully connect to your profile\n\nPlease configure advertisment post options.\n\nIf you skip that step now you can later find it at ☸ Settings`,
                        {
                            reply_markup: markup_api.conf_post_options.reply_markup,
                            parse_mode: "HTML"
                        }
                    )
                })
                .catch(e => {
                    console.log(202, e)
                    if (e.message == 'error_saving_channel') 
                        ctx.reply(`There is error accured while connecting @${res.chat.username} to your profile`)
                    
                    else if (e.message == "channel_exists")
                        ctx.reply(`${text} channel already connected to your profile`)
                })
                    
                break

            case 'set_post_option':
                const channelName = sessions[from_id].context_1
                if (text.split(" ").length == 3) {
                    await db_api.updateChannelConfiguation(from_id, channelName, 'post_options', text.split(" "))
                    ctx.reply("Post details successfully saved, going back ...")
                    
                    messages.EditChannel(from_id, channelName).then(data => {
                        setTimeout(() => {
                            ctx.replyWithHTML(data.text, {
                                reply_markup: data.reply_markup,
                                parse_mode: "HTML"
                            })  
                        }, 3000)
                    })
                    .catch(e => {
                        console.log(e)
                    })
                }
                else {
                    ctx.replyWithHTML(
                        `Please check that you sending Post details correctly.`,
                        {
                            reply_markup: markup_api.edit_channel_back(channelName).reply_markup,
                            parse_mode: "HTML"
                        }
                    )
                }
            
                break                
            
            case 'buy_add':
                if (text.indexOf("@") != -1)
                    text = text.split("@")[1]

                sessions[from_id].context = {}

                db_api.findChannel(text)
                .then(res => {
                    sessions[from_id].context = res
                    if (!res.channel.status) {
                        ctx.replyWithHTML(
                            `Please choose duration of post`,
                            {
                                reply_markup: markup_api.get_post_options(text, res.config.post_options).reply_markup,
                                parse_mode: "HTML"
                            }
                        )
                    }
                    else {
                        ctx.replyWithHTML(
                            `@${text} channel is already busy with another post.\nEnd date is ${text.channel.post.end_day}`
                        )
                    }
                })
                .catch(async err => {
                    if (err.status == "not_connected") {
                        ctx.replyWithHTML(
                            `@${text} channel not connected. You can ask owner of this channel to connect`
                        )
                    }
                })

                break
        }

        /**
         * @description handler for client has sent content of post
         */
        if (typeof context == "object" && context.type == "option_selected") {
            const profile  = context.profile
            const lang     = profile.config.channel_language
            let creator_id = ""
            
            if (text.localeCompare(lang)) {
                const chat_name = context.profile.channel.name
                const admins     = await ctx.telegram.getChatAdministrators("@"+chat_name)
                const creator    = await channel_api.getChatCreatorUsername(admins)
                creator_id       = await channel_api.getChatCreator(admins)
                const msg_data   = await messages.AdminPostApproval({
                    text: text,
                    admin: creator,
                    channelName: chat_name,
                    requester: ctx.update.message.from.username,
                    requester_id: from_id
                })

                /**
                 * I have to localy sync client and admin sessions
                 */
                sessions[from_id].context.text = text
                sessions[creator_id] = sessions[from_id]
                
                ctx.telegram.sendMessage(
                    creator_id,
                    msg_data.text,
                    {
                        parse_mode: "HTML",
                        reply_markup: msg_data.reply_markup
                    }
                )
            }
            else {
                ctx.telegram.sendMessage(`Sorry. In this channel you can post only ${lang} ${lang_logo[lang]} language content`)
                sessions[from_id].context = {}
                sessions[creator_id].context = {}
            }
        }
    }
})

/**
 * отправляем в канал
 * пин в канал
 * изменить на статус канала на тру
 * отправляю уведомление овнеру
 * кидаю в сервис, жду пока не закончится срок поста
 * после окончания поста уведомление овнеру, статус на фолс 
 */
transaction_responder.on('transaction_submited', async (msg) => {
    try {
        msg.data.text += `\n\n<b>Posted with automated bot for advertising in channels - @${me}</b>`
        await bot.telegram.sendMessage(msg.data.channel, msg.data.text, {
            parse_mode: "HTML"
        })
    }
    catch (e) {
        console.log(e)
    }
})

bot.help((ctx) => ctx.reply('Help will be there soon'))

bot.launch()
