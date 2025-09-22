// models/Question.js
const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  text: { type: String, required: true },
  options: [{ type: String, required: true }], // danh sách lựa chọn
  correctAnswer: { type: String, required: true }
});

module.exports = mongoose.model("Question", QuestionSchema);
