let mongoose = require('mongoose');

let clientSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    surname:{
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    postcode:{
        type: String,
        required: true
    },
    picture:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    phoneNumber:{
        type: Number,
        required: true
    },
    bodyparts:{
        type: Array,
    },
    idProcedure:{
        type: String,
        required: true
    }
});

let Client = module.exports = mongoose.model('Client', clientSchema);