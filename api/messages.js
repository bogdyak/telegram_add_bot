const db_api     = require('./mongo')
const markup_api = require('./markups')
const Minter     = require('@aloborio/blockchain/dist/index')
const lang_logo  = require('./language-logo')
const request    = require('request')

const minter = new Minter.default()

module.exports = {
    Welcome () {
        return new Promise(async (resolve, reject) => {
            resolve({
                text: `
<b>Hello, my name is Teleads. Thank you for choosing me.</b>

I automate advertisment post and pin them in your channel.
You will automatically get paid minus bot fee.

To secure your channel subscribers from obsence content and scam we have pre-aproval mechanism.
You will receive message from me when somebody want to buy advertisment post.

Also you can set channel language, which will secure English speaking subscribers from Chinese Ad posts.

You can set many options of advertisment post in your channel, starting from seconds, up to year.
For example you can show ad during 21 day.

You can add as many channels as you wish and get paid from all of them.

I am in beta version, but doing my best to be good friend for you. If you have issues with me, please report my father - @b_sizov            
                `
            })
        })
    }, 

    Profile (id) {
        return new Promise(async (resolve, reject) => {
            try {
                const profile = await db_api.get_user(id)
                const balance = await minter.getBalanceAll(profile.settings.wallet.public)

                let sum = 0
                for (let i =0 ; i < balance.length; i++) {
                    if (balance[i].coin == "BIP")
                        sum += Number(balance[i].amount)

                    else {
                        const worth = await minter.getSellPrice(balance[i].coin, balance[i].amount, "BIP")
                        sum += Number(worth) / Math.pow(10, 18)
                    }
                }

                request.get('https://api.bip.dev/api/price', (err, res, body) => {
                    body = JSON.parse(body)
                    const price = body.data.price / 10000
                    const dollar_worth = sum * price

                    resolve({
                        text:`
<b>ACCOUNT DETAILS</b>
                        
<b>Wallet:</b>  ${profile.settings.wallet.public}
<b>Balance :</b>  ${sum.toFixed(3)} BIP  ($  ${dollar_worth.toFixed(3)})

<b>Language:</b>  ${profile.settings.language_code} ${lang_logo[profile.settings.language_code]}

<b>Connected channels:</b>  ${profile.settings.channels.length}
                        `,
                        reply_markup: markup_api.profile(profile.settings.wallet.public).reply_markup
                    })
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

    Help () {
        return new Promise(async (resolve, reject) => {
            resolve({
                text: 'Please select one from the list',
                reply_markup: markup_api.help.reply_markup
            })
        })
    },
    
    HelpAddChannel () {
        return new Promise(async (resolve, reject) => {
            resolve({
                text: `
<b>How to add Teleads to channel</b>

1) Go to ☸ Settings
2) Go to ➕ Add channel
3) Go to ℹ️ Show instruction and follow steps
`,
                reply_markup: markup_api.back_to_help.reply_markup
            })
        })
    },

    HelpWithdraw () {
        return new Promise(async (resolve, reject) => {
            resolve({
                text: `
<b>How to withdraw funds</b>

1) Go to 👨‍💻 Profile
2) Go to 👛 Withdraw
3) Follow steps
`,
                reply_markup: markup_api.back_to_help.reply_markup
            })
        })
    },

    helpAddEditToPriceList () {
        return new Promise(async (resolve, reject) => {
            resolve({
                text: `
<b>How to add post option to price list</b>

1) Go to ☸ Settings
2) Go to ✏️ Edit channel
3) Click on the channel which you want to edit
4) Go to ➕ Add new to add new
4.1) Click on the existing price list option to edit or delete
5) Follow the instructions from message
                `,
                reply_markup: markup_api.back_to_help.reply_markup
            })
        })
    },

    BeforeAddChannel () {
        return new Promise(async (resolve, reject) => {
            resolve({
                text:`To add bot to channel you <b>have to</b> add it as <b>administrator</b> of channel.\nHave you done it?`,
                reply_markup: markup_api.before_add_channel.reply_markup
            })
        })
    },

    AddChannelGet () {
        return new Promise(async (resolve, reject) => {
            resolve({
                text: `
Please send me the <b>username</b> of the channel you want to connect to bot.
Example: <code>@channelname</code> or <code>channelname</code>
`,
                reply_markup: markup_api.add_channel_get.reply_markup
            })
        })
    },

    AddChannelInstruction () {
        return new Promise(async (resolve, reject) => {
            resolve({
                text: `
1) Click menu in the top right corner
2) Click <code>Administrators</code>
3) Click <code>Add Administrator</code>
4) Find @tele_ads_bot and click on it in search results
5) Set permisions to all except <code>Add members</code> and <code>Add new admins</code>
6) Make sure that bot as administrator been added.
`
            })
        })
    },

    BuyAdvertising () {
        return new Promise(async (resolve, reject) => {
            resolve({
                text: `
Please send me the name of the channel where you want to buy advertising

Example: <code>@channelname</code> or <code>channelname</code>
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
                    html += `<b>Status: </b> ${(channel.status) ? 'ad post is active' : 'no active ad posts'} ${(channel.status) ? '✅' : '❌'}\n`
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
                    html += `Channel language define the language of ad post that will be accepted. For example: in English channel you can post only English ad post.\n\n`

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

    EditChannelPostOptions (id, name, data) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve({
                    text: `
Please choose what you want to do with this price list option

<b>${data[3]} ${data[4]} ${data[5]}</b>
`,
                    reply_markup: markup_api.change_delete_pricelist_option(name, data).reply_markup
                })
            }
            catch (e) {
                console.log(e)
                reject({ text:e })
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
    },

    Withdraw (id) {
        return new Promise(async (resolve, reject) => {
            try {
                const profile = await db_api.get_user(id)
                const balance = await minter.getBalanceAll(profile.settings.wallet.public)

                let sum = 0
                for (let i =0 ; i < balance.length; i++) {
                    if (balance[i].coin == "BIP")
                        sum += Number(balance[i].amount)

                    else {
                        const worth = await minter.getSellPrice(balance[i].coin, balance[i].amount, "BIP")
                        balance[i].sellPrice = Number(worth) / Math.pow(10, 18)
                        sum += Number(worth) / Math.pow(10, 18)
                    }
                }

                if (Number(sum) > 0.02) {
                    resolve({
                        text: `Please choose coin to withdraw`,
                        reply_markup: markup_api.choose_withdraw_coin(balance).reply_markup
                    })
                }
                else {
                    resolve({
                        text: `⚠️ There are not enough funds on your balance. \n\nThe minimum withdrawal amount is 0.01 BIP - 0.02 should be on balance.`,
                        reply_markup: markup_api.show_channels.reply_markup
                    })
                }

            }
            catch (e) {
                console.log(e)
                resolve({
                    text: `Oops:\n\n<code>${e}</code>`,
                    reply_markup: markup_api.show_channels.reply_markup
                })
            }
        })
    },

    Deposit (id) {
        return new Promise(async (resolve, reject) => {
            try {
                const profile = await db_api.get_user(id)
                resolve({
                    text: `Please send any Minter currencies to address`,
                    extra: profile.settings.wallet.public,
                })
            }
            catch (e) {
                console.log(e)
                resolve({
                    text: `Oops:\n\n<code>${e}</code>`,
                    reply_markup: markup_api.show_channels.reply_markup
                })
            }
        })
    },

    PriceListOptionDeleted () {
        return new Promise(async (resolve, reject) => {
            resolve({
                text: `Price list option successfully deleted`,
            })
        })
    }
} 