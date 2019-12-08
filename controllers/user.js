const passport = require('passport');
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
const {userModel} = require('../models/user');

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
        role: role
    }
    userModel.create(user, function(err){
        if(err){
            return console.log(err);
        }
        console.log("create account is success");
    });
    return res.status(200).json({message: 'đăng kí thành công'});
}

exports.login = function(req, res){
    passport.authenticate('local', {session: false}, (err, user, message) => {
        if(err || !user){
            return res.status(400).json({
                message
            })
        }
        req.login(user, {session: false}, (err)=>{
            if(err){
                res.send(err);
            }
            const token = jwt.sign(user, "secret");
            return res.status(200).json({user, message, token});
        })
    })(req, res);
}

