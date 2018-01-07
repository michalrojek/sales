let mongoose = require('mongoose');

let bodypartSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    idClient:{
        type: String,
        required: true
    },
    idProcedure:{
        type: String,
        required: true
    }
});

let Bodypart = module.exports = mongoose.model('Bodypart', bodypartSchema);