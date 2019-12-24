const passport = require('passport');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
// const bcrypt = require('bcrypt');
const {userModel, updateInfo} = require('../models/user');
const {courseModel} = require('../models/course');

exports.signUp = async(req, res) => {
    const {fullName, email, password, role} = req.body;
    const result = await userModel.findOne({email: email});
    if(result){
        return res.status(400).json({message: 'email đã tồn tại'});
    }
    // const hassPassword = await bcrypt.hash(password, '10');
    const user = {
        fullName: fullName,
        email: email,
        // password: hassPassword,
        password: password,
        role: role,
        typeAccount: 'Normal',
        active: false
    }
    userModel.create(user, function(err){
        if(err){
            return console.log(err);
        }
        console.log("create account is success");
    });
    return res.status(200).json({message: 'đăng kí thành công, mã kích hoạt tài khoản sẽ được gửi về mail đã đăng kí'});
}

//Check type account Google or Facebook is exist to decide sign up or login
exports.checkToSignUpOrLogin = async(req, res) => {
    const {fullName, email, password, userImg, typeAccount} = req.body;
    const user = {
        fullName: fullName,
        email: email,
        password: password,
        role: '',
        userImg: userImg,
        typeAccount: typeAccount
    }
    const result = await userModel.findOne({email: email});
    if(!result){
        userModel.create(user, function(err){
            if(err){
                console.log(err);
                return res.status(400).json({err});
            }
        });
    }
    else{
        console.log("Có tồn tại");
        user.role = result.role;
    }   
   
    const token = jwt.sign(user, "secret");
    return res.status(200).json({user, token});
  
}


exports.login = function(req, res){
    passport.authenticate('local', {session: false}, (err, user, message) => {
        if(err || !user){
            console.log(err);
            return res.status(400).json({
                message
            });
        }
        req.login(user, {session: false}, (err)=>{
            if(err){
                res.send(err);
            }
            const token = jwt.sign(user, "secret");
            return res.status(200).json({
                user,
                message, 
                token
            });
        })
    })(req, res);
}

exports.getProfile = function(req, res, next) {
    passport.authenticate('jwt', {session: false}, (err, user, info)=>{
        if(err){
            return res.status(400).json(err);
        }
        else if(info){
            return res.status(400).json({message: info.message});
        }
        return res.status(200).json(user);
    })(req, res, next);
}

exports.updateProfile = function(req, res){
    const {oldEmail, newUser} = req.body;
    if(oldEmail !== newUser.email){
        userModel.findOne({'email': newUser.email})
        .then(exists => {
            if(exists){
                return res.status(400).json({'message': 'Email người dùng đã tồn tại'});
            }
            else{
                userModel.useFindAndModify({'email': oldEmail}, {'fullName': newUser.fullName, 'email': newUser.email,
                                            'address': newUser.address, 'phoneNumber': newUser.phoneNumber, 
                                            'discribe': newUser.discribe, 'userImg': newUser.userImg, 'salary': newUser.salary}, function(error, user){
                    if(error){
                        return res.status(400).json({'message': 'Cập nhật thất bại'});
                    }
                    return res.status(200).json({'message': 'Cập nhật thành công'})
                })
            }
        })
    }
    else{
        userModel.findOneAndUpdate({'email': oldEmail}, {'fullName': newUser.fullName, 'email': newUser.email,
                                    'address': newUser.address, 'phoneNumber': newUser.phoneNumber, 'discribe': newUser.discribe,
                                    'userImg': newUser.userImg, 'salary': newUser.salary}, function(error){
            if(error){
                return res.status(400).json({'message': 'Cập nhật thất bại'});
            }
            return res.status(200).json({'message': 'Cập nhật thành công'})
        })
    }
    
}

//Update info of user
exports.update_info = (req, res, next) => {
    passport.authenticate("jwt", { session: false }, async (err, user, info) => {
      if (err) {
        return res.status(400).json({
          error: err
        });
      }
  
      if (info) {
        return res.status(400).json({
          message: info.message
        });
      } else {
        const { newUser } = req.body;
        console.log(newUser);
        if (newUser.fullName === '') {
          return res.status(400).json({
            message: "Vui lòng điền đủ thông tin"
          });
        }
        updateInfo(user.email, newUser, res);
      }
    })(req, res, next);
  };


