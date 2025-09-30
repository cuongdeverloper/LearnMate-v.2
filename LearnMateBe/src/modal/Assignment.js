const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  title: { type: String, required: true },
  description: String,
  fileUrl: String,
  deadline: Date,
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
