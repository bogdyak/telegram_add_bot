/**
 * @env
 */
const env = require('./env')


/**
 * @node_modules
 */
const Telegraf = require('telegraf')
const session  = require('telegraf/session')
const cote     = require('cote')
const Minter   = require('@aloborio/blockchain/dist/index')


/**
 * @connection
 */
const bot = new Telegraf(env.BOT_TOKEN)
const transaction_responder = new cote.Responder({ name:"server-tx-responder", key:"transactions" })
const pin_requester = new cote.Requester({ name:"server-pin-requester", key:"pin-service" })
const pin_responder = new cote.Responder({ name:"server-pin-responder", key:"pin-back-service" })


/**
 * @custom_modules_apis
 */
const db_api        = require('./api/mongo')
const markup_api    = require('./api/markups')
const messages      = require('./api/messages')
const channel_api   = require('./api/channelApi')
const actions       = require('./api/actions')
const lang_logo     = require('./api/language-logo')
const debug         = require('./api/debug')
const wallet        = require('./api/wallet')
const minter        = new Minter.default()


let sessions = {}
let me = ""


const session_check = (id) => {
    if (typeof sessions[id] == "undefined")
        sessions[id] = {}
}

const context_check = (id) => {
    if (typeof sessions[id].context == "undefined")
        sessions[id].context = {}
}

const sessions_check_update = (id, update) => {
    session_check(id)
    context_check(id)
    sessions[id].context = update
}


bot.use(session())
bot.use((ctx, next) => {
    if (typeof ctx.update.callback_query != "undefined") {
        session_check(ctx.update.callback_query.from.id)
        context_check(ctx.update.callback_query.from.id)           
    }
    else if (typeof ctx.update.message != "undefined") {
        session_check(ctx.update.message.from.id)
        context_check(ctx.update.message.from.id)
    }

    return next()
})

bot.telegram.getMe().then(data => {
    me = data.username
})

// you can put your telegram id here, to get message when bot restarted
bot.telegram.sendMessage(env.CREATOR, "Bot restarted")

bot.start(async (ctx) => {
    try {
        await db_api.new_user(ctx.message.from)
        messages.Welcome().then(data => {
            ctx.replyWithHTML(data.text, { reply_markup:markup_api.homePage })
        })
    }
    catch (e) {
        if (e.message != "user_exists")
            debug.notifyAndReply(ctx, e)
    }
    if (ctx.startPayload) {
        if (ctx.startPayload.indexOf("@") != -1)
            ctx.startPayload = ctx.startPayload.split("@")[1]

        const from_id = ctx.message.from.id
        sessions_check_update(from_id, {})

        db_api.findChannel(ctx.startPayload)
        .then(res => {
            sessions_check_update(from_id, res)
            if (!res.channel.status) {
                ctx.replyWithHTML(
                    `Please select a post option suitable by the duration and price.`,
                    {
                        reply_markup: markup_api.get_post_options(ctx.startPayload, res.config.post_options).reply_markup,
                        parse_mode: "HTML"
                    }
                )
            }
            else {
                ctx.replyWithHTML(
                    `@${ctx.startPayload} channel is already busy with another post.\n\nYou can buy after ${res.channel.post.end_day}`
                )
            }
        })
        .catch(e => {
            if (e.status == "not_connected") {
                ctx.replyWithHTML(
                    `@${ctx.startPayload} channel not connected. You can ask owner of this channel to connect`
                )
            }
            else 
                debug.notifyAndReply(ctx, e)
        })
    }
})

/**
 * @add_channel is message that user call when want to add new channels. Replying with request to enter name
 */
