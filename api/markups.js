const Markup    = require('telegraf/markup')
const Extra     = require('telegraf/extra')
const lang_logo = require('./language-logo')
const db_api    = require('./mongo')

module.exports = {
    homePage: Markup
        .keyboard([
            ['👨‍💻 Profile', '📢 Buy Ad'],
            ['☸ Settings', 'ℹ️ Help'],
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
            { text:'➕ Add channel', callback_data:'add/channel' },
            { text:'✏️ Edit channel', callback_data:'edit/channel' }
        ]])
    ),

    add_channel_get: Extra.markup(
        Markup.inlineKeyboard([{ text:'Back', callback_data:'back/to/settings' }])
    ),

    show_channels: Extra.markup(
        Markup.inlineKeyboard([{ text:'Back', callback_data:'back/to/profile' }])
    ),

    show_channels_with_settings: Extra.markup(
        Markup.inlineKeyboard([
            { text:'Back', callback_data:'back/to/profile' },
            { text:'☸ Settings', callback_data:'back/to/settings' }
        ])
    ),

    channelsToEdit (list) {
        let array = list.map(el => {
            return [{ text:el.name, callback_data:`edit/channel/${el.name}` }]
        })
        array.push([{ text:'Back', callback_data: `back/to/settings` }])

        return Extra.markup(
            Markup.inlineKeyboard(array)
        )
    },

    conf_post_options: Extra.markup(
        Markup.inlineKeyboard([
            { text:'✏️ Configure channels', callback_data:'edit/channel' }
        ])
    ),

    show_channel_conf_emptyposts (channelName) {
        return Extra.markup(
            Markup.inlineKeyboard([
                [{ text:'✏️ Edit channel language', callback_data:`edit/${channelName}/channel/language` }],
                [{ text:'➕ Add post option', callback_data:`edit/${channelName}/post/options` }],
                [{ text:'Back', callback_data:`edit/channel` }]
            ])
        )
    },

    show_channel_conf_listOfPosts (channelName, list) {
        let row = []
        let col = []
        list.map((el, index) => {
            if (!index) 
                col.push({ text:`${el.duration} ${el.numeration} ${el.price} BIP`, callback_data:`edit/post/${el.duration}/${el.numeration}/${el.price}` })

            else if (index % 3 == 0) {
                col.push({ text:`${el.duration} ${el.numeration} ${el.price} BIP`, callback_data:`edit/post/${el.duration}/${el.numeration}/${el.price}` })
                row.push(col)
                col = []
            }
            else
                col.push({ text:`${el.duration} ${el.numeration} ${el.price} BIP`, callback_data:`edit/post/${el.duration}/${el.numeration}/${el.price}` })

            if (index == list.length - 1 && col.length)
                row.push(col)
        })

        row.push([{ text:'➕ Add new', callback_data: `add/post/option/${channelName}` }])
        row.push([{ text:'Back', callback_data: `edit/channel` }])

        return Extra.markup(
            Markup.inlineKeyboard(row)
        )
    },

    show_language_configs (channelName) {
        let col = []
        let row = []

        lang_logo.list.map(function (el, index) {
            if (!index) {
                col.push({ text: `${lang_logo[el]} ${el}`, callback_data: `set/channel/language/${el}/${channelName}` })
            }

            else if (index % 5 == 0){
                col.push({ text: `${lang_logo[el]} ${el}`, callback_data: `set/channel/language/${el}/${channelName}` })
                row.push(col)
                col = []
            }
            else
                col.push({ text: `${lang_logo[el]} ${el}`, callback_data: `set/channel/language/${el}/${channelName}` })

            if (index == lang_logo.list.length - 1 && col.length) {
                row.push(col)
            }
        })
        row.push([{ text:'Back', callback_data: `edit/channel/${channelName}` }])
        
        return Extra.markup(
            Markup.inlineKeyboard(row)
        )
    },

    edit_channel_back (name) {
        return Extra.markup(
            Markup.inlineKeyboard([{ text:'Back', callback_data: `edit/${name}/post/options` }])
        )
    },

    get_post_options (name, options) {
        let array = options.map((el) => {
            return [{
                text:`${el.duration} ${el.numeration} for ${el.price} BIP`,
                callback_data: `choose/adv/option/${el.duration}/${el.numeration}/${el.price}/${name}`
            }]
        })

        array.push([{ text:'Back', callback_data: `back/to/settings` }])

        return Extra.markup(
            Markup.inlineKeyboard(array)
        )
    },

    post_text_admin_approval ({ admin, channelName, requester_id }) {
        return Extra.markup(
            Markup.inlineKeyboard([[
                {
                    text:'Approve',
                    callback_data:`${admin}/approved/post/${channelName}/for/${requester_id}`
                },
                {
                    text:'Decline',
                    callback_data:`${admin}/declined/post/${channelName}/for/${requester_id}`
                }
            ]])
        )
    }
}