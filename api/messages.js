const db_api     = require('./mongo')
const markup_api = require('./markups')
const Abr        = require('@aloborio/blockchain/dist/index')
const lang_logo  = require('./language-logo')

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
                        
<b>Wallet:</b>  ${profile.settings.wallet.public}
<b>Balance:</b>  ${balance} BIP

<b>Language:</b>  ${profile.settings.language_code} ${lang_logo[profile.settings.language_code]}

<b>Connected channels:</b>  ${profile.settings.channels.length}

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
                text: `
Please send me the <b>username</b> of the channel.
You can use <code>@channelname</code> or simply <code>channelname</code>
`,
                reply_markup: markup_api.add_channel_get.reply_markup
            })
        })
    },

    BuyAdvertising () {
        return new Promise(async (resolve, reject) => {
            resolve({
                text: `
Please send me the name of the channel where you want to buy advertising
You can send as <code>@channelname</code> or simply <code>channelname</code>
`,
            })
        })
    },

    Balance () {
        return new Promise(async (resolve, reject) => {
            resolve({
                text: "asds"
            })
        })            
    },

    Channels (id) {
        return new Promise(async (resolve, reject) => {
            try {
                const profile = await db_api.get_user(id)

                let html = ``
                let markup = ``

                if (profile.settings.channels.length) {
                    html   = `<b>Connected channels</b>\n\n`
                    markup = markup_api.show_channels.reply_markup
                }

                else {
                    html = `<b>No channels connected yet.</b>\nPlease navigate to ☸ Settings to add channels`
                    markup = markup_api.show_channels_with_settings.reply_markup
                } 

                for (let i = 0; i < profile.settings.channels.length; i++) {
                    const channel = profile.settings.channels[i]
                    html += `------------------\n`
                    html += `<b>Channel id: </b> @${channel.name} \n`
                    html += `<b>Status: </b> ${(channel.status) ? 'enabled' : 'disabled'} ${(channel.status) ? '✅' : '❌'}\n`
                }

                resolve({
                    text: html,
                    reply_markup: markup
                })
            }
            catch (e) {
                reject({ text:"Error getting your profile" })
            }
        })        
    },

    ChannelsToEdit (id) {
        return new Promise(async (resolve, reject) => {
            try {
                const profile = await db_api.get_user(id)

                let html = ``

                if (profile.settings.channels.length) {
                    html   = `<b>Select channel to edit</b>`
                    markup = markup_api.channelsToEdit(profile.settings.channels).reply_markup
                }
                else {
                    html = `<b>No channels to edit.</b>\nPlease navigate to ☸ Settings to add channels`
                    markup = markup_api.show_channels_with_settings.reply_markup
                }

                resolve({
                    text: html,
                    reply_markup: markup
                })
            }
            catch (e) {
                console.log(e)
                reject({ text:"Error getting your profile" })
            }
        })
    },

    EditChannel (id, name) {
        return new Promise(async (resolve, reject) => {
            try {
                const profile = await db_api.get_user(id)
                let focus_channel = ''
                let html = ``
                let markup = ``

                for (let i = 0; i < profile.settings.channels.length; i++) {
                    const i_channel = profile.settings.channels[i].name
                    if (i_channel == name) {
                        focus_channel = profile.settings.channels[i]
                    }
                }                  

                if (focus_channel) {
                    const configs = await db_api.getChannelConfigurations(focus_channel.configuration)
                    
                    html = `<b>Channel configurations</b>\n\n<b>Channel language: </b>${configs.channel_language} ${lang_logo[configs.channel_language]}\n`
                    
                    if (configs.post_options.length) {
                        html += `<b>Price list</b> displayed below\n`
                        markup = markup_api.show_channel_conf_listOfPosts(focus_channel.name, configs.post_options).reply_markup
                    }

                    else {
                        html += `<b>Price list: </b><code>empty</code>\n`
                        markup = markup_api.show_channel_conf_emptyposts(focus_channel.name).reply_markup
                    }
                }
                else
                    throw "Configurations for channel not found."

                resolve({
                    text: html,
                    reply_markup: markup
                })
                
            }
            catch (e) {
                console.log(e)
                reject({ text:e })
            }
        })
    },

    EditChannelLanguage (id, name) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve({
                    text: `<b>Please select language of your channel</b>.\n\nThis language will be used to filter advertisment posts.\nExample: post with language <b>'de'</b> will be denied in <b>'en'</b> channel`,
                    reply_markup: markup_api.show_language_configs(name).reply_markup
                })
            }
            catch (e) {
                console.log(e)
                reject({ text:e })
            }
        })
    },

    EditChannelPostOptions (id, name) {
        return new Promise(async (resolve, reject) => {
            try {
                const channel        = await db_api.getChannel(id, name)
                const configurations = await db_api.getChannelConfigurations(channel.configuration)

                resolve({
                    text: `Please select option to edit or click <code>Add new</code> to create new.`,
                    reply_markup: markup_api.show_channel_conf_listOfPosts(name, configurations.post_options).reply_markup
                })
            }
            catch (e) {
                console.log(e)
                reject(e)
            }
        })
    },

    AddNewChannelOption (id, name) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve({
                    text: `
<b>Please enter terms of post option.</b>

You can enter with upercase or lowercase, but order should be <code>duration</code> (1, 7, 365) <code>numeration</code> (min, hour, day, week, month, year) <code>amount</code> (100, 1.01, 0.05)

<b>Example:</b>\n<code>1 DAY 1000</code> or <code>1 day 1000</code>

❗ Amount specified in <b>BIP</b>, currency of <a href="https://minter.network">Minter blockchain</a> ❗
You can find price at @bip_banker_bot or <a href="https://bip.dev">Mbank</a>
`,
                    reply_markup: markup_api.edit_channel_back(name).reply_markup
                })
            }
            catch (e) {
                console.log(e)
                reject(e)
            }
        })
    },

    BuyPostOptionSelected () {
        return new Promise(async (resolve, reject) => {
            try {
                resolve({
                    text: `<b>Please send content of advertisment post</b>`
                })
            }
            catch (e) {
                console.log(e)
                reject(e)
            }
        })
    },

    AdminPostApproval ({ text, admin, channelName, requester, requester_id }) {
        return new Promise((resolve, reject) => {
            resolve({
                text: `
<b>New advertisment post requested in @${channelName}</b>

Please read carefully content of advertisment post.

By clicking <code>Approve</code> you confirm that post satisfies term of your channnel and once @${requester} will pay it will be auto posted and pinned in your channel.

By clicking <code>Decline</code> @${requester} will be notified that chat owner declined advertisment post with your contacts.

<b>--- Post content ---</b>
${text}
                `,
                reply_markup: markup_api.post_text_admin_approval({ admin, channelName, requester_id }).reply_markup
            })
        })
    }
} 