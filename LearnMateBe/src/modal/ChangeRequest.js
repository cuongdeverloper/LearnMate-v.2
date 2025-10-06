const mongoose = require("mongoose");

const changeRequestSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  learnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  newDate: { type: Date, required: true },
  newStartTime: { type: String, required: true },
  newEndTime: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("ChangeRequest", changeRequestSchema);
