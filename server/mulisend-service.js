/**
 * @env
 */
const env = require('../env')


/**
 * @node_modules
 */
const Telegraf = require('telegraf')
const profiles = require('../mongoose/profile-schema').model


const bot = new Telegraf(env.BOT_TOKEN)


profiles.find({}, (e, d) => {
    for (let i = 0; i < d.length; i++) {
        bot.telegram.sendMessage(
            d[0]._id,
            "Hello"
        )
    }
})


bot.launch()