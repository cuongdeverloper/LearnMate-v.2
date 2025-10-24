const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
  title: String,
  description: String,
  duration: Number,
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
  learnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },

  // liên kết quiz mẫu gốc
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: "QuizTemplate" },
}, { timestamps: true });

module.exports = mongoose.model("Quiz", QuizSchema);
