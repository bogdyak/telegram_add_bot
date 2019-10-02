const env       = require('../env')
const mongoose  = require('mongoose')

mongoose.connect(`mongodb://${env.MONGO_URL}/davidadvertise`, {useNewUrlParser: true});

const Settings = new mongoose.Schema({
    language_code: {
        type: String,
        defaul: ""
    },
    interface_language: {
        type: String,
        defaul: ""
    },
    accepted_currencies: {
        type: Object,
        defaul: []
    },
    local_currency: {
        type: String,
        defaul: ""
    },
    wallet: {
        type: Object,
        default: {}
    },
    channels: {
        type: Object,
        default: []
    },
})

module.exports = {
    model: mongoose.model("Settings", Settings),
    schema: Settings
}