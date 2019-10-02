const db_api     = require('./mongo')
const markup_api = require('./markups')
const Abr        = require('@aloborio/blockchain/dist/index')

const abr = new Abr.default()

module.exports = {
    Profile (id) {
        return new Promise(async (resolve, reject) => {
            try {
                const profile = await db_api.get_user(id)
                const balance = await abr.MINTER.getBalance(profile.settings.wallet.public, 3)

                resolve({
                    text:`
<b>ACCOUNT DETAILS</b>
                        
<b>Username:</b>  ${profile.username}
<b>First name:</b>  ${profile.first_name}
<b>Second name:</b>  ${(typeof profile.second_name == "undefined" || !profile.second_name) ? "" : profile.second_name}
                        
<b>Language:</b>  ${profile.settings.language_code}

<b>Connected channels:</b>  ${profile.settings.channels.length}

<b>Wallet:</b>  ${profile.settings.wallet.public}
<b>Balance:</b>  ${balance} BIP
                    `,
                    reply_markup: markup_api.profile.reply_markup
                })
            }
            catch (e) {
                console.log(e)
                if (e.message == "no_user") {
                    resolve({ text:'You need to execute /start command first' })
                }
            }
        })
    },

    Settings (id) {
        return new Promise(async (resolve, reject) => {
            try {
                await db_api.get_user(id)
                resolve({
                    text: `Please select settings option.`,
                    reply_markup: markup_api.settings.reply_markup
                })
            }
            catch (e) {
                if (e.message == "no_user") {
                    resolve({ text:'You need to execute /start command first' })
                }
            }
        })
    },

    AddChannelGet () {
        return new Promise(async (resolve, reject) => {
            resolve({
                text: `Please send me the name of the channel`,
            })
        })
    },

    AddChannelPost (id, name) {
        return new Promise(async (resolve, reject) => {
            try {
                const channel_ex_check = await db_api.check_channel_exists(id, name)
                if (!channel_ex_check) {
                    await db_api.add_channel(id, name)
                }
            }
            catch (e) {

            }
        })
    }
} 