exports.delete = function(req, res){
    const {userEmail, skillItem} = req.body;
    userModel.update({'email': userEmail}, {"$pull": {"skills": skillItem}}, function(error){
        if(error){
            return res.status(400).json({'message': 'Xóa thất bại'});
        }
        else{
            return res.status(200).json({'message': 'Xóa thành công'});
        }
    })
}

exports.addSkill = function(req, res){
    const {userEmail, skill} = req.body;
    userModel.update({'email': userEmail}, {"$push": {"skills": skill}}, function(error){
        if(error){
            return res.status(400).json({'message': 'Thêm thất bại'});
        }
        else{
            return res.status(200).json({'message': 'Thêm thành công'});
        }
    })
}

exports.getTeacherAll = function(req, res){
    userModel.find({'role': 'teacher'})
    .then(user => {
        return res.status(200).json({user});
    })
    .catch(error => console.log(error));
}

exports.getTeacherWithAddress = function(req, res){
    const {address} = req.body;
    const regex = new RegExp(address, 'gi')
    userModel.find({'role': 'teacher', 'address': regex})
    .then(user => {
        if(user){
            return res.status(200).json({user});
        }
        else{
            return res.status(200).json({message: 'Không tìm thấy teacher có địa chỉ này'})
        }
    })
    .catch(error => console.log(error));
}

exports.getTeacherWithSalary = function(req, res){
    const {salary} = req.body;
    userModel.find({'role': 'teacher', 'salary': salary})
    .then(user => {
        if(user){
            return res.status(200).json({user});
        }
        else{
            return res.status(200).json({message: 'Không tìm thấy teacher có lương này'})
        }
    })
    .catch(error => console.log(error));
}

exports.getTeacherWithSkill = function(req, res){
    const {skill} = req.body;
    userModel.find({'role': 'teacher', 'skills': skill})
    .then(user => {
        if(user){
            return res.status(200).json({user});
        }
        else{
            return res.status(200).json({message: 'Không tìm thấy teacher có lương này'})
        }
    })
    .catch(error => console.log(error));
}

exports.sendCodeActivatedAccountByEmail = function(req, res){
    // const transporter = nodemailer.createTransport({
    //     service: 'Gmail',
    //     auth: {
    //       user: 'baodang3597@gmail.com',
    //       pass: 'baodang0305'
    //     }
    // });
    // const mailOptions = {
    //     from: 'Bao Dang',
    //     to: req.body.email,
    //     subject: 'Confirm changes password',
    //     html: '<b>Vui lòng nhập mã xác nhận 12345</b>'
    // }
    // transporter.sendMail(mailOptions, function(err, info){
    //     if(err){
    //         console.log(err)
    //         return res.status(400).json({'message': 'Gửi mã code kích hoạt thất bại'});
    //     }
    //     else{
    //         return res.status(200).json({'message': 'Mã code kích hoạt tài khoản đã được gửi đến mail của bạn'})
    //     }
    // });
}

exports.activatedAccount = function(req, res){
    const {email, code} = req.body;
    if(req.body.code === '12345'){
        userModel.useFindAndModify({'email': req.body.email}, {'active': true})
        .then(result => {
            if(result){
                return res.status(200).json({'message': 'Tài khoản đã được kích hoạt'});
            }
            else{
                return res.status(400).json({'message': 'Kích hoạt tài khoản thất bại'})
            }
        })
    }
    else{
        return res.status(400).json({'message': 'Mã kích hoạt không đúng'});
    }
}

exports.addNewCourse = function(req, res){
    const {newCourse, ownerCourse} = req.body;
    const course = {
        nameCourse: newCourse.nameCourse,
        salary: newCourse.salary,
        address: newCourse.address,
        time: newCourse.time,
        discribe: newCourse.discribe,
        email: ownerCourse.email,
        fullName: ownerCourse.fullName,
        phoneNumber: ownerCourse.phoneNumber
    }
    courseModel.create(course, function(err){
        if(err){
            return console.log(err);
        }
        console.log("create course is success");
    });
    return res.status(200).json({message: 'Tạo khóa học thành công'});
}

exports.getAllCourses = function(req, res){
    courseModel.find({})
    .then(courses => {
        return res.status(200).json(courses);
    })
    .catch(error => console.log(error));
}


