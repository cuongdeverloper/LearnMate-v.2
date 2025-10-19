const Schedule = require("../../modal/Schedule");
const Booking = require("../../modal/Booking");
const ChangeRequest = require("../../modal/ChangeRequest");
const User = require("../../modal/User");
const Tutor = require("../../modal/Tutor");
const FinancialHistory = require("../../modal/FinancialHistory");


function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
exports.requestChangeSchedule = async (req, res) => {
  try {
    const { scheduleId, newDate, newStartTime, newEndTime, reason } = req.body;

    // ✅ Kiểm tra dữ liệu đầu vào
    if (!scheduleId || !newDate || !newStartTime || !newEndTime || !reason) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    // ✅ Tìm lịch học
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res
        .status(404)
        .json({ success: false, message: "Schedule not found." });
    }
    const existingRequest = await ChangeRequest.findOne({
      scheduleId,
      learnerId: req.user._id || req.user.id,
      status: "pending", // 
    });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "A change request for this schedule is already pending.",
      });
    }
    // ✅ Kiểm tra quyền của học viên (chỉ học viên của buổi học mới được đổi

    if (
      schedule.learnerId.toString() !== req.user._id &&
      schedule.learnerId.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized action." });
    }

    // ✅ Tạo yêu cầu đổi lịch
    const changeRequest = new ChangeRequest({
      scheduleId,
      learnerId: req.user._id || req.user.id,
      newDate,
      newStartTime,
      newEndTime,
      reason,
    });

    await changeRequest.save();

    return res.status(201).json({
      success: true,
      message: "Change schedule request created successfully.",
      data: changeRequest,
    });
  } catch (error) {
    console.error("Error in requestChangeSchedule:", error);
    return res.status(500).json({
      success: false,
      message: "Server error when requesting schedule change.",
      error: error.message,
    });
  }
};
exports.getMyChangeRequests = async (req, res) => {
  try {
    const learnerId = req.user._id || req.user.id;

    const requests = await ChangeRequest.find({ learnerId })
      .populate("scheduleId", "date startTime endTime tutorId")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error in getMyChangeRequests:", error);
    return res.status(500).json({
      success: false,
      message: "Server error when fetching change request history.",
    });
  }
};
// 1. Lấy slot bận trong tuần của booking
// Lấy toàn bộ slot bận trong tuần (mọi booking)
exports.getBusySlotsForWeek = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { weekStart } = req.query;

    if (!bookingId || bookingId === "undefined" || !weekStart) {
      return res.status(400).json({ message: "Missing or invalid parameters" });
    }

    if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid bookingId format" });
    }

    const startDate = new Date(weekStart);
    const endDate = addDays(startDate, 7);

    const busySlots = await Schedule.find({
      date: { $gte: startDate, $lt: endDate },
    }).select("date startTime endTime bookingId");

    res.json(busySlots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 2. Thêm nhiều slot lịch cho booking
exports.addMultipleSlots = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { slots } = req.body;

    if (
      !bookingId ||
      bookingId === "undefined" ||
      !Array.isArray(slots) ||
      slots.length === 0
    ) {
      return res.status(400).json({ message: "Invalid input" });
    }

    if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid bookingId format" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const newSchedules = slots.map((s) => ({
      tutorId: booking.tutorId,
      learnerId: booking.learnerId,
      bookingId,
      date: new Date(s.date),
      startTime: s.startTime,
      endTime: s.endTime,
    }));

    await Schedule.insertMany(newSchedules);

    res.json({ message: "Slots added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 3. Xóa slot lịch
exports.deleteScheduleSlot = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    if (!scheduleId || scheduleId === "undefined") {
      return res.status(400).json({ message: "Missing scheduleId" });
    }

    if (!scheduleId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid scheduleId format" });
    }

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule)
      return res.status(404).json({ message: "Schedule not found" });

    await schedule.deleteOne();

    res.json({ message: "Schedule slot deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getLearnerWeeklySchedules = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not logged in." });
    }
    const learnerId = req.user.id || req.user._id;
    const { weekStart } = req.query;

    if (!weekStart) {
      return res.status(400).json({ message: "Missing weekStart parameter" });
    }

    const startDate = new Date(weekStart);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = addDays(startDate, 7); // lấy đến đúng Chủ nhật
    endDate.setUTCHours(23, 59, 59, 999); // bao toàn bộ ngày Chủ nhật

    const schedules = await Schedule.find({
      learnerId: learnerId,
      date: { $gte: startDate, $lte: endDate }, // CHỈNH SỬA Ở ĐÂY
    })
      .populate({
        path: "bookingId",
        select: "tutorId",
        populate: {
          path: "tutorId",
          select: "user",
          populate: {
            path: "user",
            select: "username",
          },
        },
      })
      .select("date startTime endTime bookingId attended");

    res.json(schedules);
  } catch (error) {
    console.error("Error fetching learner's weekly schedules:", error);
    res.status(500).json({ message: "Server error fetching schedules" });
  }
};
// ✅ Mark Attendance & trừ tiền từng buổi
exports.markAttendance = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { attended } = req.body;

    if (!scheduleId || !scheduleId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid scheduleId" });
    }

    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not logged in" });
    }

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule slot not found" });
    }

    if (
      schedule.learnerId.toString() !== (req.user.id || req.user._id).toString()
    ) {
      return res
        .status(403)
        .json({
          message: "Forbidden: Bạn không có quyền cập nhật lịch trình này.",
        });
    }

    const booking = await Booking.findById(schedule.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking không tồn tại." });
    }

    if (booking.status !== "approve" && booking.status !== "completed") {
      return res.status(400).json({ message: "Booking không còn hiệu lực." });
    }
    if (booking.completed && attended === false) {
      return res
        .status(400)
        .json({
          message: "Booking này đã hoàn thành, không thể hủy điểm danh nữa.",
        });
    }

    const now = new Date();
    const scheduleDatePart = schedule.date.toISOString().split("T")[0];
    const sessionStartTimeUTC = new Date(
      `${scheduleDatePart}T${schedule.startTime}:00.000Z`
    );

    if (now.getTime() < sessionStartTimeUTC.getTime()) {
      return res
        .status(400)
        .json({ message: "Không thể điểm danh cho buổi học chưa bắt đầu." });
    }
    // ✅ Update attendance
    schedule.attended = attended;
    await schedule.save();

    // ✅ Nếu buổi học được điểm danh thành công → trừ tiền
    if (attended) {
      const learner = await User.findById(booking.learnerId);

      if (learner.balance < booking.sessionCost) {
        return res
          .status(400)
          .json({ message: "Số dư không đủ để thanh toán cho buổi học này." });
      }

      learner.balance -= booking.sessionCost;
      await learner.save();

      await FinancialHistory.create({
        userId: learner._id,
        amount: booking.sessionCost,
        balanceChange: -booking.sessionCost,
        type: "spend",
        status: "pending",
        description: `Thanh toán buổi học #${
          booking.paidSessions + 1
        } cho booking ${booking._id.toString().slice(-6)}`,
        date: new Date(),
      });

      booking.paidSessions += 1;

      await booking.save();
    } else {
      const learner = await User.findById(booking.learnerId);
      // ✅ Hủy điểm danh → hoàn lại tiền
      learner.balance += booking.sessionCost;
      await learner.save();

      await FinancialHistory.create({
        userId: learner._id,
        amount: booking.sessionCost,
        balanceChange: booking.sessionCost,
        type: "earning",
        status: "success",
        description: `Hoàn tiền buổi học #${
          booking.paidSessions
        } do hủy điểm danh (${booking._id.toString().slice(-6)})`,
        date: new Date(),
      });

      booking.paidSessions = Math.max(booking.paidSessions - 1, 0);
    }

    res.json({ message: "Điểm danh đã được cập nhật thành công", schedule });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật điểm danh." });
  }
};

