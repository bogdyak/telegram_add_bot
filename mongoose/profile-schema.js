const env       = require('../env')
const mongoose  = require('mongoose')
const settings_model = require('./settings-schema').model

mongoose.connect(`mongodb://${env.MONGO_URL}/davidadvertise`, {useNewUrlParser: true});

const Profile = new mongoose.Schema({
    _id: {
        type: String,
        default: ""
    },
    first_name: {
        type: String,
        default: ""
    },
    last_name: {
        type: String,
        default: ""
    },
    username: {
        type: String,
        default: ""
    },
    date: {
        type: String,
        default: ""
    },
    pendingWallets: {
        type: Object,
        default: []
    },
    settings: settings_model.schema.obj
})

module.exports = {
    model: mongoose.model("Profile", Profile),
    schema: Profile
}