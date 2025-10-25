const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema(
  {
    assignmentStorageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssignmentStorage",
      required: true,
    },
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
    learnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },

    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    deadline: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", AssignmentSchema);
