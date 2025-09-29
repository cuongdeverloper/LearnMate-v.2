// models/TutorAvailability.js
const mongoose = require("mongoose");

const tutorAvailabilitySchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
  date: { type: Date, required: true }, // Ngày dạy
  startTime: { type: String, required: true }, // "10:00"
  endTime: { type: String, required: true },   // "11:00"
  isBooked: { type: Boolean, default: false }, // Đã có learner đặt chưa
}, { timestamps: true });

module.exports = mongoose.model("TutorAvailability", tutorAvailabilitySchema);
