/**
 * @env
 */
const env = require('./env')

/**
 * @node_modules
 */
const Telegraf = require('telegraf')

/**
 * @connection
 */
const bot = new Telegraf(env.BOT_TOKEN)

/**
 * @custom_modules_apis
 */
const db_api     = require('./api/mongo')
const markup_api = require('./api/markups')
const messages   = require('./api/messages')


bot.use(Telegraf.log())

bot.start(async (ctx) => {
    try {
        await db_api.new_user(ctx.message.from)
        return ctx.reply('Hello, my name is David Advertise. Thank you for choosing me.', markup_api.homePage)
    }
    catch (e) {
        console.log(e)

        if (e.message == "user_exists")
            return ctx.reply('Welcome back', markup_api.homePage)

        else 
            return ctx.reply('Oops, there is error accured. Please report to @b_sizov')
    }
})

/**
 * @description
 * This is handler for buttons clicks
 */
bot.on('message', async (ctx) => {
    const text = ctx.message.text

    console.log(ctx)

    if (typeof text != 'undefined' && text) {
        switch (text) {
            /**
             * @Profile is details of user account, wallet, name, channels, etc.
             */
            case 'Profile': messages.Profile(ctx.message.from.id)
                .then(data => {
                    ctx.replyWithHTML(data.text, { reply_markup: data.reply_markup })
                })

            /**
             * @Settings is where user can change language and some more configurations
             */   
            case '☸ Setting': messages.Settings(ctx.message.from.id)
                .then(data => {
                    ctx.replyWithHTML(data.text, { reply_markup: data.reply_markup })
                })

            /**
             * @add_channel is message that user call when want to add new channels. Replying with request to enter name
             */
            case 'add_channel': messages.AddChannelGet(ctx.message.from.id)
                .then(data => {
                    ctx.state.context = "add_channel"
                    ctx.replyWithHTML(data.text)
                })

            /**
             * @Balance is simply returning balance of linked crypto wallet
             */
            case 'Balance': messages.Balance(ctx.message.from.id)
                .then(data => {
                    ctx.replyWithHTML(data.text, { reply_markup: data.reply_markup })
                })

            /**
             * @Channels return list of channels where BOT is admin and can pin. Also some stats
             */
            case 'Channels': messages.Channels(ctx.message.from.id)
                .then(data => {
                    ctx.replyWithHTML(data.text, { reply_markup: data.reply_markup })
                })

            
        }
    }
    // if ()
})

bot.command('pin', (ctx) => {
    // console.log(ctx)
    // ctx.sendMessage({
    //     chat_id: "@akdnfqkwerqwer",
    //     text: "Hello"
    // })
    ctx.getChat().then(console.log)
    // ctx.pinChatMessage({
    //     chat_id: "@akdnfqkwerqwer",
    //     message_id: ""
    // })
})

bot.help((ctx) => ctx.reply('Help will be there soon'))

bot.launch()


// try {
//     const profile = await db_api.get_user(ctx.message.from.id)
//     console.log(profile)
// }
// catch (e) {
//     if (e.message == "no_user") {
//         ctx.reply('You need to execute /start command first')
//     }
// }