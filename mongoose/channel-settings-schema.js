const env       = require('../env')
const mongoose  = require('mongoose')

mongoose.connect(`mongodb://${env.MONGO_URL}/teleads`, {useNewUrlParser: true});

const ChannelSettings = new mongoose.Schema({
    channel_language: {
        type: String,
        defaul: ""
    },
    post_options: {
        type: Object,
        default: []
    }
})

module.exports = {
    model: mongoose.model("ChannelSettings", ChannelSettings),
    schema: ChannelSettings
}