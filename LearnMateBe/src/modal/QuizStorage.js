const mongoose = require("mongoose");

const QuizStorageSchema = new mongoose.Schema({
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
  name: { type: String, required: true }, // ví dụ "English Grammar Quizzes"
  description: { type: String },

  // danh sách quiz mẫu (quiz template, chưa assign)
  quizzes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizTemplate",
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("QuizStorage", QuizStorageSchema);
