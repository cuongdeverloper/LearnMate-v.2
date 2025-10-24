const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },
  assignmentStorageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AssignmentStorage",
  },
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Assignment", AssignmentSchema);
