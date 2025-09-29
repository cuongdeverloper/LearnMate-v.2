const Booking = require('../../modal/Booking');
const Schedule = require('../../modal/Schedule');
const Material = require('../../modal/Material');
const Progress = require('../../modal/Progress');
const Tutor = require('../../modal/Tutor');
const uploadCloud = require('../../config/cloudinaryConfig');
const uploadDocs = require('../../config/cloudinaryDocxConfig');

const respondBooking = async (req, res) => {
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

    const bookings = await Booking.find({
      tutorId: tutorUserId,
      status: 'pending'
    }).populate('learnerId', 'username email');

    res.status(200).json(bookings);
  } catch (err) {
    console.error('Error fetching pending bookings:', err);
    res.status(500).json({ error: err.message });
  }
};



// Create schedule
const createSchedule = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // B1: Kiểm tra booking tồn tại
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // B2: Đếm số buổi đã tạo trong Schedule
    const existingSessions = await Schedule.countDocuments({ bookingId });

    // B3: So sánh với số buổi đã đặt
    if (existingSessions >= booking.numberOfSessions) {
      return res.status(400).json({ message: 'Number of scheduled sessions exceeds booking limit' });
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
    const schedule = await Schedule.find({ tutorId: tutorUserId })
      .populate('learnerId', 'username email'); 
    res.status(200).json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const updated = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete schedule
const deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Deleted' });
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


// Upload material
const uploadMaterial = async (req, res) => {
  try {
    const { bookingId, title, description, fileType } = req.body;
    const fileUrl = req.file?.path || req.file?.secure_url;

    if (!bookingId || !title || !fileUrl) {
      return res.status(400).json({
        errorCode: 1,
        message: 'bookingId, title and file are required.'
      });
    }

    const newMaterial = new Material({
      bookingId,
      title,
      description,
      fileType: fileType || 'other',
      fileUrl
    });

    await newMaterial.save();
    res.status(201).json({
      errorCode: 0, // ✅ success
      message: 'Material uploaded successfully',
      material: newMaterial
    });
  } catch (error) {
    console.error('Save Material Error:', error);
    res.status(500).json({
      errorCode: 1, // ❌ error
      message: 'Error saving material',
      error: error.message
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
  getMaterials,
};
