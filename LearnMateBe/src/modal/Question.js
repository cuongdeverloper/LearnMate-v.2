const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
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
  topic: {
    type: String, // ví dụ: “Algebra”, “Tenses”, “Vocabulary”
    required: false,
  },

  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },

  // Gán quiz/booking nếu đã assign
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },

}, { timestamps: true });

module.exports = mongoose.model("Question", QuestionSchema);
