const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const user = new Schema({
    fullName: String,
    email: String,
    password: String,
    image: String,
    role: String,
    address: String,
    phoneNumber: String,
    discribe: String,
    salary: Number,
    skills: []

}, { collection: 'user'});

const userModel = mongoose.model('userModel', user);


module.exports = {
    userModel
}

