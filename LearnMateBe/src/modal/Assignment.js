const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  title: { type: String, required: true },
  description: String,
  fileUrl: String,
  deadline: Date,
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
