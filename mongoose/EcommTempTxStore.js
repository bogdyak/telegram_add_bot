const env      = require('../env')
const mongoose = require('mongoose')
mongoose.connect(`mongodb://${env.MONGO_URL}/davidadvertise`, {useNewUrlParser: true});

const EcommTempTxStore = new mongoose.Schema({
    transaction: {
        type: Object,
        default: {}
    }
});

const EcommTxConfirmed = new mongoose.Schema({
    transaction: {
        type: Object,
        default: {}
    }
})

const cd  = mongoose.model('EcommTempTxStore', EcommTempTxStore)
const etc = mongoose.model('EcommTxConfirmed', EcommTxConfirmed)

const methods = {
    set: function (obj) {
        return new Promise(async(resolve, reject) => {
            try {
                const store = new cd()
                store.transaction = obj
                store.save((err, done) => {
                    if (err)
                        reject("can't set temp. store for order")
                    else 
                        resolve({ status:"SET", id:done._id })
                })
            }
            catch (e) {
                console.log(e)
                reject("can't set temp. store for order")
            }
        })
    },
    get: function (id) {
        return new Promise(async(resolve, reject) => {
            try {
                cd.findById(id, (err, done) => {
                    if (err)
                        throw err
                    else {
                        resolve(done)
                    }
                })
            }
            catch (e) {
                console.log(e)
                reject('failed_fetch_woocommerce_order')
            }
        })
    },
    replace: function (id, updated) {
        return new Promise(async(resolve, reject) => {
            try {
                const tempStore = await this.get(id)
                const permStore = new etc()
                permStore.transaction = updated

                Promise.all([
                    permStore.save(),
                    tempStore.remove()
                ])

                resolve(true)
            }
            catch (e) {
                console.log(e)
                reject('failed_save_confirmed_transaction')
            }
        })
    },
    remove: function (id) {
        return new Promise(async (resolve, reject) => {
            try {
                const tempStore = await this.get(id)
                const copy = tempStore
                tempStore.remove()
                resolve(copy)
            }
            catch (e) {
                console.log(e)
                reject('failed_deleting')
            }
        })
    }
}

module.exports = {
    model: cd,
    methods: methods
}