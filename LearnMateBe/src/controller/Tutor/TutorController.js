const Booking = require("../../modal/Booking");
const Schedule = require("../../modal/Schedule");
const Material = require("../../modal/Material");
const Progress = require("../../modal/Progress");
const TutorAvailability = require("../../modal/TutorAvailability");
const Tutor = require ("../../modal/Tutor")
const User = require ("../../modal/User")

const respondBooking = async (req, res) => {

  const { bookingId, action, learnerId } = req.body;
  if (!["approve", "rejected", "cancelled"].includes(action))
    return res.status(400).json({ message: "Invalid action" });

  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  try {
    const { bookingId, action, learnerId } = req.body;

    // Validate action
    const validActions = ['approve', 'rejected', 'cancelled'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }


    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update learnerId if provided
    if (learnerId !== undefined) {
      booking.learnerId = learnerId;
    }

    // Update status
    booking.status = action;
    await booking.save();

    // Custom message
    let responseMessage = '';
    switch (action) {
      case 'approve':
        responseMessage = 'Booking has been approved successfully ✅';
        break;
      case 'rejected':
        responseMessage = 'Booking has been rejected ❌';
        break;
      case 'cancelled':
        responseMessage = 'Booking has been cancelled 🛑';
        break;
    }

    return res.status(200).json({ message: responseMessage, booking });
  } catch (error) {
    console.error('Error responding booking:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const cancelBooking = async (req, res) => {

  const { bookingId, reason } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  if (new Date(booking.startTime) < Date.now()) {
    return res.status(400).json({ message: "Too late to cancel" });
  }

  // Ensure learnerId exists before saving
  if (!booking.learnerId) {
    return res
      .status(400)
      .json({ message: "learnerId is required to cancel booking" });
  }

  booking.status = "cancelled";
  booking.cancellationReason = reason;
  await booking.save();

  res.status(200).json({ message: "Booking cancelled" });

  try {
    const { bookingId, reason } = req.body;

    // Validate request
    if (!bookingId) {
      return res.status(400).json({ message: 'bookingId is required' });
    }
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: 'Cancellation reason is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Prevent cancelling past bookings
    if (new Date(booking.startTime) < Date.now()) {
      return res.status(400).json({ message: 'Too late to cancel this booking' });
    }

    // Must have learner assigned
    if (!booking.learnerId) {
      return res.status(400).json({ message: 'LearnerId is required to cancel booking' });
    }

    // Update booking
    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    await booking.save();

    return res.status(200).json({
      message: `Booking has been cancelled 🛑`,
      booking,
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }

};

const getPendingBookings = async (req, res) => {
  try {
    const tutorUserId = req.params.tutorId;
    // const tutor = await Tutor.findOne({ user: tutorUserId });
    // console.log(tutor)

    // if (!tutor) {
    //   return res.status(404).json({ message: 'Tutor not found' });
    // }
    const user = await User.findById(tutorUserId);
    const tutor = await Tutor.findOne({ user: user._id });
    const IdTutor = tutor._id;
    const bookings = await Booking.find({
      tutorId: IdTutor,
      status: "pending",
    }).populate("learnerId", "username email");

    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching pending bookings:", err);
    res.status(500).json({ error: err.message });
  }
};


// Create schedule
const createSchedule = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // B1: Kiểm tra booking tồn tại
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // B2: Đếm số buổi đã tạo trong Schedule
    const existingSessions = await Schedule.countDocuments({ bookingId });

    // B3: So sánh với số buổi đã đặt
    if (existingSessions >= booking.numberOfSessions) {
      return res
        .status(400)
        .json({
          message: "Number of scheduled sessions exceeds booking limit",
        });
    }

    // B4: Tạo buổi học mới
    const slot = new Schedule(req.body);
    await slot.save();

    // B5: Lưu lại ID buổi học vào booking.scheduleIds (optional, nếu dùng field này)
    booking.scheduleIds.push(slot._id);
    await booking.save();

    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSchedule = async (req, res) => {
  try {
    const tutorUserId = req.params.tutorId;
    const schedule = await Schedule.find({ tutorId: tutorUserId }).populate(
      "learnerId",
      "username email"
    );
    res.status(200).json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const updated = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete schedule
const deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update progress
const updateProgress = async (req, res) => {
  try {
    const progress = new Progress(req.body);
    await progress.save();
    res.status(201).json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get progress by student
const getProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ studentId: req.params.studentId });
    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const uploadMaterial = async (req, res) => {
  try {
    const { bookingId, title, description, fileType, subjectId, tutorId, learnerId } = req.body;
    const fileUrl = req.file?.path || req.file?.secure_url;

    // ✅ Kiểm tra các field bắt buộc
    if (!bookingId || !title || !fileUrl) {
      return res.status(400).json({
        errorCode: 1,
        message: "bookingId, title và fileUrl là bắt buộc.",
      });
    }

    let finalSubjectId = subjectId;
    let finalTutorId = tutorId;
    let finalLearnerId = learnerId;

    // ✅ Nếu không truyền subjectId, tự lấy từ booking (nếu có)
    if (!finalSubjectId) {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        finalSubjectId = booking.subjectId;
        finalTutorId = finalTutorId || booking.tutorId;
        finalLearnerId = finalLearnerId || booking.learnerId;
      }
    }

    // ✅ Kiểm tra lại subjectId cuối cùng
    if (!finalSubjectId) {
      return res.status(400).json({
        errorCode: 1,
        message: "subjectId is required (hoặc không tìm thấy trong booking).",
      });
    }

    // ✅ Tạo document mới
    const newMaterial = new Material({
      subjectId: finalSubjectId,
      tutorId: finalTutorId,
      learnerId: finalLearnerId,
      title,
      description,
      fileType: fileType || "other",
      fileUrl,
    });

    await newMaterial.save();

    return res.status(201).json({
      errorCode: 0,
      message: "Material uploaded successfully",
      material: newMaterial,
    });
  } catch (error) {
    console.error("Save Material Error:", error);
    return res.status(500).json({
      errorCode: 1,
      message: "Error saving material",
      error: error.message,
    });
  }
};

// Get materials by booking
const getMaterials = async (req, res) => {
  try {
    const list = await Material.find({ bookingId: req.params.bookingId });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createAvailability = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { slots } = req.body;

    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin gia sư cho tài khoản này.",
      });
    }

    const tutorId = tutor._id;

    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có slot nào để tạo.",
      });
    }

    const formattedSlots = slots.map((s) => ({
      tutorId,
      date: new Date(`${s.date}T00:00:00.000Z`), 
      startTime: s.startTime,
      endTime: s.endTime,
    }));

    const dates = formattedSlots.map((s) => s.date);

    const existing = await TutorAvailability.find({
      tutorId,
      date: { $in: dates },
    });

    for (const slot of formattedSlots) {
      const duplicate = existing.find(
        (e) =>
          e.startTime === slot.startTime &&
          e.endTime === slot.endTime &&
          e.date.toISOString().split("T")[0] ===
            slot.date.toISOString().split("T")[0]
      );

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Đã có khung giờ ${slot.startTime} - ${slot.endTime} ngày ${slot.date.toLocaleDateString("vi-VN")}`,
        });
      }
    }

    // Không trùng → thêm mới
    const created = await TutorAvailability.insertMany(formattedSlots);

    res.json({
      success: true,
      message: "Tạo lịch trống thành công.",
      data: created,
    });
  } catch (err) {
    console.error("Error creating availability:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


const deleteAvailability = async (req, res) => {
  try {
    const { availabilityId } = req.params;
    const userId = req.user.id; 

    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin gia sư."
      });
    }

    const slot = await TutorAvailability.findOne({
      _id: availabilityId,
      tutorId: tutor._id
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy slot này hoặc không thuộc về bạn."
      });
    }

    if (slot.isBooked) {
      return res.status(400).json({
        success: false,
        message: "Slot này đã được học viên đặt, không thể xoá."
      });
    }

    // 🔹 Xóa slot
    await slot.deleteOne();

    res.json({
      success: true,
      message: "Đã xoá slot thành công."
    });
  } catch (err) {
    console.error("Error deleting availability:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


const getTutorAvailability = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { weekStart } = req.query;

    let query = { tutorId, isBooked: false };

    if (weekStart) {
      const start = new Date(weekStart);
      const end = new Date(start);
      end.setDate(start.getDate() + 7); // lấy trọn tuần

      query.date = { $gte: start, $lt: end };
    }

    const availabilities = await TutorAvailability.find(query);
    // ❌ bỏ populate("subjectId") vì schema không có
    res.json({ success: true, data: availabilities });
  } catch (err) {
    console.error("Error fetching availability:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
const getActiveStatus = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }
    return res.status(200).json({ active: tutor.active });
  } catch (error) {
    console.error('Error getting tutor active status:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * PUT /api/tutor/active-status
 * Cập nhật trạng thái hoạt động của tutor
 */
const updateActiveStatus = async (req, res) => {
  const { active } = req.body;

  if (typeof active !== 'boolean') {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const tutor = await Tutor.findOneAndUpdate(
      { user: req.user.id },
      { active },
      { new: true }
    );

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    return res.status(200).json({ success: true, active: tutor.active });
  } catch (error) {
    console.error('Error updating tutor active status:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  respondBooking,
  cancelBooking,
  getPendingBookings,
  createSchedule,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  updateProgress,
  getProgress,
  uploadMaterial,
  getMaterials,getTutorAvailability,updateActiveStatus,getActiveStatus,
  createAvailability,deleteAvailability
};
