const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const contract = new Schema({
    day: String,
    month: String,
    year: String,
    fullNameStudent: String,
    emailStudent: String,
    phoneNumberStudent: String,
    fullNameTeacher: String,
    emailTeacher: String,
    phoneNumberTeacher: String,
    teachTime: String,
    address: String,
    salary: String,
    discribe: String,
    term: String,
    acceptStudent: Boolean,
    acceptTeacher: Boolean,
    checkout: Boolean
}, {collection: 'contracts'});


const contractModel = mongoose.model('contractModel', contract);

module.exports = {
    contractModel
}