bot
.action('before/add/channel', (ctx) => actions.before_add_channel(ctx))
.action('add/channel', (ctx) => {
    sessions_check_update(ctx.update.callback_query.from.id, "add_channel")
    actions.add_channel(ctx)
})
.action('back/to/help', (ctx) => actions.back_to_help(ctx))
.action('help/add/channel', (ctx) => actions.help_add_channel(ctx))
.action('help/withdraw', (ctx) => actions.help_withdraw(ctx))
.action('help/pricelist', (ctx) => actions.help_addedit_pricelist(ctx))
.action('show/add/channel/instructions', (ctx) => actions.show_add_channel_instructions(ctx))
.action('back/to/before/add/channel', (ctx) => {
    sessions_check_update(ctx.update.callback_query.from.id, {})
    actions.back_to_before_add_channel(ctx)
})
.action('back/to/settings', (ctx) => {
    sessions_check_update(ctx.update.callback_query.from.id, {})
    actions.back_to_settings(ctx)
})
.action('back/to/profile', (ctx) => {
    sessions_check_update(ctx.update.callback_query.from.id, {})
    actions.back_to_profile(ctx)
})
.action('channels', (ctx) => actions.channels(ctx))
.action('edit/channel', (ctx) => actions.edit_channel(ctx))
.action('back/buy/ad', (ctx) => {
    messages.BuyAdvertising(ctx.update.callback_query.from.id)
    .then(data => {
        sessions_check_update(ctx.update.callback_query.from.id, "buy_ad")
        ctx.replyWithHTML(data.text, { reply_markup: data.reply_markup })
    })
    .catch(e => debug.notifyAndReply(ctx, e))
})
.action('withdraw', (ctx) => {
    sessions_check_update(ctx.update.callback_query.from.id, "withdraw")
    actions.withdraw(ctx)
})
.action('deposit', (ctx) => {
    sessions_check_update(ctx.update.callback_query.from.id, {})
    actions.deposit(ctx)
})
.action('withdraw/max', (ctx) => {
    wallet.withdraw(
        ctx,
        sessions[ctx.update.callback_query.from.id].context,
        sessions[ctx.update.callback_query.from.id].context.withdraw_data.max_withdraw
    )
    sessions_check_update(ctx.update.callback_query.from.id, {})
})
.action(/(^[A-Za-z0-9\[\]()*\-+/%]+)/, async (ctx) => {
    const data    = ctx.update.callback_query.data.split("/")
    const from_id = ctx.update.callback_query.from.id

    console.log(data)

    let command = "";
    
    (command == "")
        ? ( data[0] + data[1] == "editchannel" ) ? command = "editchannel" : ""
        : null;
    
    (command == "")
        ? ( data[0] + data[2] + data[3] == "editchannellanguage" ) ? command = "editchannellanguage" : ""
        : null;
    
    (command == "")
        ? ( data[0] + data[1] + data[2] == "setchannellanguage" ) ? command = "setchannellanguage" : ""
        : null;
    
    (command == "")
        ? ( data[0] + data[2] + data[3] == "editpostoptions" ) ? command = "editpostoptions" : ""
        : null;
    
    (command == "")
        ? ( data[0] + data[2] + data[3] == "addpostoptions" ) ? command = "addpostoptions" : ""
        : null;
    
    (command == "")
        ? ( data[0] + data[1] + data[2] == "chooseadvoption" ) ? command = "chooseadvoption" : ""
        : null;
    
    (command == "")
        ? ( data[1] + data[2] + data[4] == "approvedpostfor" ) ? command = "approvedpostfor" : ""
        : null;
    
    (command == "")
        ? ( data[1] + data[2] + data[4] == "declinedpostfor" ) ? command = "declinedpostfor" : "" 
        : null;

    (command == "")
        ? ( data[0] + data[1] == "withdrawcurrency" ) ? command = "withdrawcurrency" : "" 
        : null;

    (command == "")
        ? ( data[0] + data[1] == "editpost" ) ? command = "editpost" : "" 
        : null;

    (command == "")
        ? ( data[0] == "editpricelistoption" ) ? command = "editpricelistoption" : "" 
        : null;

    (command == "")
        ? ( data[0] == "deletepricelistoption" ) ? command = "deletepricelistoption" : "" 
        : null;
 
    switch (command) {
        case "editchannel" : actions.editchannel(ctx, data, sessions)
        break

        case "editchannellanguage" : actions.editchannellanguage(ctx, data, sessions)
        break

        case "setchannellanguage" : actions.setchannellanguage(ctx, data, sessions)
        break

        case "editpost" : actions.editpostoptions(ctx, data, sessions)
        break

        case "editpostoptions": actions.editpostoptions(ctx, data, sessions)
        break

        case "addpostoptions" :
            sessions_check_update(from_id, `set_post_option`)
            actions.addpostoptions(ctx, data, sessions)
        break

        case "chooseadvoption" :
            sessions_check_update(from_id, {
                type: 'option_selected',
                duration: data[3] + "_" + data[4],
                amount: data[5],
                profile: sessions[from_id].context
            })
            actions.chooseadvoption(ctx, data, sessions)
        break

        case "approvedpostfor" : actions.approvedpostfor(ctx, data, sessions)
        break

        case "declinedpostfor" : actions.declinedpostfor(ctx, data, sessions)
        break

        case 'withdrawcurrency' : 
            const currency_to_withdraw = data[2]

            const profile = await db_api.get_user(from_id)
            const balance = await minter.getBalanceAll(profile.settings.wallet.public)

            let withdraw_data = ""

            for (let i =0 ; i < balance.length; i++) {
                if (balance[i].coin == currency_to_withdraw) {
                    if (currency_to_withdraw != "BIP") {
                        const worth = await minter.getSellPrice(balance[i].coin, balance[i].amount, "BIP")
                        balance[i].sellPrice = Number(worth) / Math.pow(10, 18)
                        balance[i].pricePerOne = balance[i].sellPrice / balance[i].amount
                        balance[i].max_withdraw = balance[i].amount - (0.01 / balance[i].pricePerOne)
                        withdraw_data = balance[i]
    
                        i = balance.length
                    }
                    
                    else {
                        balance[i].max_withdraw = balance[i].amount - 0.01
                        withdraw_data = balance[i]

                        i = balance.length
                    }
                }
            }

            sessions_check_update(from_id, {
                type: "withdraw",
                profile: profile,
                withdraw_data: withdraw_data
            })

            actions.withdrawcurrency(ctx, currency_to_withdraw)
        break

        case "deletepricelistoption" : actions.delete_price_list_option(ctx, data, sessions)
        break

        case "editpricelistoption" : actions.edit_price_list_option(ctx, data, sessions)
        break
    }
})


