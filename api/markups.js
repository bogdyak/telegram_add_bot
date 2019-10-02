const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')


module.exports = {
    homePage: Markup
        .keyboard([
            ['Profile', '📢 Ads'],
            ['☸ Setting'],
            ['⭐️ Rate us', '👥 Share', '📞 Feedback']
        ])
        .oneTime()
        .resize()
        .extra(),
        
    profile: Extra.markup(
        Markup.inlineKeyboard([
            [
                { text:'Channels', callback_data:'Channels' },
                { text:'Balance', callback_data:'Balance' }
            ],
        ])
    ),

    settings: Extra.markup(
        Markup.inlineKeyboard([
            [{ text:'Add channel', callback_data:'add_channel' }, { text:'Edit channel', callback_data:'edit_channel' }],
        ])
    ),
}