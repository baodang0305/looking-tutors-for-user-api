const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const {userModel} = require('../models/user');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
    },
    async (email, password, cb) => {
        try {
            const result = await userModel.findOne({email, password});
            if (!result) {
                return cb(null, false, { message: 'Email hoặc mật khẩu không đúng' });
            }
            const user = {
                email: result.email,
                fullName: result.fullName,
                address: result.address,
                phoneNumber: result.phoneNumber,
                discribe: result.discribe,
                skills: result.skills,
                role: result.role,
                salary: result.salary,
                userImg: result.userImg
            }
            return cb(null, user, { message: 'Đăng nhập thành công' });
        }
        catch (err) {
            return cb(err);
        }
    })
);

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret'
    },
    async(jwtPayload, cb) => {
        try {
            const user = await userModel.findOne({ 'email': jwtPayload.email });
            if (user) {
                return cb(null, user);
            }
        }
        catch (err) {
            return cb(err);
        }
    }
));