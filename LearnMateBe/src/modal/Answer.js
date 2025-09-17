// models/Answer.js
const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  learner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  selectedAnswer: { type: String, required: true },
  isCorrect: { type: Boolean, default: false }
});

module.exports = mongoose.model("Answer", AnswerSchema);
