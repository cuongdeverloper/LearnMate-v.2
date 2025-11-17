const Booking = require("../../modal/Booking");
const User = require("../../modal/User");
const Schedule = require("../../modal/Schedule");
const FinancialHistory = require("../../modal/FinancialHistory");
const TutorAvailability = require("../../modal/TutorAvailability");
const Tutor = require("../../modal/Tutor");
const mongoose = require("mongoose");
const Report = require("../../modal/Report");
const { createNotification } = require("../Notification/NotificationController");
const { getUser } = require("../../utils/socketUser");

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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { tutorId } = req.params;
    const {
      numberOfMonths,
      note,
      subjectId,
      availabilityIds,
      addressDetail,
      province,
      startDate,
    } = req.body;

    if (!tutorId || !subjectId || !availabilityIds?.length || !numberOfMonths)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu dữ liệu bắt buộc." });

    if (!req.user)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const learnerId = req.user.id;

    const tutor = await Tutor.findById(tutorId).session(session);
    if (!tutor)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy gia sư." });

    if (learnerId === tutor.user.toString())
      return res.status(400).json({
        success: false,
        message: "Bạn không thể đặt lịch với chính mình.",
      });

    const learner = await User.findById(learnerId).session(session);
    if (!learner)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy học viên." });

    const existingBooking = await Booking.findOne({
      learnerId,
      tutorId,
      subjectId,
      status: { $in: ["pending", "approve"] },
    }).session(session);

    if (existingBooking)
      return res.status(400).json({
        success: false,
        message: "Bạn đã có booking đang hoạt động với gia sư này.",
      });

    const slots = await TutorAvailability.find({
      _id: { $in: availabilityIds },
      isBooked: false,
    }).session(session);

    if (slots.length !== availabilityIds.length)
      return res
        .status(400)
        .json({ success: false, message: "Một số lịch đã được đặt." });

    // --- Tính toán phí ---
    const weeklySlots = slots.length; // số buổi mỗi tuần
    const sessionsPerMonth = weeklySlots * 4; // 4 tuần/tháng (có thể nâng cấp chính xác)
    const monthlyFee = tutor.pricePerHour * sessionsPerMonth;
    const totalAmount = monthlyFee * numberOfMonths;


    // Cọc tháng cuối nếu > 1 tháng
    const deposit = numberOfMonths > 1 ? monthlyFee : 0;
    const depositStatus = deposit > 0 ? "held" : "none";
    const initialPayment = monthlyFee + deposit;
    if (learner.balance < initialPayment)
      return res.status(400).json({
        success: false,
        message: "Số dư không đủ để thanh toán tháng đầu.",
      });

    // Trừ tiền tháng đầu
    learner.balance -= initialPayment;
    await learner.save({ session });

    // Lưu lịch sử tài chính
    await FinancialHistory.create(
      [
        {
          userId: learnerId,
          amount: initialPayment,
          balanceChange: -initialPayment,
          type: "spend",
          status: "success",
          description:
            numberOfMonths > 1
              ? `Thanh toán tháng đầu cho booking với gia sư ${tutorId.slice(
                -6
              )}, giữ cọc tháng cuối`
              : `Thanh toán tháng đầu cho booking với gia sư ${tutorId.slice(
                -6
              )}`,
          date: new Date(),
        },
      ],
      { session }
    );

    // --- Tạo booking ---
    const booking = await Booking.create(
      [
        {
          learnerId,
          tutorId,
          subjectId,
          numberOfMonths,
          amount: totalAmount,
          monthlyPayment: monthlyFee,
          deposit,
          depositStatus,
          paidMonths: 1,
          initialPayment,
          status: "pending",
          note,
          address: `${addressDetail}, ${province}`,
          startDate,
        },
      ],
      { session }
    );

    const bookingDoc = booking[0];

    // --- Tạo lịch học ---
    const baseDate = startDate ? new Date(startDate) : new Date();
    baseDate.setHours(0, 0, 0, 0);

    const schedules = [];

    for (const slot of slots) {
      let diff = (slot.dayOfWeek + 7 - baseDate.getDay()) % 7;
      const firstDate = new Date(baseDate);
      firstDate.setDate(baseDate.getDate() + diff);

      for (let i = 0; i < numberOfMonths * 4; i++) {
        const date = new Date(firstDate);
        date.setDate(firstDate.getDate() + i * 7);
        schedules.push({
          tutorId,
          learnerId,
          bookingId: bookingDoc._id,
          date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: "pending",
        });
      }
    }

    const createdSchedules = await Schedule.insertMany(schedules, { session });
    bookingDoc.scheduleIds = createdSchedules.map((s) => s._id);
    bookingDoc.startDate = baseDate; // 👈 Lưu lại startDate
    await bookingDoc.save({ session });

    await session.commitTransaction();
    session.endSession();

    const notification = await createNotification({
      title: "Bạn có booking mới!",
      message: `${learner.username} vừa đặt lịch học với bạn.`,
      type: "booking",
      recipient: tutor.user, // chính là userId của tutor
      sender: learnerId,
      relatedId: bookingDoc._id,
      relatedModel: "Booking",
    });

    // 🔥 Gửi realtime nếu tutor đang online
    const io = req.app.get("io"); // đảm bảo bạn đã set io vào app (xem bước 3)
    const user = getUser(tutor.user.toString());
    if (user && io) {
      io.to(user.socketId).emit("getNotification", notification);
    }

    res.status(201).json({
      success: true,
      bookingId: bookingDoc._id,
      totalAmount,
      monthlyFee,
      deposit,
      initialPayment,
      message:
        "Đặt lịch thành công. Tháng đầu đã thanh toán, cọc tháng cuối được giữ.",
    });
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    session.endSession();
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
      .populate({
        path: "subjectId",
        select: "name pricePerMonth sessionsPerMonth",
      })
      .sort({ createdAt: -1 })
      .lean(); // -> dữ liệu thuần để dễ xử lý

    const enrichedBookings = bookings.map((b) => {
      const totalPaid = (b.paidMonths || 0) * (b.monthlyPayment || 0);
      const remainingAmount = (b.amount || 0) - totalPaid;

      const depositInfo = (() => {
        switch (b.depositStatus) {
          case "held":
            return "Đang giữ cọc";
          case "used":
            return "Đã dùng cọc";
          case "refunded":
            return "Đã hoàn cọc";
          case "forfeit":
            return "Mất cọc";
          default:
            return "Không có cọc";
        }
      })();

      // ✅ Tổng số buổi dựa vào scheduleIds
      const totalSessions = Array.isArray(b.scheduleIds)
        ? b.scheduleIds.length
        : 0;

      return {
        ...b,
        subjectName: b.subjectId?.name || "Không rõ",
        depositInfo,
        remainingAmount,
        totalSessions, // ✅ Thêm trường này
        display: {
          total: `${b.amount?.toLocaleString()} VND`,
          paid: `${totalPaid?.toLocaleString()} VND`,
          remain: `${remainingAmount?.toLocaleString()} VND`,
          deposit: `${b.deposit?.toLocaleString()} VND`,
          monthly: `${b.monthlyPayment?.toLocaleString()} VND`,
        },
      };
    });

    res.status(200).json({ bookings: enrichedBookings });
  } catch (err) {
    console.error("❌ Lỗi getUserBookingHistory:", err);
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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { bookingId } = req.params;
    const userId = req.user.id || req.user._id;

    const booking = await Booking.findById(bookingId).session(session);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy booking." });

    if (booking.learnerId.toString() !== userId.toString())
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền hủy booking này." });

    const learner = await User.findById(userId).session(session);
    if (!learner)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy học viên." });

    // --- Case 1: tutor chưa approve => hoàn toàn bộ thanh toán ---
    if (booking.status === "pending") {
      const refundAmount = booking.initialPayment;
      learner.balance += refundAmount;
      await learner.save({ session });

      await FinancialHistory.create(
        [
          {
            userId,
            amount: refundAmount,
            balanceChange: refundAmount,
            type: "refund",
            status: "success",
            description: `Hoàn tiền booking chưa duyệt (${booking._id
              .toString()
              .slice(-6)})`,
            date: new Date(),
          },
        ],
        { session }
      );


      booking.status = "cancelled";
      booking.depositStatus = booking.deposit > 0 ? "refunded" : "none";
    }
    // --- Case 2: tutor đã duyệt hoặc đã học -> cần xử lý riêng ---
    else if (booking.status === "approve") {
      // Tùy quy định, có thể chỉ hoàn cọc nếu chưa học buổi nào
      booking.status = "cancelled";
      booking.depositStatus = "forfeit";
    } else {
      return res
        .status(400)
        .json({
          success: false,
          message: "Không thể hủy booking ở trạng thái này.",
        });
    }

    await booking.save({ session });

    // Xóa lịch
    await Schedule.deleteMany({ bookingId: booking._id }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Đã hủy booking và hoàn tiền (nếu có).",
      bookingId: booking._id,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Error cancelling booking:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.finishBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // ✅ Kiểm tra bookingId hợp lệ trước khi truy vấn
    if (!bookingId || !bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid bookingId" });
    }

    // ✅ Lấy booking kèm thông tin tutor.user
    const booking = await Booking.findById(bookingId)
      .populate({
        path: "tutorId",
        populate: { path: "user" },
      })
      .populate("scheduleIds");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!booking.tutorId || !booking.tutorId.user) {
      return res.status(500).json({
        message: "Thiếu thông tin người dạy (tutor.user) trong booking",
      });
    }

    if (booking.completed) {
      return res
        .status(400)
        .json({ message: "Booking đã hoàn thành trước đó" });
    }

    // ✅ Số buổi dự kiến
    const totalSessions = booking.scheduleIds.length;

    // ✅ Số buổi đã học (attended = true)
    const attendedSessions = await Schedule.countDocuments({
      bookingId: bookingId,
      attended: true,
    });

    if (attendedSessions === 0) {
      return res.status(400).json({
        message: "Chưa học buổi nào. Không thể kết thúc khóa học.",
      });
    }

    if (attendedSessions < totalSessions) {
      return res.status(400).json({
        message: "Chưa hoàn thành đủ buổi học để kết thúc khóa",
      });
    }

    // ✅ Cập nhật trạng thái booking
    booking.completed = true;
    booking.status = "approve";
    await booking.save();

    // ✅ Cập nhật tất cả schedule liên quan
    await Schedule.updateMany(
      { bookingId: bookingId },
      { $set: { status: "finished", attended: true } }
    );

    res.json({
      message: "Đã hoàn thành khóa học và cập nhật tất cả buổi học",
      bookingId: booking._id,
      completed: true,
    });
  } catch (error) {
    console.error("❌ Error finishing booking:", error);
    res.status(500).json({
      message: "Lỗi server khi hoàn tất khóa học",
      error: error.message,
    });
  }
};

