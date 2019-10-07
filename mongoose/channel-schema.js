const env         = require('../env')
const mongoose    = require('mongoose')
const post_schema = require('./post-schema').model.schema.obj

mongoose.connect(`mongodb://${env.MONGO_URL}/teleads`, {useNewUrlParser: true});

const ChannelSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    status: {
        type: Boolean,
        default:false
    },
    configuration: {
        type: String,
        default: ""
    },
    post: post_schema
})

module.exports = {
    model: mongoose.model("ChannelSchema", ChannelSchema),
    schema: ChannelSchema
}