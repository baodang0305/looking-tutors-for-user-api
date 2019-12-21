const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/sign-up', userController.signUp);

router.post('/login', userController.login);

router.get('/get-profile', userController.getProfile);

router.get('/get-teacher-all', userController.getTeacherAll);

router.post('/get-teacher-with-address', userController.getTeacherWithAddress);

router.get('/get-profile', userController.getProfile);

router.post('/update-profile', userController.updateProfile);

router.post('/delete-skill', userController.delete);

router.post('/add-skill', userController.addSkill);

router.post('/check-to-signup-or-login', userController.checkToSignUpOrLogin);

module.exports = router;
