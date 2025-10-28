const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema(
  {
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
    quizStorageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizStorage",
    },
    title: { type: String, required: true },
    description: { type: String },
    newestScore: { type: Number, default: 0 },
    attempted: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    duration: { type: Number, default: 1800 },
    deadline: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", QuizSchema);
