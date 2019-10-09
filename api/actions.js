const messages = require('./messages')
const fs       = require('fs')
const path     = require('path')

module.exports = {
    before_add_channel (ctx) {
        messages.BeforeAddChannel()
        .then(async data => {
            ctx.editMessageText(data.text, {
                parse_mode: 'HTML',
                reply_markup: data.reply_markup
            })
        })
        .catch(e => {

        })
    },

    back_to_before_add_channel (ctx) {
        messages.BeforeAddChannel()
        .then(async data => {
            ctx.editMessageText(data.text, {
                parse_mode: 'HTML',
                reply_markup: data.reply_markup
            })
        })
        .catch(e => {

        })
    },

    add_channel (ctx) {
        messages.AddChannelGet()
        .then(async data => {
            ctx.editMessageText(data.text, {
                parse_mode: 'HTML',
                reply_markup: data.reply_markup
            })
        })
        .catch(e => {

        })
    },

    help_add_channel (ctx) {
        messages.HelpAddChannel()
        .then(async data => {
            ctx.editMessageText(data.text, {
                parse_mode: 'HTML',
                reply_markup: data.reply_markup
            })
        })
        .catch(e => {
            console.log(e)
        })
    },

    back_to_help () {
        messages.Help()
        .then(data => {
            ctx.editMessageText(data.text, {
                reply_markup: data.reply_markup,
                parse_mode: "HTML"
            })
        })
    },

    show_add_channel_instructions (ctx) {
        messages.AddChannelInstruction()
        .then((data) => { 
            ctx.editMessageText(data.text, { parse_mode:"HTML" })
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
    },

    back_to_settings (ctx) {
        messages.Settings(ctx.update.callback_query.from.id)
        .then(async data => {
            ctx.editMessageText(data.text, {
                parse_mode: 'HTML',
                reply_markup: data.reply_markup
            })
        })
        .catch(e => {

        })
    },

    back_to_profile (ctx) {
        messages.Profile(ctx.update.callback_query.from.id)
        .then(async data => {
            ctx.editMessageText(data.text, {
                parse_mode: 'HTML',
                reply_markup: data.reply_markup
            })
        })
        .catch(e => {
    
        })
    },

    channels (ctx) {
        messages.Channels(ctx.update.callback_query.from.id)
        .then(data => {
            ctx.editMessageText(data.text, {
                parse_mode:'HTML',
                reply_markup: data.reply_markup
            })
        })
        .catch(e => {
            ctx.editMessageText(e.text)
        })
    },

    edit_channel (ctx) {
        messages.ChannelsToEdit(ctx.update.callback_query.from.id)
        .then(data => {
            ctx.editMessageText(data.text, {
                reply_markup: data.reply_markup,
                parse_mode: "HTML"
            })
        })
        .catch(e => {
            ctx.editMessageText(e.text)
        })
    },

    withdraw (ctx) {
        messages.Withdraw(ctx.update.callback_query.from.id)
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
}