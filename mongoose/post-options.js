const env       = require('../env')
const mongoose  = require('mongoose')

mongoose.connect(`mongodb://${env.MONGO_URL}/teleads`, {useNewUrlParser: true});

const PostOptions = new mongoose.Schema({
    duration: {
        type: Number,
        defaul: 0
    },
    numeration: {
        type: String,
        default: false
    },
    price: {
        type: Number,
        default: 0
    }
})

module.exports = {
    model: mongoose.model("PostOptions", PostOptions),
    schema: PostOptions
}