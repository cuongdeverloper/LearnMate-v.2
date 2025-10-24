const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
  learnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: "AssignmentTemplate" },

  title: String,
  description: String,
  fileUrl: String,
  deadline: Date,
}, { timestamps: true });

module.exports = mongoose.model("Assignment", AssignmentSchema);
