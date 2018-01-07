let mongoose = require('mongoose');

let procedureSchema = mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    picture:{
        type: String,
    },
    startDate:{
        type: Date
    },
    expDate:{
        type: Date
    },
    startPrice:{
        type: Number,
        required: true
    },
    isCurrent:{
        type: Boolean,
        required: true
    },
    bodyparts:{
        type: Array
    }
});

let Procedure = module.exports = mongoose.model('Procedure', procedureSchema);