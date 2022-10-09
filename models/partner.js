const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);


const partnerShema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
        image: {
            type: String,
            required: true
    },
        featured: {
            type: Boolean,
            default: false
    },
        description: {
            type: String,
            required: false
    }},
    {
        timestamps: true
});


const Partner = mongoose.model('Partner', partnerShema);

module.exports = Partner;