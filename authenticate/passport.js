const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const {checkUser, userModel} = require('../models/user');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
    },
    function(email, password, cb){
        return checkUser(email, password)
            .then(result=> {
                if(!result){
                    return cb(null, false, {message: 'email hoặc mật khẩu không đúng'});
                }
                return cb(null, email, {message: 'Đăng nhập thành công'});
            })
            .catch(err => cb(err));
    })
);

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret'
    },
    function(jwtPayload, cb){
        return userModel.findOne({'email': jwtPayload})
            .then(user => {
                if(user){
                    return cb(null, user);
                }
            })
            .catch(err => cb(err));
    }
));