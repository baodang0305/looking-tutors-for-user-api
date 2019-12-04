const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {userModel} = require('../models/user');

exports.signUp = async(req, res) => {
    const {fullName, email, password, role} = req.body;
    const result = await userModel.findOne({email: email});
    if(result){
        res.status(400).json({message: 'email đã tồn tại'});
    }
    const hassPassword = await bcrypt.hash(password, '10');
    const user = {
        fullName: fullName,
        email: email,
        password: hassPassword,
        role: role
    }
    userModel.create(user, function(err){
        if(err){
            return console.log(err);
        }
        console.log("create account is success");
    });
    res.status(200).json(user);
}

exports.login = (req, res) => {
    passport.authenticate('local', {session: false}, (err, user, message) => {
        if(err || !user){
            return res.status(400).json({
                message: message
            })
        }
        req.login(user, {session: false}, (err)=>{
            if(err){
                res.send(err);
            }
        })
        const token = jwt.sign(user, "secret");
        return res.json({user, token});
    })
}

