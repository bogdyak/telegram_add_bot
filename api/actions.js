const messages = require('./messages')

module.exports = {
    add_channel (ctx) {
        messages.AddChannelGet()
        .then(async data => {
            Promise.all([
                ctx.editMessageText(data.text, {
                    parse_mode: 'HTML',
                    reply_markup: data.reply_markup
                })
            ])
        })
        .catch(e => {

        })
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

}