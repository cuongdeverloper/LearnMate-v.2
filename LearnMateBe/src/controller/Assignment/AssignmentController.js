const Assignment = require("../../modal/Assignment");
const AssignmentSubmission = require("../../modal/AssignmentSubmission");
const Subject = require("../../modal/Subject");
const Tutor = require("../../modal/Tutor");
const User = require("../../modal/User");
const Booking = require("../../modal/Booking");

/**
 * 🧩 Tạo bài tập mới - Tutor tạo
 */
const createAssignment = async (req, res) => {
  try {
    const {
      subjectId,
      learnerId,
      bookingId,
      title,
      description,
      fileUrl,
      deadline,
    } = req.body;

    // ✅ Lấy userId từ token (gắn bởi middleware verifyToken)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // ✅ Tìm tutor tương ứng với user
    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({ error: "Tutor not found for this user" });
    }

    // ✅ Kiểm tra bắt buộc
    if (!subjectId || !learnerId || !bookingId || !title || !deadline) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Kiểm tra các tham chiếu tồn tại
    const subject = await Subject.findById(subjectId);
    const learner = await User.findById(learnerId);
    const booking = await Booking.findById(bookingId);

    if (!subject || !learner || !booking) {
      return res.status(404).json({
        error: "Subject, learner, or booking not found",
      });
    }

    // ✅ Tạo assignment mới
    const newAssignment = new Assignment({
      subjectId,
      tutorId: tutor._id,
      learnerId,
      bookingId,
      title,
      description,
      fileUrl,
      deadline,
    });

    await newAssignment.save();

    res.status(201).json({
      message: "Assignment created successfully",
      assignment: newAssignment,
    });
  } catch (err) {
    console.error("❌ Lỗi khi tạo assignment:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🧩 Lấy tất cả assignment
 */
const viewAssignment = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("subjectId", "name")
      .populate("learnerId", "name email username")
      .populate("tutorId", "user")
      .sort({ createdAt: -1 });
    res.status(200).json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🧩 Học viên nộp bài tập
 */
const submitAssignment = async (req, res) => {
  try {
    const { assignment, learnerId, fileUrl, submittedAt = Date.now() } = req.body;

    if (!assignment || !learnerId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const assignmentObj = await Assignment.findById(assignment);
    if (!assignmentObj) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const learner = await User.findById(learnerId);
    if (!learner) {
      return res.status(404).json({ error: "Learner not found" });
    }

    const newSubmission = new AssignmentSubmission({
      assignment,
      learnerId,
      fileUrl,
      submittedAt,
    });

    await newSubmission.save();
    res.status(201).json(newSubmission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🧩 Xem danh sách bài nộp
 */
const viewSubmission = async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find()
      .populate("assignment")
      .populate("learnerId", "name email");
    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🧩 Chấm điểm bài tập
 */
const gradeAssignment = async (req, res) => {
  try {
    const { assignment, learnerId, grade, feedback, aiFeedback } = req.body;

    if (!assignment || !learnerId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const assignmentObj = await Assignment.findById(assignment);
    if (!assignmentObj) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const learner = await User.findById(learnerId);
    if (!learner) {
      return res.status(404).json({ error: "Learner not found" });
    }

    const graded = await AssignmentSubmission.findOneAndUpdate(
      { assignment, learnerId },
      { grade, feedback, aiFeedback },
      { new: true }
    );

    res.status(200).json(graded);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🧩 Xem feedback chấm điểm
 */
const viewGradeFeedback = async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find({ grade: { $exists: true } })
      .populate("assignment")
      .populate("learnerId", "name");
    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🧩 Xóa bài tập
 */
const deleteAssignment = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createAssignment,
  viewAssignment,
  submitAssignment,
  viewSubmission,
  gradeAssignment,
  viewGradeFeedback,
  deleteAssignment,
};
