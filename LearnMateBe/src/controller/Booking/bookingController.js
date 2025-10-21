const Booking = require("../../modal/Booking");
const User = require("../../modal/User");
const Schedule = require("../../modal/Schedule");
const FinancialHistory = require("../../modal/FinancialHistory");
const TutorAvailability = require("../../modal/TutorAvailability");
const Tutor = require("../../modal/Tutor");

const Report = require("../../modal/Report");

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid booking ID format." });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }
    res.json(booking);
  } catch (error) {
    console.error("Error fetching booking by ID:", error);
    res.status(500).json({ message: "Server error fetching booking details." });
  }
};
// controllers/bookingController.js
// ✅ Create Booking với cọc 30%
exports.createBooking = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const {
      amount,
      numberOfMonths,
      note,
      subjectId,
      availabilityIds,
      addressDetail,
      province,
      depositOption,
    } = req.body;

    if (
      !tutorId ||
      !amount ||
      !subjectId ||
      !availabilityIds?.length ||
      !numberOfMonths ||
      !depositOption
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    if (!req.user)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const learnerId = req.user.id;
    const tutorDoc = await Tutor.findById(tutorId);
    if (!tutorDoc)
      return res
        .status(404)
        .json({ success: false, message: "Tutor not found" });
    // if (learnerId === tutorDoc.user.toString()) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Bạn không thể đặt lịch với chính mình.",
    //   });
    // }

    const user = await User.findById(learnerId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const existingBooking = await Booking.findOne({
      learnerId,
      tutorId,
      subjectId,
      status: { $in: ["pending", "approve"] },
    });
    if (existingBooking)
      return res
        .status(400)
        .json({ success: false, message: "Bạn đã có booking đang hoạt động." });

    const depositPercent = depositOption === 60 ? 60 : 30;

    const baseSlots = await TutorAvailability.find({
      _id: { $in: availabilityIds },
      isBooked: false,
    });
    if (baseSlots.length !== availabilityIds.length) {
      return res
        .status(400)
        .json({ success: false, message: "Một số slot đã được đặt" });
    }

    const totalSessions = baseSlots.length * numberOfMonths * 4;
    const totalAmount = tutorDoc.pricePerHour * totalSessions;
    const deposit = Math.round(totalAmount * (depositPercent / 100));
    const remaining = totalAmount - deposit;
    const monthlyPayment = Math.round(remaining / numberOfMonths);

    if (user.balance < deposit)
      return res
        .status(400)
        .json({ success: false, message: "Số dư không đủ để đặt cọc." });

    // Trừ tiền cọc
    user.balance -= deposit;
    await user.save();
    await FinancialHistory.create({
      userId: learnerId,
      amount: deposit,
      balanceChange: -deposit,
      type: "spend",
      status: "success",
      description: `Đặt cọc ${depositPercent}% cho booking với gia sư ${tutorId.slice(
        -6
      )}`,
      date: new Date(),
    });

    const fullAddress = `${addressDetail?.trim() || ""}, ${
      province?.trim() || ""
    }`;

    const booking = await Booking.create({
      learnerId,
      tutorId,
      subjectId,
      amount: totalAmount,
      deposit,
      depositPercent,
      monthlyPayment,
      numberOfMonths,
      paidMonths: 0,
      status: "pending",
      note,
      address: fullAddress,
      numberOfSession: totalSessions,
    });

    // Mark slots as booked
    await TutorAvailability.updateMany(
      { _id: { $in: availabilityIds } },
      { $set: { isBooked: true } }
    );

    // Tạo lịch Schedule dựa trên dayOfWeek
    const schedulesData = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset giờ phút giây

    for (const slot of baseSlots) {
      // dayOfWeek: T2=1, ..., CN=0
      let dayOffset = slot.dayOfWeek === 0 ? 0 : slot.dayOfWeek; // CN=0, T2=1,...

      // tính ngày slot tuần hiện tại
      const slotDate = new Date(today);
      const diff = (dayOffset + 7 - today.getDay()) % 7;
      slotDate.setDate(today.getDate() + diff);

      // Nếu slot trong tuần này đã qua, bắt đầu từ tuần kế tiếp
      let firstWeekOffset = 0;
      if (slotDate < today) firstWeekOffset = 1;

      for (
        let weekOffset = firstWeekOffset;
        weekOffset < numberOfMonths * 4;
        weekOffset++
      ) {
        const scheduleDate = new Date(slotDate);
        scheduleDate.setDate(slotDate.getDate() + weekOffset * 7);

        schedulesData.push({
          tutorId,
          learnerId,
          bookingId: booking._id,
          date: scheduleDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
        });
      }
    }
    const insertedSchedules = await Schedule.insertMany(schedulesData);
    booking.scheduleIds = insertedSchedules.map((s) => s._id);
    await booking.save();

    res.status(201).json({
      success: true,
      bookingId: booking._id,
      deposit,
      depositPercent,
      monthlyPayment,
      numberOfMonths,
      totalSessions,
      totalAmount,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserBookingHistory = async (req, res) => {
  const userId = req.params.userId;
  try {
    const bookings = await Booking.find({ learnerId: userId })
      .populate({
        path: "tutorId",
        populate: {
          path: "user",
          select: "username email image",
        },
      })
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (err) {
    console.error("Lỗi getUserBookingHistory:", err);
    res.status(500).json({ error: "Lỗi khi lấy lịch sử đặt lịch." });
  }
};

exports.getApprovedBookingsForLearner = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message:
          "Bạn chưa đăng nhập. Vui lòng đăng nhập để xem các khóa học đã duyệt.",
      });
    }

    const learnerId = req.user.id || req.user._id;

    const bookings = await Booking.find({
      learnerId,
      status: "approve",
    })
      .populate({
        path: "tutorId",
        select: "user",
        populate: {
          path: "user",
          select: "username",
        },
      })
      .populate({
        path: "subjectId",
        select: "name classLevel",
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Lỗi khi lấy các khóa học đã duyệt:", err);
    res.status(500).json({
      message:
        "Đã xảy ra lỗi khi tải danh sách khóa học của bạn. Vui lòng thử lại sau.",
    });
  }
};
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id || req.user._id;

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });
    if (booking.learnerId.toString() !== userId.toString())
      return res.status(403).json({ success: false, message: "Unauthorized." });
    if (booking.status !== "pending")
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be cancelled.",
      });

    booking.status = "cancelled";
    await booking.save();

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(500)
        .json({ success: false, message: "User not found." });

    user.balance += booking.deposit;
    await user.save();

    await FinancialHistory.create({
      userId,
      amount: booking.deposit,
      balanceChange: booking.deposit,
      type: "earning",
      status: "success",
      description: `Hoàn tiền cọc sau khi hủy khóa học (${booking._id
        .toString()
        .slice(-6)})`,
      date: new Date(),
    });

    // Reset TutorAvailability slots
    const schedules = await Schedule.find({ bookingId: booking._id });
    const dayTimePairs = schedules.map((s) => ({
      dayOfWeek: s.date.getDay(),
      startTime: s.startTime,
      endTime: s.endTime,
    }));
    for (const pair of dayTimePairs) {
      await TutorAvailability.updateMany(
        {
          tutorId: booking.tutorId,
          dayOfWeek: pair.dayOfWeek,
          startTime: pair.startTime,
          endTime: pair.endTime,
        },
        { $set: { isBooked: false } }
      );
    }
    await Schedule.deleteMany({ bookingId: booking._id });
    res.status(200).json({
      success: true,
      message: "Booking cancelled and refunded successfully.",
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.finishBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate({
      path: "tutorId",
      populate: { path: "user" },
    });
    if (!bookingId || !bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid bookingId" });
    }
    if (!booking.tutorId || !booking.tutorId.user) {
      return res.status(500).json({
        message: "Thiếu thông tin người dạy (tutor.user) trong booking",
      });
    }

    console.log("📦 booking chi tiết:", booking);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.completed) {
      return res
        .status(400)
        .json({ message: "Booking đã hoàn thành trước đó" });
    }

    const totalSessions = booking.numberOfSessions;
    const attendedSessions = await Schedule.countDocuments({
      bookingId: bookingId,
      attended: true,
    });

    // ✅ Kiểm tra chưa học buổi nào
    if (attendedSessions === 0) {
      return res
        .status(400)
        .json({ message: "Chưa học buổi nào. Không thể kết thúc khóa học." });
    }

    // ✅ Kiểm tra chưa học đủ số buổi
    if (attendedSessions < totalSessions) {
      return res
        .status(400)
        .json({ message: "Chưa hoàn thành đủ buổi học để kết thúc khóa" });
    }

    booking.completed = true;
    await booking.save();

    const tutorUser = booking.tutorId.user;
    const tutorUserDoc = await User.findById(tutorUser._id);

    if (!tutorUserDoc) {
      return res.status(404).json({ message: "Tutor user not found" });
    }

    tutorUserDoc.balance += booking.amount;
    await tutorUserDoc.save();

    await FinancialHistory.create({
      userId: tutorUserDoc._id,
      amount: booking.amount,
      balanceChange: booking.amount,
      type: "earning",
      status: "success",
      description: `Nhận tiền từ học viên sau khi hoàn tất khóa học (${booking._id
        .toString()
        .slice(-6)})`,
      date: new Date(),
    });

    res.json({
      message: "Đã hoàn thành khóa học và cộng tiền cho tutor",
      balance: tutorUserDoc.balance,
    });
  } catch (error) {
    console.error("❌ Error finishing booking:", error.message);
    console.error("📦 Full error object:", error); // In cả stack trace
    res.status(500).json({
      message: "Lỗi server khi hoàn tất khóa học",
      error: error.message,
    });
  }
};
exports.getAllBookingsByTutorId = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const user = await User.findById(tutorId);
    const tutor = await Tutor.findOne({ user: user._id });
    const IdTutor = tutor._id;
    // Kiểm tra định dạng ID
    if (!IdTutor || !IdTutor.toString().match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "❌ Định dạng tutor ID không hợp lệ.",
      });
    }

    // Tìm các booking của tutor đó
    const bookings = await Booking.find({ tutorId: IdTutor })
      .populate({
        path: "learnerId",
        select: "username email phoneNumber gender image",
      })
      .populate({
        path: "subjectId",
        select: "name classLevel description",
      })
      .populate({
        path: "scheduleIds",
        select: "date startTime endTime attended",
      })
      .sort({ createdAt: -1 });

    // Xử lý dữ liệu lịch học để có startDate và endDate
    const enrichedBookings = bookings.map((booking) => {
      const schedules = booking.scheduleIds || [];
      const dates = schedules.map((s) => new Date(s.date));

      const startDate = dates.length ? new Date(Math.min(...dates)) : null;
      const endDate = dates.length ? new Date(Math.max(...dates)) : null;

      return {
        ...booking.toObject(),
        startDate,
        endDate,
        totalSessions: schedules.length,
        completedSessions: schedules.filter((s) => s.attended).length,
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedBookings.length,
      bookings: enrichedBookings,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách booking của tutor:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách booking của tutor.",
    });
  }
};

