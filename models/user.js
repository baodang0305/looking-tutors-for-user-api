const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const user = new Schema({
    fullName: String,
    email: String,
    password: String,
    role: String
}, { collection: 'user'});

const userModel = mongoose.model('userModel', user);

// const checkUser = async(email, password) => {
//     // const result = await userModel.findOne({'email': email});
//     const result = await userModel.findOne({'email': email});
//     if(!result){
//         return false;
//     }
//     // const hashPassword = await bcrypt.compare(password, result.password);
//     // if(!hashPassword){
//     //     return false;
//     // }
//     return true;
// }

module.exports = {
    userModel
    // checkUser
}

