const Assignment = require("../../modal/Assignment");
const Tutor = require("../../modal/Tutor");
const User = require("../../modal/User");
const Booking = require("../../modal/Booking");
const AssignmentStorage = require("../../modal/AssignmentStorage");

const createAssignmentStorage = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tutor" });

    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Không có file được upload" });

    const { title, description, subjectId } = req.body;
    if (!title || !subjectId)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin cần thiết" });

    const newStorage = await AssignmentStorage.create({
      tutorId: tutor._id,
      subjectId,
      title,
      description,
      fileUrl: req.file.path, // URL từ Cloudinary
    });

    res.status(200).json({
      success: true,
      message: "Tạo Assignment Storage thành công",
      data: newStorage,
    });
  } catch (error) {
    console.error("CreateAssignmentStorage Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const getAssignmentStorage = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tutor" });

    const storages = await AssignmentStorage.find({
      tutorId: tutor._id,
    }).populate("subjectId", "name");

    res.status(200).json({ success: true, data: storages });
  } catch (error) {
    console.error("GetAssignmentStorage Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const assignAssignmentFromStorage = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tutor" });

    const { assignmentStorageId, bookingId, deadline, title, description } =
      req.body;
    if (!assignmentStorageId || !bookingId || !deadline || !title)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu dữ liệu assign" });

    const booking = await Booking.findById(bookingId)
      .populate("learnerId", "_id")
      .populate("subjectId", "_id");

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy booking" });

    const storage = await AssignmentStorage.findById(assignmentStorageId);
    if (!storage)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy Assignment Storage" });

    const newAssignment = await Assignment.create({
      assignmentStorageId,
      tutorId: tutor._id,
      learnerId: booking.learnerId._id,
      subjectId: booking.subjectId._id,
      bookingId,
      title, // 🆕 sử dụng title do tutor nhập
      description, // 🆕 sử dụng description do tutor nhập
      fileUrl: storage.fileUrl, // vẫn reuse file
      deadline,
    });

    res.status(200).json({
      success: true,
      message: "Assign bài tập thành công",
      data: newAssignment,
    });
  } catch (error) {
    console.error("AssignAssignmentFromStorage Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
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
    const { assignmentId, note } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const learner = await User.findById(req.user.id);
    if (!learner) {
      return res.status(404).json({ error: "Learner not found" });
    }

    const submittedAt = new Date();
    const fileUrl = req.file ? req.file.path : null;

    const newSubmission = new AssignmentSubmission({
      assignment: assignment._id,
      learnerId: learner._id,
      note,
      fileUrl,
      submittedAt,
    });

    await newSubmission.save();
    res.status(201).json(newSubmission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAssignmentStorage = async (req, res) => {
  try {
    const { id } = req.params;
    await AssignmentStorage.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Đã xóa Assignment Storage" });
  } catch (error) {
    console.error("DeleteAssignmentStorage Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
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
    const submissions = await AssignmentSubmission.find({
      grade: { $exists: true },
    })
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

const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    res.status(200).json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAssignmentsForCourse = async (req, res) => {
  try {
    let assignments = await Assignment.find({
      bookingId: req.params.courseId,
    });

    const assignmentsWithSubmission = await Promise.all(
      assignments.map(async (a) => {
        const submission = await AssignmentSubmission.findOne({
          assignment: a._id,
          learnerId: req.user.id,
        });
        const assignmentObj = a.toObject();
        if (submission) {
          assignmentObj.submitted = true;
          assignmentObj.grade = submission.grade;
          assignmentObj.feedback = submission.feedback;
          assignmentObj.submittedDate = submission.submittedAt;
        } else {
          assignmentObj.submitted = false;
        }
        return assignmentObj;
      })
    );

    res.status(200).json(assignmentsWithSubmission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  viewAssignment,
  submitAssignment,
  viewSubmission,
  gradeAssignment,
  viewGradeFeedback,
  deleteAssignment,
  createAssignmentStorage,
  getAssignmentStorage,
  assignAssignmentFromStorage,
  deleteAssignmentStorage,
  getAssignmentById,
  getAssignmentsForCourse,
};
