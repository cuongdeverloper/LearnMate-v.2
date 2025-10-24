const mongoose = require("mongoose");

const AssignmentStorageSchema = new mongoose.Schema({
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
  name: { type: String, required: true },
  description: String,
  assignments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssignmentTemplate",
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("AssignmentStorage", AssignmentStorageSchema);
