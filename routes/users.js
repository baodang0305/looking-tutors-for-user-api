const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/sign-up', userController.signUp);

router.post('/login', userController.login);

router.get('/get-teacher-all', userController.getTeacherAll);

router.get('/get-profile', userController.getProfile);

router.post('/update-profile', userController.updateProfile);

router.post('/delete-skill-item', userController.deleteSkill);

module.exports = router;
