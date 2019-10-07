/**
 * @modules
 */
const Abr      = require('@aloborio/blockchain/dist/index')


/**
 * @global_const
 */
const profile_schema      = require('../mongoose/profile-schema').model
const settings_schema     = require('../mongoose/settings-schema').model
const channel_conf_schema = require('../mongoose/channel-settings-schema').model
const channel_object      = require('../mongoose/channel-schema').model
const util_api            = require('../api/util')
const abr = new Abr.default()


module.exports = {
    new_user ({ id, first_name, second_name, username, language_code }) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.get_user(id)
                reject({ message:'user_exists', data:false })
            }
            catch (e) {
                if (e.message == 'no_user') {
                    const date = new Date()
                    const ss   = new settings_schema({ language_code, wallet:await abr.MINTER.wallet.create() })
                    const ps   = new profile_schema({ _id:id, first_name, second_name, username, date, settings:ss })
        
                    ps.save((e, r) => {
                        if (e) {
                            console.log(e)
                            reject({ message:'error_saving_user', data:false })
                        }
                        else {
                            resolve({ message:'success', data:r })
                        }
                    })
                }
            }
        })
    },

    get_user (id) {
        return new Promise(async (resolve, reject) => {
            try {
                const profile = await profile_schema.findById(id)
                if (profile) {
                    resolve(profile)
                }
                else 
                    reject({ message:"no_user" })
            }
            catch (e) {
                reject(e)
            }
        })
    },

    add_channel (id, name) {
        return new Promise(async (resolve, reject) => {
            try {
                const profile = await profile_schema.findById(id)
                
                const ccs = new channel_conf_schema({
                    channel_language: profile.settings.language_code,
                    allow_curse_words: false,
                    post_option_schema: []
                })

                const ccs_save = await ccs.save()
                
                const co = new channel_object({
                    name: name,
                    status: false,
                    configuration: ccs_save._id
                })

                profile.settings.channels.push(co)

                profile.markModified('settings')

                await profile.save()
                    
                resolve({ message:'ok' })
            }
            catch (e) {
                console.log(e)
                reject({ message:"error_adding_channel" })
            }
        })
    },

    check_channel_exists (id, name) {
        return new Promise(async (resolve, reject) => {
            try {
                const profile = await profile_schema.findById(id)

                if (profile) {
                    let found = false

                    for (let i = 0; i < profile.settings.channels.length; i++) {
                        const obj = profile.settings.channels[i]
                        if ("@"+obj.name == name) {
                            i = profile.settings.channels.length
                            found = true
                        }
                    }

                    if (!found)
                        resolve(true)
                    
                    else
                        throw false
                }
            }
            catch (e) {
                console.log(e)
                reject({ message:"channel_exists" })
            }
        })
    },

    getChannelConfigurations (id) {
        return new Promise(async (resolve, reject) => {
            try {
                const config = await channel_conf_schema.findById(id)

                if (config)
                    resolve(config)
                else
                    throw { message: "no_configuration" }
            }
            catch (e) {
                console.log(e)
                reject(e)
            }
        })
    },

    getChannel (id, name) {
        return new Promise(async (resolve, reject) => {
            try {
                const profile = await profile_schema.findById(id)
                
                let focus_channel = ''

                for (let i = 0; i < profile.settings.channels.length; i++) {
                    const i_channel = profile.settings.channels[i].name
                    if (i_channel == name) {
                        focus_channel = profile.settings.channels[i]
                    }
                }

                resolve(focus_channel)

            }
            catch (e) {
                console.log(e)
                reject(e)
            }
        })
    },

    setChannelConfiguation (id, name, configName, update) {
        return new Promise(async (resolve, reject) => {
            try {
                const channel = await this.getChannel(id, name)
                const config = await channel_conf_schema.findById(channel.configuration)

                config[configName] = update

                config.markModified(configName)

                await config.save()

                resolve(true)
            }
            catch (e) {
                console.log(e)
                reject(e)
            }
        })
    },

    updateChannelConfiguation (id, name, configName, update) {
        return new Promise(async (resolve, reject) => {
            try {
                const channel = await this.getChannel(id, name)
                const config = await channel_conf_schema.findById(channel.configuration)

                let numeration = update[1]
                numeration = util_api.defineNumeration(numeration)

                config[configName].push({
                    duration: update[0],
                    numeration: numeration,
                    price: update[2]
                })

                config.markModified(configName)

                await config.save()

                resolve(true)
            }
            catch (e) {
                console.log(e)
                reject(e)
            }
        })
    },

    findChannel (name) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await profile_schema.find({
                    'settings.channels.name': name
                })

                if (result.length) {
                    const profile = result[0]
                    
                    let focus_channel = ''
                    for (let i = 0; i < profile.settings.channels.length; i++) {
                        if (profile.settings.channels[i].name == name) {
                            focus_channel = profile.settings.channels[i]
                        }
                    }
                    const config = await this.getChannelConfigurations(focus_channel.configuration)

                    resolve({ profile: profile, channel:focus_channel, config:config })
                }
                else 
                    throw { status:"not_connected", message:`<code>${name}</code> channel not connected` }
            }
            catch (e) {
                console.log(e)
                reject(e)
            }
        })
    },

    addPendingAddresses (id, tx_id, wallets) {
        return new Promise(async (resolve, reject) => {
            try {
                const profile = await profile_schema.findById(id)

                if (!profile.pendingWallets.length) {
                    profile.pendingWallets = []
                    let obj = {}
                    obj[tx_id] = wallets
                    profile.pendingWallets.push(obj)
                }
                else {
                    let obj = {}
                    obj[tx_id] = wallets
                    profile.pendingWallets.push(obj)
                }

                profile.markModified('pendingWallets')
                profile.save((e, r) => {
                    if (e) reject(e)
                    else resolve(true)
                })
            }
            catch (e) {
                console.log(e)
                reject({status:"error", data: e})
            }
        })
    },

    changeChannelStatus (name) {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await profile_schema.find({
                    'settings.channels.name': name
                })
                result = result[0]

                let focus_channel = {}

                for (let i = 0; i < result.settings.channels.length; i++) {
                    if (result[i].settings.channles.name == name) {
                        focus_channel = result[i].settings.channels
                        i = result.settings.channels.length
                    }
                }
                focus_channel.status = true
                result.markModified('settings')
                await result.save()
                resolve(true)
            }
            catch (e) {
                console.log(e)
                reject({status:"error", data: e})
            }
        })
    }
}