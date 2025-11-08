// cron/autoCancelPendingBookings.js
const cron = require("node-cron");
const mongoose = require("mongoose");
const Booking = require("../modal/Booking");
const User = require("../modal/User");
const FinancialHistory = require("../modal/FinancialHistory");
const TutorAvailability = require("../modal/TutorAvailability");
const Schedule = require("../modal/Schedule");

async function autoCancelPendingBookings() {
  console.log("🕒 [CRON] Đang kiểm tra booking pending quá hạn...");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Giả sử quá 24h mà chưa approve thì cancel
    const EXPIRY_HOURS = 72;
    const expiryTime = new Date(Date.now() - EXPIRY_HOURS * 60 * 60 * 1000);

    // Tìm các booking pending quá hạn
    const expiredBookings = await Booking.find({
      status: "pending",
      createdAt: { $lt: expiryTime },
    }).session(session);

    if (expiredBookings.length === 0) {
      console.log("✅ Không có booking pending quá hạn.");
      await session.commitTransaction();
      session.endSession();
      return;
    }

    console.log(`⚠️ Tìm thấy ${expiredBookings.length} booking pending quá hạn.`);

    for (const booking of expiredBookings) {
      const learner = await User.findById(booking.learnerId).session(session);
      if (!learner) continue;

      // Hoàn tiền tháng đầu (vì chưa approve)
      const refundAmount = booking.initialPayment;
      learner.balance += refundAmount;
      await learner.save({ session });

      // Ghi lại lịch sử hoàn tiền
      await FinancialHistory.create(
        [
          {
            userId: learner._id,
            amount: refundAmount,
            balanceChange: refundAmount,
            type: "earning",
            status: "success",
            description: `Hệ thống tự động hoàn tiền booking chưa duyệt (${booking._id
              .toString()
              .slice(-6)})`,
            date: new Date(),
          },
        ],
        { session }
      );

      // Cập nhật trạng thái booking
      booking.status = "cancelled";
      booking.depositStatus = booking.deposit > 0 ? "refunded" : "none";
      await booking.save({ session });


      // Xóa schedule liên quan
      await Schedule.deleteMany({ bookingId: booking._id }).session(session);

      console.log(`🚫 Booking ${booking._id} đã bị hủy tự động và hoàn tiền.`);
    }

    await session.commitTransaction();
    session.endSession();

    console.log("✅ Hoàn tất cron hủy booking pending quá hạn.");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Lỗi trong cron auto cancel:", error);
  }
}

// Chạy mỗi giờ (có thể điều chỉnh tần suất)
cron.schedule("0 * * * *", () => {
  autoCancelPendingBookings();
});

module.exports = autoCancelPendingBookings;
