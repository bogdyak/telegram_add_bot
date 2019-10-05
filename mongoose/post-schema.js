const env       = require('../env')
const mongoose  = require('mongoose')

mongoose.connect(`mongodb://${env.MONGO_URL}/davidadvertise`, {useNewUrlParser: true});

const PostSchema = new mongoose.Schema({
    start_day: {
        type: String,
        default: ""
    },
    end_day: {
        type: String,
        default: ""
    }
})

module.exports = {
    model: mongoose.model("PostSchema", PostSchema),
    schema: PostSchema
}