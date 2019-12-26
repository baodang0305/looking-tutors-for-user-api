const passport = require('passport');
const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');
const stripe = require('stripe')('sk_test_cYmuj2bLSojoUobO6f98sCnE00VVt5m4Ay');
// const bcrypt = require('bcrypt');
const {userModel, updateInfo, updateRole, changePassword} = require('../models/user');
const {courseModel} = require('../models/course');
const {contractModel} = require('../models/contract');
const {buillModel} = require('../models/buill');

exports.signUp = async(req, res) => {
    const {fullName, email, password, role} = req.body;
    const result = await userModel.findOne({email: email});
    if(result){
        console.log('email da ton tai');
        return res.status(400).json({message: 'Email đã tồn tại'});
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
            return res.status(400).json({message: err});
        }
        console.log("create account is success");
    });
    return res.status(200).json({message: 'Đăng ký thành công'});
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
                return res.status(400).json({error: err});
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
        console.log(user);
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

  //Update info of user
exports.update_role = (req, res, next) => {
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
        const { role } = req.body;
        console.log(role);
        if (role === '') {
          return res.status(400).json({
            message: "Vui lòng chọn loại tài khoản"
          });
        }
        updateRole(user.email, role, res);
      }
    })(req, res, next);
  };
    //Update info of user
exports.change_password = (req, res, next) => {
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
        const { newPassword, oldPassword } = req.body;
        console.log("old " + oldPassword);
        console.log("new " + newPassword);
        console.log(user.username);
        if (!newPassword || !oldPassword) {
            return res.status(400).json({
                message: "Vui lòng điền đủ thông tin"
            });
        }
        changePassword(user.email, user.password, newPassword, oldPassword, res);
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
        emailOwner: ownerCourse.email,
        fullNameOwner: ownerCourse.fullName,
        phoneNumberOwner: ownerCourse.phoneNumber,
        imageOwner: ownerCourse.userImg
    }
    courseModel.create(course, function(err){
        if(err){
            return console.log(err);
        }
        console.log("create course is success");
    });
    return res.status(200).json({message: 'Tạo khóa học thành công'});
}

exports.teacherGetAllCoursesNoRequest = function(req, res){
    const {teacher} = req.body;
    courseModel.find({'emailRequestedPerson': {$nin: [teacher.email]}, 'emailRequestor': {$nin: [teacher.email]}})
    .then(courses => {
        return res.status(200).json(courses);
    })
    .catch(error => console.log(error));
}

exports.teacherRequestingReceivedTeachCourse = function(req, res){
    const {idCourse, requestor, requestedPerson} = req.body;
    courseModel.findOneAndUpdate({'_id': idCourse}, {'emailRequestor': requestor.email,
                                                     'fullNameRequestor': requestor.fullName,
                                                     'phoneNumberRequestor': requestor.phoneNumber,
                                                     'emailRequestedPerson': requestedPerson.email,
                                                     'fullNameRequestedPerson': requestedPerson.fullName,
                                                     'phoneNumberRequestedPerson': requestedPerson.phoneNumber})
    .then(result => {
        if(result){
            return res.status(200).json(`${requestor.email} gửi yêu cầu dạy đến ${requestedPerson.email} thành công.`);
        }
        else{
            return res.status(400).json(`${requestor.email} gửi yêu cầu dạy đến ${requestedPerson.email} thất bại.`)
        }
    })
}

exports.teacherCancelRequestingReceivedTeach = function(req, res){
    const {idCourse} = req.body;
    courseModel.findOneAndUpdate({'_id': idCourse},{'emailRequestor': null,
                                                    'fullNameRequestor': null,
                                                    'phoneNumberRequestor': null,
                                                    'emailRequestedPerson': null,
                                                    'fullNameRequestedPerson': null,
                                                    'phoneNumberRequestedPerson': null})
    .then(result => {
        if(result){
            return res.status(200).json('Hủy yêu cầu nhận dạy thành công');
        }
        else{
            return res.status(400).json(`Hủy yêu cầu nhận dạy thất bại.`)
        }
    })
}

exports.teacherGetAllCoursesRequestingTeach = function(req, res){
    const {teacher} = req.body;
    courseModel.find({'emailRequestedPerson': teacher.email})
    .then(courses => {
        if(courses){
            return res.status(200).json(courses);
        }
        return res.status(400).json("Không tìm thấy khóa học đang yêu cầu");
    })
}