/**
 * @description
 * This is handler for buttons clicks
 */
bot.on('message', async (ctx) => {
    let text = ctx.message.text
    const from_id = ctx.message.from.id

    switch (text) {
        case '👨‍💻 Profile': 
            sessions_check_update(from_id, {})
        break

        case '📢 Buy Ad': 
            sessions_check_update(from_id, {})
        break

        case '☸ Settings': 
            sessions_check_update(from_id, {})
        break

        case 'ℹ️ Help':
            sessions_check_update(from_id, {})
        break
    }

    if (!Object.keys(sessions[from_id].context).length && typeof text != 'undefined' && text) {
        switch (text) {
            /**
             * @Profile is details of user account, wallet, name, channels, etc.
             */
            case '👨‍💻 Profile': messages.Profile(from_id)
                .then(data => {
                    ctx.replyWithHTML(data.text, { reply_markup: data.reply_markup })
                })
                .catch(e => debug.notifyAndReply(ctx, e))
            break

            case '📢 Buy Ad': messages.BuyAdvertising(from_id)
                .then(data => {
                    sessions_check_update(from_id, "buy_ad")
                    ctx.replyWithHTML(data.text, { reply_markup: data.reply_markup })
                })
                .catch(e => debug.notifyAndReply(ctx, e))
            break

            /**
             * @Settings is where user can change language and some more configurations
             */   
            case '☸ Settings': messages.Settings(from_id)
                .then(data => {
                    ctx.replyWithHTML(data.text, { reply_markup: data.reply_markup })
                })
                .catch(e => debug.notifyAndReply(ctx, e))
            break

            case 'ℹ️ Help': messages.Help()
                .then(data => {
                    ctx.replyWithHTML(data.text, { reply_markup: data.reply_markup })
                })
                .catch(e => debug.notifyAndReply(ctx, e))
            break
        }
    }

    /**
     * @ctx_session_context if there is context in message use context as API and text as data.
     */
    if (Object.keys(sessions[from_id].context).length) {
        const context = sessions[from_id].context
        
        /**
         * @description hanlder for simple message with context: add_channel, set_post_option, buy_ad
         */
        switch (context) {
            case 'add_channel':
                // if user not specified '@' at channel name need to prepend it
                if (text.indexOf("@") == -1)
                    text = "@" + text

                sessions_check_update(from_id, {})

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
                    if (e.message == 'error_saving_channel') 
                        ctx.reply(`There is error accured while connecting @${res.chat.username} to your profile`)
                    
                    else if (e.message == "channel_exists")
                        ctx.reply(`${text} channel already connected to your profile`)

                    else
                        debug.notifyAndReply(ctx, e)
                })
                    
            break

            case 'set_post_option':
                const channelName = sessions[from_id].context_1
                if (text.split(" ").length == 3) {
                    await db_api.updateChannelConfiguation(from_id, channelName, 'post_options', text.split(" "))
                    ctx.reply("Post details successfully saved, going back ...")
                    sessions_check_update(from_id, {})
                    
                    messages.EditChannel(from_id, channelName).then(data => {
                        setTimeout(() => {
                            ctx.replyWithHTML(data.text, {
                                reply_markup: data.reply_markup,
                                parse_mode: "HTML"
                            })  
                        }, 1000)
                    })
                    .catch(e => debug.notifyAndReply(ctx, e))
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
            
            case 'buy_ad':
                if (text.indexOf("@") != -1)
                    text = text.split("@")[1]

                sessions_check_update(from_id, {})

                db_api.findChannel(text)
                .then(res => {
                    sessions_check_update(from_id, res)
                    if (!res.channel.status) {
                        ctx.replyWithHTML(
                            `Please select a post option suitable by the duration and price.`,
                            {
                                reply_markup: markup_api.get_post_options(text, res.config.post_options).reply_markup,
                                parse_mode: "HTML"
                            }
                        )
                    }
                    else {
                        ctx.replyWithHTML(
                            `@${text} channel is already busy with another post.\n\nYou can buy after ${res.channel.post.end_day}`
                        )
                    }
                })
                .catch(e => {
                    if (e.status == "not_connected") {
                        ctx.replyWithHTML(
                            `@${text} channel not connected. You can ask owner of this channel to connect`
                        )
                    }
                    else 
                        debug.notifyAndReply(ctx, e)
                })

            break
        }

        /**
         * @description handler for client has sent content of post
         */
        if (typeof context == "object") {
            const profile = context.profile

            switch (context.type) {
                case "option_selected" :
                    const lang      = profile.config.channel_language
                    const chat_name = context.profile.channel.name
                    let creator_id = ""
                    
                    if (text.localeCompare(lang) == 1) {
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
                        sessions_check_update(creator_id, sessions[from_id].context)
                        
                        ctx.telegram.sendMessage(
                            creator_id,
                            msg_data.text,
                            {
                                parse_mode: "HTML",
                                reply_markup: msg_data.reply_markup
                            }
                        )
                        ctx.telegram.sendMessage(
                            from_id,
                            `<b>Please wait until @${creator} verify your advertising post</b>\n\nI will notify you in the positive and negative case.`,
                            { parse_mode: "HTML" }
                        )
                    }
                    else {
                        ctx.telegram.sendMessage(
                            from_id,
                            `Sorry. In @${chat_name} channel you can post only ${lang} ${lang_logo[lang]} language content`,
                            { parse_mode: "HTML" }
                        )
                        
                        sessions_check_update(from_id, {})
                        sessions_check_update(creator_id, {})
                    }
                break
                
                case "withdraw" :
                    try {
                        if (text.indexOf('Mx') != -1) {
                            const wallet = profile.settings.wallet.public
                            
                            if (text == wallet) {
                                ctx.reply(`Provided address is same as current. Please provide another one.`, { parse_mode:"HTML" })
                            }
                            else {
                                sessions[from_id].context.withdraw_data.address = text
                                sessions[from_id].context.type = "withdraw_set_amount"
    
                                ctx.reply(
                                    `Please send amount to withdraw.\n\n<b>Maximum amount: ~ ${context.withdraw_data.max_withdraw.toFixed(3)}...</b>`,
                                    {
                                        parse_mode:"HTML",
                                        reply_markup:markup_api.withdraw_max_and_back_to_profile(context.withdraw_data.max_withdraw).reply_markup
                                    }
                                )
                            }
                        }
                        else {
                            ctx.reply(`Entered address is <b>invalid</b>.\nPlease enter valid.`, { parse_mode:"HTML" })
                        }
                    }
                    catch (e) {
                        console.log(e)
                        debug.notifyAndReply(ctx, e)
                    }
                break

                case "withdraw_set_amount": 
                    wallet.withdraw(ctx, sessions[from_id].context, text)
                    sessions_check_update(from_id, {})
                break
            }
        }       
    }
})

