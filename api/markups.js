const Markup    = require('telegraf/markup')
const Extra     = require('telegraf/extra')
const lang_logo = require('./language-logo')
const db_api    = require('./mongo')

module.exports = {
    homePage: Markup
        .keyboard([
            ['👨‍💻 Profile', '📢 Buy Add'],
            ['☸ Settings'],
        ])
        .oneTime()
        .resize()
        .extra(),
        
    profile: Extra.markup(
        Markup.inlineKeyboard([
            [
                { text:'Channels', callback_data:'channels' },
            ],
        ])
    ),

    settings: Extra.markup(
        Markup.inlineKeyboard([[
            { text:'➕ Add channel', callback_data:'add_channel' },
            { text:'✏️ Edit channel', callback_data:'edit_channel' }
        ]])
    ),

    add_channel_get: Extra.markup(
        Markup.inlineKeyboard([{ text:'Back', callback_data:'back_to_settings' }])
    ),

    show_channels: Extra.markup(
        Markup.inlineKeyboard([{ text:'Back', callback_data:'back_to_profile' }])
    ),

    show_channels_with_settings: Extra.markup(
        Markup.inlineKeyboard([
            { text:'Back', callback_data:'back_to_profile' },
            { text:'☸ Settings', callback_data:'back_to_settings' }
        ])
    ),

    channelsToEdit (list) {
        let array = list.map(el => {
            return [{ text:el.name, callback_data:`edit_channel_${el.name}` }]
        })
        array.push([{ text:'Back', callback_data: `back_to_settings` }])

        return Extra.markup(
            Markup.inlineKeyboard(array)
        )
    },

    conf_post_options: Extra.markup(
        Markup.inlineKeyboard([
            { text:'✏️ Configure channels', callback_data:'edit_channel' }
        ])
    ),

    show_channel_conf_emptyposts (channelName) {
        return Extra.markup(
            Markup.inlineKeyboard([
                [{ text:'✏️ Edit channel language', callback_data:`edit_${channelName}_channel_language` }],
                [{ text:'➕ Add post option', callback_data:`edit_${channelName}_post_options` }],
                [{ text:'Back', callback_data:`edit_channel` }]
            ])
        )
    },

    show_channel_conf_listOfPosts (channelName, list) {
        let row = []
        let col = []
        list.map((el, index) => {
            if (!index) 
                col.push({ text:`${el.duration} ${el.numeration} ${el.price} BIP`, callback_data:`edit_post_${el.duration}_${el.numeration}_${el.price}` })

            else if (index % 3 == 0) {
                col.push({ text:`${el.duration} ${el.numeration} ${el.price} BIP`, callback_data:`edit_post_${el.duration}_${el.numeration}_${el.price}` })
                row.push(col)
                col = []
            }
            else
                col.push({ text:`${el.duration} ${el.numeration} ${el.price} BIP`, callback_data:`edit_post_${el.duration}_${el.numeration}_${el.price}` })

            if (index == list.length - 1 && col.length)
                row.push(col)
        })

        row.push([{ text:'➕ Add new', callback_data: `add_post_option_${channelName}` }])
        row.push([{ text:'Back', callback_data: `edit_channel` }])

        return Extra.markup(
            Markup.inlineKeyboard(row)
        )
    },

    show_language_configs (channelName) {
        let col = []
        let row = []

        lang_logo.list.map(function (el, index) {
            if (!index) {
                col.push({ text: `${lang_logo[el]} ${el}`, callback_data: `set_channel_language_${el}_${channelName}` })
            }

            else if (index % 5 == 0){
                col.push({ text: `${lang_logo[el]} ${el}`, callback_data: `set_channel_language_${el}_${channelName}` })
                row.push(col)
                col = []
            }
            else
                col.push({ text: `${lang_logo[el]} ${el}`, callback_data: `set_channel_language_${el}_${channelName}` })

            if (index == lang_logo.list.length - 1 && col.length) {
                row.push(col)
            }
        })
        row.push([{ text:'Back', callback_data: `edit_channel_${channelName}` }])
        
        return Extra.markup(
            Markup.inlineKeyboard(row)
        )
    },

    edit_channel_back (name) {
        return Extra.markup(
            Markup.inlineKeyboard([{ text:'Back', callback_data: `edit_${name}_post_options` }])
        )
    },

    get_post_options (name, options) {
        let array = options.map((el) => {
            return [{
                text:`${el.duration} ${el.numeration} for ${el.price} BIP`,
                callback_data: `choose_adv_option_${el.duration}_${el.numeration}_${el.price}_${name}`
            }]
        })

        array.push([{ text:'Back', callback_data: `back_to_settings` }])

        return Extra.markup(
            Markup.inlineKeyboard(array)
        )
    }
}