exports.createReport = async (req, res) => {
  const { targetType, targetId, reason } = req.body;

  if (!targetType || !targetId || !reason) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu dữ liệu báo cáo." });
  }

  try {
    const report = new Report({
      reporter: req.user.id, // Ensure req.user.id is correctly populated from checkAccessToken
      targetType,
      targetId,
      reason,
    });

    await report.save();

    // --- NEW: Update the associated booking's reported status ---
    if (targetType === "booking") {
      // Only update if the target is indeed a booking
      await Booking.findByIdAndUpdate(
        targetId,
        {
          reported: true,
          reportedAt: new Date(), // Set the timestamp
        },
        { new: true }
      ); // `new: true` returns the updated document
    }
    // --- END NEW ---

    return res
      .status(200)
      .json({ success: true, message: "Báo cáo đã được gửi." });
  } catch (err) {
    console.error("Error creating report:", err);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi tạo báo cáo." });
  }
};

// Lấy tất cả báo cáo (dành cho Admin)
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporter", "username email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: reports });
  } catch (err) {
    console.error("Error fetching reports:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách báo cáo.",
    });
  }
};

// Duyệt báo cáo (Admin xử lý)
exports.updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "reviewed", "dismissed"].includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Trạng thái không hợp lệ." });
  }

  try {
    const report = await Report.findById(id);
    if (!report)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy báo cáo." });

    report.status = status;
    await report.save();

    return res
      .status(200)
      .json({ success: true, message: "Cập nhật trạng thái thành công." });
  } catch (err) {
    console.error("Error updating report:", err);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi cập nhật báo cáo." });
  }
};