transaction_responder.on('transaction_submited', async (msg) => {
    try {
        msg.data.text += `\n\n<a href="https://t.me/${me.replace("@", "")}?start=${msg.data.channel}">CLICK TO POST AD IN THIS CHANNEL</a>`
        const message_result = await bot.telegram.sendMessage("@"+msg.data.channel, msg.data.text, {
            parse_mode: "HTML"
        })
        await bot.telegram.pinChatMessage(
            "@"+msg.data.channel,
            message_result.message_id,
            { parse_mode:"HTML" }
        )
        await bot.telegram.sendMessage(
            msg.data.admin,
            `<b>New post in @${msg.data.channel} been posted and pinned</b>`,
            { parse_mode: "HTML" }
        )
        await bot.telegram.sendMessage(
            msg.data.client,
            `<b>Your advertisment post in @${msg.data.channel} been successfully posted</b>`,
            { parse_mode: "HTML" }
        )
        await db_api.changeChannelStatus(msg.data.channel, msg.data.duration)

        pin_requester.send({ type:'start_countdown', data:{
            period: msg.data.duration.split("_")[0],
            numeration: msg.data.duration.split("_")[1],
            pinned_msg_id: message_result.message_id,
            channel: msg.data.channel,
            admin: msg.data.admin,
            client: msg.data.client,
        }})
        
    }
    catch (e) {
        debug.notifyAndReply(ctx, e)
    }
})

pin_responder.on('unpin_post', async (msg) => {
    try {
        await bot.telegram.unpinChatMessage("@"+msg.data.channel)
        await db_api.changeChannelStatus(msg.data.channel)
    }
    catch (e) {
        debug.notifyAndReply(ctx, e)
    }
})

bot.launch()