exports.acceptChangeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id; 

    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thông tin gia sư." });
    }

    const changeRequest = await ChangeRequest.findById(requestId).populate("scheduleId");
    if (!changeRequest) {
      return res.status(404).json({ success: false, message: "Không tìm thấy yêu cầu thay đổi." });
    }

    const schedule = await Schedule.findById(changeRequest.scheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Không tìm thấy lịch học." });
    }
    if (schedule.tutorId.toString() !== tutor._id.toString()) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền phê duyệt yêu cầu này." });
    }

    changeRequest.status = "approved";
    await changeRequest.save();

    schedule.date = changeRequest.newDate;
    schedule.startTime = changeRequest.newStartTime;
    schedule.endTime = changeRequest.newEndTime;
    await schedule.save();

    res.status(200).json({
      success: true,
      message: "Đã chấp nhận yêu cầu thay đổi và cập nhật lịch thành công.",
      changeRequest,
      updatedSchedule: schedule,
    });
  } catch (error) {
    console.error("Lỗi khi chấp nhận yêu cầu thay đổi:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi xử lý yêu cầu thay đổi.",
      error: error.message,
    });
  }
};

exports.rejectChangeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thông tin gia sư." });
    }

    const changeRequest = await ChangeRequest.findById(requestId).populate("scheduleId");
    if (!changeRequest) {
      return res.status(404).json({ success: false, message: "Không tìm thấy yêu cầu thay đổi." });
    }

    const schedule = await Schedule.findById(changeRequest.scheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Không tìm thấy lịch học." });
    }
    if (schedule.tutorId.toString() !== tutor._id.toString()) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền từ chối yêu cầu này." });
    }

    changeRequest.status = "rejected";
    await changeRequest.save();

    res.status(200).json({
      success: true,
      message: "❌ Đã từ chối yêu cầu thay đổi lịch.",
      changeRequest,
    });
  } catch (error) {
    console.error("Lỗi khi từ chối yêu cầu thay đổi:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi xử lý yêu cầu thay đổi.",
      error: error.message,
    });
  }
};

exports.getChangeRequestsByTutor = async (req, res) => {
  try {
    const userId = req.user.id;

    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thông tin gia sư." });
    }

    const schedules = await Schedule.find({ tutorId: tutor._id }).select("_id");
    const scheduleIds = schedules.map((s) => s._id);

    const changeRequests = await ChangeRequest.find({ scheduleId: { $in: scheduleIds } })
      .populate({
        path: "scheduleId",
        populate: [
          { path: "learnerId", select: "username email" },
          { path: "tutorId", select: "username" },
        ],
      })
      .populate("learnerId", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: changeRequests.length,
      changeRequests,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách yêu cầu thay đổi:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy danh sách yêu cầu thay đổi.",
      error: error.message,
    });
  }
};