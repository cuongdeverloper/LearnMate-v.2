// models/Question.js
const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true
  },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  text: { type: String, required: true },
  options: [{ type: String, required: true }], // danh sách lựa chọn
  correctAnswer: {
    type: Number, // 0,1,2,3 ứng với A,B,C,D
    required: true,
  },
});

module.exports = mongoose.model("Question", QuestionSchema);
