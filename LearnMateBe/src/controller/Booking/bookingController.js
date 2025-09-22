const Booking = require('../../modal/Booking');
const User = require('../../modal/User'); // giả sử đây là model user
const Schedule = require('../../modal/Schedule'); 
const FinancialHistory = require('../../modal/FinancialHistory');

exports.getBookingById = async (req, res) => {
  try {
      const { id } = req.params;

      if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
          return res.status(400).json({ message: 'Invalid booking ID format.' });
      }

      const booking = await Booking.findById(id);

      if (!booking) {
          return res.status(404).json({ message: 'Booking not found.' });
      }
      res.json(booking);
  } catch (error) {
      console.error("Error fetching booking by ID:", error);
      res.status(500).json({ message: 'Server error fetching booking details.' });
  }
};
exports.createBooking = async (req, res) => {
  try {
    const { tutorId } = req.params;
    // Destructure note from req.body
    const { amount, numberOfSessions, note } = req.body; 

    if (!tutorId || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields: tutorId or amount' });
    }

    // Kiểm tra user login
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: user not logged in' });
    }

    // Lấy user từ DB
    const user = await User.findById(req.user.id || req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Kiểm tra balance đủ không
    if (user.balance < amount) {
      return res.status(400).json({ success: false, message: 'Số dư tài khoản không đủ để đặt lịch' });
    }

    // Trừ tiền balance
    user.balance -= amount;
    await user.save();
    await FinancialHistory.create({
      userId: user._id,
      amount: amount,
      balanceChange: -amount,
      type: 'spend', // ✅ Sửa từ 'Thanh toán Booking' thành 'spend'
      status: 'pending',
      description: `Thanh toán cho booking với gia sư ${tutorId.toString().slice(-6)}`,
      date: new Date()
    });
    
    // Tạo booking với trạng thái pending và bao gồm note
    const booking = await Booking.create({
      learnerId: req.user.id || req.user._id,
      tutorId,
      amount,
      numberOfSessions: numberOfSessions || 0,
      status: 'pending',
      note, // Include the note here
    });

    res.status(201).json({ success: true, bookingId: booking._id });
  } catch (error) {
    console.error('Error creating booking:', error);
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
          select: "username email image"
        }
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
      return res.status(401).json({ message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để xem các khóa học đã duyệt.' });
    }
    const learnerId = req.user.id || req.user._id;

    const bookings = await Booking.find({
      learnerId,
      status: 'approve'
    })
    .populate({
      path: 'tutorId', 
      select: 'user', 
      populate: {
        path: 'user', 
        select: 'username' 
      }
    })
    .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Lỗi khi lấy các khóa học đã duyệt:", err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi tải danh sách khóa học của bạn. Vui lòng thử lại sau.' });
  }
};
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id || req.user._id; // Lấy ID người dùng từ token

    // Tìm booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Đảm bảo người dùng hiện tại là người tạo booking này
    if (booking.learnerId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You can only cancel your own bookings.' });
    }

    // Chỉ cho phép hủy các booking có trạng thái 'pending'
    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending bookings can be cancelled.' });
    }

    // Cập nhật trạng thái booking thành 'cancelled'
    booking.status = 'cancelled';
    await booking.save();

    // Hoàn tiền cho người dùng
    const user = await User.findById(userId);
    if (!user) {
      // Đây là một trường hợp lỗi hiếm gặp nếu người dùng không tồn tại sau khi tìm thấy booking
      console.error(`User with ID ${userId} not found for refund.`);
      return res.status(500).json({ success: false, message: 'Error processing refund: User not found.' });
    }

    user.balance += booking.amount; // Hoàn lại số tiền booking
    await user.save();
    await FinancialHistory.create({
      userId: userId,
      amount: booking.amount,
      balanceChange: booking.amount,
      type: 'earning',
      status: 'success',
      description: `Hoàn tiền sau khi hủy  khóa học (${booking._id.toString().slice(-6)})`,
      date: new Date()
    });

    res.status(200).json({ success: true, message: 'Booking cancelled and refunded successfully.', bookingId: booking._id });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.finishBooking = async (req, res) => {
    try {
      const { bookingId } = req.params;
      const booking = await Booking.findById(bookingId).populate({
        path: 'tutorId',
        populate: { path: 'user' }
      });
      if (!bookingId || !bookingId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid bookingId' });
      }
  if (!booking.tutorId || !booking.tutorId.user) {
    return res.status(500).json({ message: 'Thiếu thông tin người dạy (tutor.user) trong booking' });
  }
  
      console.log("📦 booking chi tiết:", booking);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
  
      if (booking.completed) {
        return res.status(400).json({ message: 'Booking đã hoàn thành trước đó' });
      }
  
      const totalSessions = booking.numberOfSessions;
      const attendedSessions = await Schedule.countDocuments({
        bookingId: bookingId,
        attended: true
      });
  
      // ✅ Kiểm tra chưa học buổi nào
      if (attendedSessions === 0) {
        return res.status(400).json({ message: 'Chưa học buổi nào. Không thể kết thúc khóa học.' });
      }
  
      // ✅ Kiểm tra chưa học đủ số buổi
      if (attendedSessions < totalSessions) {
        return res.status(400).json({ message: 'Chưa hoàn thành đủ buổi học để kết thúc khóa' });
      }
  
      booking.completed = true;
      await booking.save();
  
      const tutorUser = booking.tutorId.user;
      const tutorUserDoc = await User.findById(tutorUser._id);
  
      if (!tutorUserDoc) {
        return res.status(404).json({ message: 'Tutor user not found' });
      }
  
      tutorUserDoc.balance += booking.amount;
      await tutorUserDoc.save();
  
      await FinancialHistory.create({
        userId: tutorUserDoc._id,
        amount: booking.amount,
        balanceChange: booking.amount,
        type: 'earning',
        status: 'success',
        description: `Nhận tiền từ học viên sau khi hoàn tất khóa học (${booking._id.toString().slice(-6)})`,
        date: new Date()
      });
  
      res.json({ message: 'Đã hoàn thành khóa học và cộng tiền cho tutor', balance: tutorUserDoc.balance });
  
    } catch (error) {
      console.error("❌ Error finishing booking:", error.message);
      console.error("📦 Full error object:", error);  // In cả stack trace
      res.status(500).json({ message: 'Lỗi server khi hoàn tất khóa học', error: error.message });
    }
  };
