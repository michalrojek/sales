let mongoose = require('mongoose');

let thresholdSchema = mongoose.Schema({
    idProcedure: {
        type: String,
        required: true
    },
    clientCount: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    isFulfiled: {
        type: Boolean,
        required: true
    },
    isCurrent: {
        type: Boolean,
        required: true
    }
});

let Threshold = module.exports = mongoose.model('Threshold', thresholdSchema);