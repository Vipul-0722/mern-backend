const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');

const Teacher = require('../models/teacher');
const User = require('../models/user');

const getTeacherById = async (req, res, next) => {
  const teacherId = req.params.tid;

  let teacher;
  try {
    teacher = await Teacher.findById(teacherId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a teacher.',
      500
    );
    return next(error);
  }

  if (!teacher) {
    const error = new HttpError(
      'Could not find teacher for the provided id.',
      404
    );
    return next(error);
  }

  res.json({ teacher: teacher.toObject({ getters: true }) });
};

const getTeacherByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithTeacher;
  try {
    userWithTeacher = await User.findById(userId).populate('teacher');
  } catch (err) {
    const error = new HttpError(
      'Fetching teacher failed, please try again later.',
      500
    );
     return next(error);
    return;
  }


  if (!userWithTeacher || userWithTeacher.teacher.length === 0) {
    return next(
      new HttpError('Could not find teachers for the provided user id.', 404)
    );
  }

  res.json({ teacher: userWithTeacher.teacher.map(teacher => teacher.toObject({ getters: true })) });
};

const createTeacher = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { name , phone, email, creator } = req.body;



  const createdTeacher = new Teacher({
    name,
    phone,
    email,
    creator
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError(
      'Creating teacher failed, please try again.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdTeacher.save({ session: sess }); 
    user.teacher.push(createdTeacher); 
    await user.save({ session: sess }); 
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating teacher failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ teacher: createdTeacher });
};

const updateTeacher = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { name, phone } = req.body;
  const teacherId = req.params.tid;

  let teacher;
  try {
    teacher = await Teacher.findById(teacherId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update teacher.',
      500
    );
    return next(error);
  }

  teacher.name = name;
  teacher.phone = phone;

  try {
    await teacher.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update teacher.',
      500
    );
    return next(error);
  }

  res.status(200).json({ teacher: teacher.toObject({ getters: true }) });
};

const deleteTeacher = async (req, res, next) => {
  const teacherId = req.params.tid;

  let teacher;
  try {
    teacher = await Teacher.findById(teacherId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete teacher.',
      500
    );
    return next(error);
  }

  if (!teacher) {
    const error = new HttpError('Could not find teacher for this id.', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await teacher.remove({session: sess});
    teacher.creator.teacher.pull(teacher);
    await teacher.creator.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete teacher.',
      500
    );
    return next(error);
  }
  
  res.status(200).json({ message: 'Deleted teacher.' });
};

exports.getTeacherById = getTeacherById;
exports.getTeacherByUserId = getTeacherByUserId;
exports.createTeacher = createTeacher;
exports.updateTeacher = updateTeacher;
exports.deleteTeacher = deleteTeacher;