exports.getAllBookingsByTutorId = async (req, res) => {
  try {
    const { tutorId } = req.params;

    if (!tutorId || !tutorId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid tutor ID format.' });
    }

    const bookings = await Booking.find({ tutorId })
      .populate({
        path: 'learnerId',
        select: 'username email image',
      })
      .populate({
        path: 'scheduleIds',
        select: 'date startTime endTime attended',
      })
      .sort({ createdAt: -1 });

    // Tính toán startDate và endDate từ scheduleIds
    const enrichedBookings = bookings.map((booking) => {
      const dates = booking.scheduleIds.map((s) => new Date(s.date));
      const startDate = dates.length > 0 ? new Date(Math.min(...dates)) : null;
      const endDate = dates.length > 0 ? new Date(Math.max(...dates)) : null;

      return {
        ...booking.toObject(),
        startDate,
        endDate,
      };
    });

    res.status(200).json({ success: true, bookings: enrichedBookings });
  } catch (error) {
    console.error("Error fetching bookings by tutor ID:", error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách booking của tutor.' });
  }
};

const Report = require('../../modal/Report');
exports.createReport = async (req, res) => {
  const { targetType, targetId, reason } = req.body;

  if (!targetType || !targetId || !reason) {
    return res.status(400).json({ success: false, message: 'Thiếu dữ liệu báo cáo.' });
  }

  try {
    const report = new Report({
      reporter: req.user.id, // Ensure req.user.id is correctly populated from checkAccessToken
      targetType,
      targetId,
      reason
    });

    await report.save();

    // --- NEW: Update the associated booking's reported status ---
    if (targetType === 'booking') { // Only update if the target is indeed a booking
      await Booking.findByIdAndUpdate(targetId, {
        reported: true,
        reportedAt: new Date() // Set the timestamp
      }, { new: true }); // `new: true` returns the updated document
    }
    // --- END NEW ---

    return res.status(200).json({ success: true, message: 'Báo cáo đã được gửi.' });
  } catch (err) {
    console.error('Error creating report:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tạo báo cáo.' });
  }
};

// Lấy tất cả báo cáo (dành cho Admin)
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'username email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: reports });
  } catch (err) {
    console.error('Error fetching reports:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách báo cáo.' });
  }
};

// Duyệt báo cáo (Admin xử lý)
exports.updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'reviewed', 'dismissed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
  }

  try {
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo.' });

    report.status = status;
    await report.save();

    return res.status(200).json({ success: true, message: 'Cập nhật trạng thái thành công.' });
  } catch (err) {
    console.error('Error updating report:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật báo cáo.' });
  }
}; 
