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

router.post('/get-teacher-with-salary', userController.getTeacherWithSalary);

router.post('/get-teacher-with-skill', userController.getTeacherWithSkill);

router.get('/get-profile', userController.getProfile);

router.post('/update-profile', userController.updateProfile);

router.post('/delete-skill', userController.delete);

router.post('/add-skill', userController.addSkill);

router.post('/check-to-signup-or-login', userController.checkToSignUpOrLogin);

router.post('/send-code-activated-account-by-email', userController.sendCodeActivatedAccountByEmail);

router.post('/activated-account', userController.activatedAccount);

router.post('/add-new-course', userController.addNewCourse);

router.get('/get-all-courses', userController.getAllCourses);

router.put('/update-info', userController.update_info);

router.put('/update-role', userController.update_role);

router.put('/change-password', userController.change_password);

module.exports = router;
