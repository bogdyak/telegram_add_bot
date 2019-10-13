const Markup    = require('telegraf/markup')
const Extra     = require('telegraf/extra')
const lang_logo = require('./language-logo')
const db_api    = require('./mongo')

module.exports = {
    homePage: Extra.markup(
        Markup.keyboard([
            ['👨‍💻 Profile', '📢 Buy Ad'],
            ['☸ Settings', 'ℹ️ Help'],
        ])
        .resize()
    ),
        
    profile (address) {
        return Extra.markup(
            Markup.inlineKeyboard([
                [
                    { text:'💼 Channels', callback_data:'channels' }
                ],
                [
                    { text: "Account on Minterscan", url:`https://minterscan.net/address/${address}` }
                ],
                [
                    { text:'🔼 Withdraw', callback_data:'withdraw' },
                    { text:'🔽 Top up', callback_data:'deposit' }
                ]
            ])
        )
    },

    settings: Extra.markup(
        Markup.inlineKeyboard([[
            { text:'➕ Add channel', callback_data:'before/add/channel' },
            { text:'✏️ Edit channel', callback_data:'edit/channel' }
        ]])
    ),

    before_add_channel: Extra.markup(
        Markup.inlineKeyboard([
            [
                { text:'️ℹ️ No, show instruction', callback_data:'show/add/channel/instructions' },
                { text:'Yes', callback_data:'add/channel' }
            ],
            [
                { text:'↩️ Back', callback_data:'back/to/settings' }
            ]
        ])
    ),

    add_channel_get: Extra.markup(
        Markup.inlineKeyboard([{ text:'↩️ Back', callback_data:'back/to/before/add/channel' }])
    ),

    show_channels: Extra.markup(
        Markup.inlineKeyboard([{ text:'↩️ Back', callback_data:'back/to/profile' }])
    ),

    withdraw_max_and_back_to_profile (max) {
        return Extra.markup(
            Markup.inlineKeyboard([
                [{ text:`Withdraw max: ${max}`, callback_data:`withdraw/max` }],
                [{ text:'↩️ Back', callback_data:'back/to/profile' }]
            ]
        ))
    },

    show_channels_with_settings: Extra.markup(
        Markup.inlineKeyboard([
            { text:'↩️ Back', callback_data:'back/to/profile' },
            { text:'☸ Settings', callback_data:'back/to/settings' }
        ])
    ),

    channelsToEdit (list) {
        let array = list.map(el => {
            return [{ text:el.name, callback_data:`edit/channel/${el.name}` }]
        })
        array.push([{ text:'↩️ Back', callback_data: `back/to/settings` }])

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
                [{ text:'➕ Add post option', callback_data:`add/${channelName}/post/options` }],
                [{ text:'↩️ Back', callback_data:`edit/channel` }]
            ])
        )
    },

    show_channel_conf_listOfPosts (channelName, list) {
        let row = []
        let col = []
        list.map((el, index) => {
            if (!index) 
                col.push({ text:`${el.duration} ${el.numeration} ${el.price} BIP`, callback_data:`edit/post/${channelName}/${el.duration}/${el.numeration}/${el.price}` })

            else if (index % 3 == 0) {
                col.push({ text:`${el.duration} ${el.numeration} ${el.price} BIP`, callback_data:`edit/post/${channelName}/${el.duration}/${el.numeration}/${el.price}` })
                row.push(col)
                col = []
            }
            else
                col.push({ text:`${el.duration} ${el.numeration} ${el.price} BIP`, callback_data:`edit/post/${channelName}/${el.duration}/${el.numeration}/${el.price}` })

            if (index == list.length - 1 && col.length)
                row.push(col)
        })

        row.push([{ text:'➕ Add new', callback_data: `add/${channelName}/post/options/` }])
        row.push([{ text:'↩️ Back', callback_data: `edit/channel` }])

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
        row.push([{ text:'↩️ Back', callback_data: `edit/channel/${channelName}` }])
        
        return Extra.markup(
            Markup.inlineKeyboard(row)
        )
    },

    edit_channel_back (name) {
        return Extra.markup(
            Markup.inlineKeyboard([{ text:'↩️ Back', callback_data: `edit/channel/${name}` }])
        )
    },

    get_post_options (name, options) {
        let array = options.map((el) => {
            return [{
                text:`${el.duration} ${el.numeration} for ${el.price} BIP`,
                callback_data: `choose/adv/option/${el.duration}/${el.numeration}/${el.price}/${name}`
            }]
        })

        array.push([{ text:'↩️ Back', callback_data: `back/buy/ad` }])

        return Extra.markup(
            Markup.inlineKeyboard(array)
        )
    },

    post_text_admin_approval ({ admin, channelName, requester_id }) {
        return Extra.markup(
            Markup.inlineKeyboard([[
                {
                    text:'✅ Approve',
                    callback_data:`${admin}/approved/post/${channelName}/for/${requester_id}`
                },
                {
                    text:'❌ Decline',
                    callback_data:`${admin}/declined/post/${channelName}/for/${requester_id}`
                }
            ]])
        )
    },

    help: Extra.markup(
        Markup.inlineKeyboard([
            [{ text:'Help add channel', callback_data:`help/add/channel` }],
            [{ text:'Add / Edit price list options', callback_data:`help/pricelist` }],
            [{ text:'Withdrawing funds', callback_data:`help/withdraw` }]
        ])
    ),

    back_to_help: Extra.markup(
        Markup.inlineKeyboard([
            [{ text:'↩️ Back', callback_data:`back/to/help` }]
        ])
    ),

    explorer_url (hash) {
        return Extra.markup(
            Markup.inlineKeyboard([
                [{ text:"View on Minterscan", url:hash }]
            ])
        )
    },

    choose_withdraw_coin (balance) {
        let array = balance.map((el) => {
            if (el.coin != "BIP") {
                if (Number(el.sellPrice) > 0.01)
                    return [{
                        text:el.coin,
                        callback_data: `withdraw/currency/${el.coin}`
                    }]
            }

            else if (el.coin == "BIP" && Number(el.amount) > 0.01)
                return [{
                    text:el.coin,
                    callback_data: `withdraw/currency/${el.coin}`
                }]
        })

        array.push([{ text:'↩️ Back', callback_data:'back/to/profile' }])

        return Extra.markup(
            Markup.inlineKeyboard(array)
        )
    },

    change_delete_pricelist_option (channelName, data) {
        return Extra.markup(
            Markup.inlineKeyboard([
                [
                    // {
                //     text:'✏️ Edit',
                //     callback_data:`editpricelistoption/${channelName}/${data[3]}/${data[4]}/${data[5]}`
                // },
                {
                    text:'❌ Delete',
                    callback_data:`deletepricelistoption/${channelName}/${data[3]}/${data[4]}/${data[5]}`
                }],
                [{
                    text:'↩️ Back',
                    callback_data: `edit/channel/${channelName}`
                }]
            ])
        )
    }
}