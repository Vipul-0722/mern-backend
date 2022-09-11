const express = require('express');
const { check } = require('express-validator');

const teacherControllers = require('../controllers/teacher-controllers');

const router = express.Router();

router.get('/:tid', teacherControllers.getTeacherById);

router.get('/user/:uid', teacherControllers.getTeacherByUserId);


router.post(
  '/',
  [
    check('name')
      .not()
      .isEmpty(),
    check('phone').isLength({ min: 5 }),
    check('email')
      .not()
      .isEmpty()
  ],
  teacherControllers.createTeacher
);

router.patch(
  '/:tid',
  [
    check('name')
      .not()
      .isEmpty(),
    check('phone').isLength({ min: 10 })
  ],
  teacherControllers.updateTeacher
);

router.delete('/:tid', teacherControllers.deleteTeacher);

module.exports = router;