exports.getAllBookingsByTutorId = async (req, res) => {
  try {
    const { tutorId } = req.params;

    // 🔍 Tìm user theo ID
    const user = await User.findById(tutorId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user với ID này.",
      });
    }

    // 🔍 Tìm tutor theo userId
    const tutor = await Tutor.findOne({ user: user._id });
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tutor tương ứng với user này.",
      });
    }

    const IdTutor = tutor._id;

    // Kiểm tra định dạng ObjectId
    if (!IdTutor.toString().match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "❌ Định dạng tutor ID không hợp lệ.",
      });
    }

    // ✅ Lấy danh sách bookings
    const bookings = await Booking.find({ tutorId: IdTutor })
      .populate({
        path: "learnerId",
        select: "username email phoneNumber gender image",
      })
      .populate({
        path: "subjectId",
        select: "name classLevel", // chỉ lấy 2 field thực tế có
      })
      .populate({
        path: "scheduleIds",
        select: "date startTime endTime attended",
      })
      .sort({ createdAt: -1 });

    // ✅ Enrich dữ liệu: thêm startDate, endDate, classLevel, ...
    const enrichedBookings = bookings.map((booking) => {
      const schedules = booking.scheduleIds || [];
      const dates = schedules.map((s) => new Date(s.date));
      const startDate = dates.length ? new Date(Math.min(...dates)) : null;
      const endDate = dates.length ? new Date(Math.max(...dates)) : null;

      const subject = booking.subjectId || {};
      const learner = booking.learnerId || {};

      return {
        _id: booking._id,
        status: booking.status,
        amount: booking.amount,
        address: booking.address,
        note: booking.note,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        startDate,
        endDate,
        totalSessions: schedules.length,
        completedSessions: schedules.filter((s) => s.attended).length,
        learner: {
          username: learner.username,
          email: learner.email,
          phoneNumber: learner.phoneNumber,
          gender: learner.gender,
          image: learner.image,
        },
        subject: {
          name: subject.name,
          classLevel: subject.classLevel,
        },
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
