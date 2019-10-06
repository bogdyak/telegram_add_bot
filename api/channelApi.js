const db_api     = require('./mongo')

module.exports = {
    /**
     * @description will check if BOT successfully set as admin and save channel to channel creator
     * @param {Object} ctx full context from channel handler
     */
    deletePingAndAddChannel (ctx, res, admin) {
        return new Promise(async (resolve, reject) => {              
            try {
                await ctx.telegram.deleteMessage("@" + res.chat.username, res.message_id)
                const result = await db_api.add_channel(admin, res.chat.username)
                
                if (result.message == "ok")
                    resolve(true)
                else 
                    reject(result)
            }
            catch (e) {
                console.log(29, e)
                reject({ message:"error_saving_channel" })
            }
        })
    },

    getChatCreator (admins) {
        let creator = ""

        for (let i = 0; i < admins.length; i++) {
            if (admins[i].status == 'creator')
                creator = admins[i].user.id
        }

        return  creator
    },

    getChatCreatorUsername (admins) {
        let creator = ""

        for (let i = 0; i < admins.length; i++) {
            if (admins[i].status == 'creator')
                creator = admins[i].user.username
        }

        return  creator
    },
}