exports.teacherGetAllCoursesRequestingReceivedTeach = function(req, res){
    const {teacher} = req.body;
    courseModel.find({'emailRequestor': teacher.email})
    .then(courses => {
        if(courses){
            return res.status(200).json(courses);
        }
        return res.status(400).json("Không tìm thấy khóa học đang yêu cầu nhận dạy");
    })
}

exports.studentGetAllCoursesRequestingReceivedTeach = function(req, res){
    const {student} = req.body;
    courseModel.find({'emailOwner': student.email, 'emailRequestor': {$nin: [student.email, '', null, undefined]}})
    .then(courses => {
        if(courses){
            return res.status(200).json(courses)
        }
        return res.status(400).json('Không tìm thấy khóa học đang được yêu cầu nhận dạy')
    })
}

exports.studentGetAllCoursesNoReceived = function(req, res){
    const {requestor} = req.body;
    console.log(requestor)
    courseModel.find({'emailOwner': requestor.email})
    .then(courses => {
        if(courses){
            console.log(courses)
            return res.status(200).json(courses)
        }
        return res.status(400).json('Không tìm thấy khóa học nào');
    })

}

exports.studentRequestingTeachCourse = function(req, res){
    const {idCourse, student, teacher} = req.body;
    courseModel.findOneAndUpdate({'_id': idCourse}, {'emailRequestor': student.email, 
                                                     'fullNameRequestor': student.fullName,
                                                     'phoneNumberRequestor': student.phoneNumber,
                                                     'emailRequestedPerson': teacher.email,
                                                     'fullNameRequestedPerson': teacher.fullName,
                                                     'phoneNumberRequestedPerson': teacher.phoneNumber})
    .then(result => {
        if(result){
            return res.status(200).json(`${student.email} gửi yêu cầu dạy đến ${teacher.email} thành công.`);
        }
        else{
            return res.status(400).json(`${student.email} gửi yêu cầu dạy đến ${teacher.email} thất bại.`)
        }
    })
}

exports.studentCreateContract = function(req, res){
    const {contract} = req.body;

    contractModel.create(contract)
    .then(result => {
        if(result){
            return res.status(200).json("Tạo hợp đồng thành công");
        }
        return res.status(400).json("Tạo hợp đồng thất bại");
    })
}

exports.checkout = (req, res) => {
  
    const {token, contract} = req.body;
    console.log(contract._id)
    stripe.customers.create({
      email: token.email,
      source: token.id,
      description: 'customer'
    })
    .then(customer => stripe.charges.create({
      amount: '2500',
      description: 'payment for tutors',
      currency: 'usd',
      customer: customer.id,
      receipt_email: token.email
    }))
    .then(charge => { 
        const buill = {
            amount: charge.amount,
            email: charge.billing_details.name,
            month: charge.payment_method_details.card.exp_month,
            year: charge.payment_method_details.card.exp_year
        }
        buillModel.create(buill, function(err){
            if(!err){
                contractModel.findOneAndUpdate({'_id': contract._id}, {"checkout": true})
                .then(result => {
                    if(result){
                        return res.status(200).json("Thanh toán thành công")
                    }
                })
            }
        })
    })
    .catch(err => {console.log(err)});
  
};

exports.studentGetAllContract = function(req, res){
    const {student} = req.body;
    contractModel.find({'emailStudent': student.email})
    .then(contracts => {
        if(contracts){
            return res.status(200).json(contracts)
        }
    })

}

exports.teacherGetAllContractOffer = function(req, res){
    const {teacher} = req.body;
    contractModel.find({'emailTeacher': teacher.email})
    .then(contracts => {
        if(contracts){
            return res.status(200).json(contracts)
        }
    })
}

exports.teacherCancelContract = function(req, res){
    const {contract} = req.body;
    contractModel.findOneAndDelete({'_id': contract._id})
    .then(result => {
        if(result){
            return res.status(200).json('Hủy yêu cầu thành công');
        }
    })
}

exports.teacherAcceptContract = function(req, res){
    const {contract} = req.body;
    contractModel.findOneAndUpdate({'_id': contract._id}, {'acceptTeacher': true})
    .then(result => {
        if(result){
            return res.status(200).json('Chấp nhận hợp đồng');
        }
    })
}
