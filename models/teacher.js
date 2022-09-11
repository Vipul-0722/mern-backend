const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const teacherSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

module.exports = mongoose.model('Teacher', teacherSchema);
