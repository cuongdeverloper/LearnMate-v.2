const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",
    required: true,
  },
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  duration: {
    type: Number,
    required: true,
    default: 1800,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Quiz", QuizSchema);
