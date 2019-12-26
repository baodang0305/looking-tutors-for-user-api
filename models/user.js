const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const user = new Schema({
    fullName: String,
    email: String,
    password: String,
    userImg: {
        type: String,
        default: ''
    },
    role: String,
    address: {
        type: String,
        default: ''
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    discribe: {
        type: String,
        default: ''
    },
    salary: {
        type: Number,
        default: 0
    },
    skills: [],
    typeAccount:{
        type: String,
        default: 'Normal'
    },
    active:{
        type: Boolean,
        default: true
    }
}, { collection: 'user'});

const userModel = mongoose.model('userModel', user);


const updateInfo = async (email, newUser, res) => {
    const query = {'email': email};
    userModel.findOneAndUpdate(query, {'fullName': newUser.fullName,
                                    'address': newUser.address, 'phoneNumber': newUser.phoneNumber, 'discribe': newUser.discribe,
                                    'userImg': newUser.userImg, 'salary': newUser.salary, 'skills': newUser.skills}, {upsert: true}, function(error){
            if(error){
                console.log(error);
                return res.status(400).json({error: 'Cập nhật thất bại'});
            }
            return res.status(200).json({message: 'Cập nhật thành công'})
        })
  };
  const updateRole = async (email, role, res) => {
    const query = {'email': email};
    userModel.findOneAndUpdate(query, {'role': role}, {upsert: true}, function(error){
            if(error){
                console.log(error);
                return res.status(400).json({error: 'Cập nhật thất bại'});
            }
            return res.status(200).json({message: 'Cập nhật thành công'})
        })
  };

  const changePassword = async (email, password, newPassword, oldPassword, res) => {
    const query = {'email': email};
    if(password !== oldPassword){
        return res.status(400).json({
            message: 'Mật khẩu cũ không chính xác'
          });
    }

    userModel.findOneAndUpdate(query, {'password': newPassword}, {upsert: true}, function(error){
            if(error){
                console.log(error);
                return res.status(400).json({error});
            }
            return res.status(200).json({message: 'Đổi mật khẩu thành công'})
        })
  };

module.exports = {
    userModel,
    updateInfo,
    updateRole,
    changePassword
}

