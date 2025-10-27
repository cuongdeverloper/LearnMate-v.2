const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  learnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  selectedAnswer: { type: Number, required: true }, 
  isCorrect: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Answer", AnswerSchema);
