const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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

    scheduleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Schedule" }],

    status: {
      type: String,
      enum: ["pending", "approve", "cancelled", "rejected", "completed"],
      default: "pending",
    },
    address: { type: String, default: "" },
    amount: { type: Number, required: true }, // Tổng tiền toàn khóa
    deposit: { type: Number, default: 0 }, // Số tiền cọc
    depositPercent: { type: Number, default: 30 }, // 30% hoặc 60%
    monthlyPayment: { type: Number, default: 0 }, // Số tiền mỗi tháng
    numberOfMonths: { type: Number, default: 1 }, // Tổng số tháng học
    numberOfSession: { type: Number, default: 1 },
    paidMonths: { type: Number, default: 0 }, // Số tháng đã thanh toán
    note: { type: String, default: "" },
    completed: { type: Boolean, default: false },
    reported: { type: Boolean, default: false },
    reportedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
