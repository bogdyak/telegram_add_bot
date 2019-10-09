const creator = require('../env').CREATOR

module.exports = {
    notifyAndReply (ctx, e) {
        ctx.telegram.sendMessage(creator, e.toString(), { parse_mode:"HTML" })
        ctx.reply('<code>We are really sorry.\n\nError occurred.\nSupport team already notified and fixing it...</code>', { parse_mode:"HTML" })
    }
}