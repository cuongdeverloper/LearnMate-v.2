const Tutor = require('../../modal/Tutor');
const User = require('../../modal/User');
const SavedTutor = require('../../modal/SavedTutor');

// 🔍 Lấy danh sách tutor có filter
exports.getTutors = async (req, res) => {
  try {
    const { name, subject, subjects, minPrice, maxPrice, minRating, class: classGrade } = req.query;

    let filter = {};
    let userFilter = {};

    // Lọc theo tên tutor (User)
    if (name) {
      userFilter.username = { $regex: name, $options: 'i' };
    }

    // ✅ Lọc theo nhiều môn học
    if (subjects) {
      const subjectList = decodeURIComponent(subjects).split(',').map(s => s.trim());
      filter.subjects = { $in: subjectList };
    } else if (subject) {
      // Lọc theo 1 môn học duy nhất
      filter.subjects = { $regex: subject, $options: 'i' };
    }

    // Lọc theo class (lớp)
    if (classGrade) {
      filter.classes = Number(classGrade);
    }

    // Lọc theo khoảng giá
    if (minPrice || maxPrice) {
      filter.pricePerHour = {};
      if (minPrice) filter.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerHour.$lte = Number(maxPrice);
    }

    // Lọc theo rating
    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    // Truy vấn
    let tutors = await Tutor.find(filter).populate({
      path: 'user',
      match: userFilter,
      select: 'username email image phoneNumber gender',
    });

    // Bỏ tutor không có user match
    tutors = tutors.filter(tutor => tutor.user !== null);

    res.json({ success: true, tutors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getTutorById = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id)
      .populate('user', 'username email image phoneNumber gender')
      .select('subjects classes pricePerHour description rating'); // Lấy thêm các trường quan trọng

    if (!tutor) return res.status(404).json({ success: false, message: 'Tutor not found' });

    res.json({ success: true, tutor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSavedTutors = async (req, res) => {
  try {
    // req.user.id sẽ đến từ middleware xác thực (ví dụ: từ token JWT)
    const savedTutors = await SavedTutor.find({ user: req.user.id })
    .populate({
      path: 'tutor',
      populate: {
        path: 'user',
        select: 'username image' // 👈 Chọn trường cần thiết
      }
    });

    // Trả về danh sách các đối tượng Tutor đã được populate
    res.status(200).json(savedTutors.map(item => item.tutor));
  } catch (error) {
    console.error('Lỗi khi lấy danh sách gia sư đã lưu:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};


exports.addSavedTutor = async (req, res) => {
  const { tutorId } = req.params;
  const userId = req.user.id; // Lấy ID người dùng từ token

  try {
    // Kiểm tra xem gia sư có tồn tại không
    const tutorExists = await Tutor.findById(tutorId);
    if (!tutorExists) {
      return res.status(404).json({ message: 'Gia sư không tồn tại.' });
    }

    // Kiểm tra xem đã lưu gia sư này chưa
    const existingSave = await SavedTutor.findOne({ user: userId, tutor: tutorId });
    if (existingSave) {
      return res.status(400).json({ message: 'Gia sư đã có trong danh sách lưu của bạn.' });
    }

    // Tạo một bản ghi SavedTutor mới
    const newSavedTutor = new SavedTutor({
      user: userId,
      tutor: tutorId,
    });

    await newSavedTutor.save();

    // Có thể trả về toàn bộ danh sách đã lưu được cập nhật
    const updatedSavedTutors = await SavedTutor.find({ user: userId }).populate('tutor');
    res.status(201).json({
      message: 'Gia sư đã được thêm vào danh sách.',
      savedTutors: updatedSavedTutors.map(item => item.tutor),
    });
  } catch (error) {
    console.error('Lỗi khi thêm gia sư vào danh sách:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};


exports.removeSavedTutor = async (req, res) => {
  const { tutorId } = req.params;
  const userId = req.user.id; // Lấy ID người dùng từ token

  try {
    const result = await SavedTutor.deleteOne({ user: userId, tutor: tutorId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Gia sư không có trong danh sách lưu của bạn.' });
    }

    // Trả về danh sách đã lưu sau khi xóa
    const updatedSavedTutors = await SavedTutor.find({ user: userId }).populate('tutor');
    res.status(200).json({
      message: 'Gia sư đã được xóa khỏi danh sách.',
      savedTutors: updatedSavedTutors.map(item => item.tutor),
    });
  } catch (error) {
    console.error('Lỗi khi xóa gia sư khỏi danh sách:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};
// GET /api/tutors/by-subjects?subjects=Toán,Lý,Hóa


exports.getActiveStatus = async (req, res) => {
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
exports.updateActiveStatus = async (req, res) => {
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

