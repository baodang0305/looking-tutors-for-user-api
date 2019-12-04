const express = require('express');
const userController = require('../controllers/user');
const passport = require('passport');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/sign-up', userController.signUp);

router.post('/login', passport.authenticate('jwt', {session: false}), userController.login)
module.exports = router;
