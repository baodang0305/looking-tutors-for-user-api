const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const buill = new Schema({
    amount: String,
    email: String,
    month: String,
    year: String
}, {collection: 'buills'});


const buillModel = mongoose.model('buillModel', buill);

module.exports = {
    buillModel
}