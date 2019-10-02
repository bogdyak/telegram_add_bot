/**
 * @modules
 */
const mongoose = require('mongoose');


/**
 * @global_const
 */
const profile_schema  = require('../mongoose/profile-schema').model
const settings_schema = require('../mongoose/settings-schema').model
const ObjectId = require('mongodb').ObjectID;


module.exports = {
    /**
     * @param {*} param0 
     */
    new_user ({ id, first_name, second_name, username, language_code }) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.get_user(id)
                reject({ message:'user_exists', data:false })
            }
            catch (e) {
                if (e.message == 'no_user') {
                    const date = new Date()
                    const ss   = new settings_schema({ language_code })
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

    check_channel_exists (id, name) {
        return new Promise(async (resolve, reject) => {
            try {
                const profile = await profile_schema.findById(id)

                if (profile) {
                    let found = false

                    for (let i = 0; i < profile.settings.channels.length; i++) {
                        const obj = profile.settings.channels[i]
                        if (obj.name == name) {
                            i = profile.settings.channels.length
                            found = true
                        }
                    }

                    resolve(found)
                }
            }
            catch (e) {
                console.log(e)
                reject({ message:"error_geting_channel" })
            }
        })
    },

    add_channel (id, name) {
        return new Promise(async (resolve, reject) => {
            try {
                const profile = await profile_schema.findById(id)
                profile.settings.channels.push({
                    name: name,
                    status: 'disabled',
                })

                profile.markModified('settings')

                profile.save((e, r) => {
                    if (e)
                        throw e
                    else 
                        resolve(r)
                })
            }
            catch (e) {
                console.log(e)
                reject({ message:"error_adding_channel" })
            }
        })
    }
}