const Assignment = require("../../modal/Assignment");
const AssignmentSubmission = require("../../modal/AssignmentSubmission");
const Subject = require("../../modal/Subject");
const Tutor = require("../../modal/Tutor");
const User = require("../../modal/User");
const Booking = require("../../modal/Booking");

const createAssignment = async (req, res) => {
  try {
    const {
      subjectId,
      tutorId,
      learnerId,
      bookingId,
      title,
      description,
      fileUrl,
      deadline,
    } = req.body;

    if (
      !subjectId ||
      !tutorId ||
      !learnerId ||
      !bookingId ||
      !title ||
      !deadline
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const subject = await Subject.findById(subjectId);
    const tutor = await Tutor.findById(tutorId);
    const learner = await User.findById(learnerId);
    const booking = await Booking.findById(bookingId);

    if (!subject || !tutor || !learner || !booking) {
      return res.status(404).json({ error: "Not found" });
    }

    const newAssignment = new Assignment({
      subjectId,
      tutorId,
      learnerId,
      bookingId,
      title,
      description,
      fileUrl,
      deadline,
    });
    await newAssignment.save();
    res.status(201).json(newAssignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const viewAssignment = async (req, res) => {
  try {
    const assignments = await Assignment.find();
    res.status(200).json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const submitAssignment = async (req, res) => {
  try {
    const {
      assignment,
      learnerId,
      fileUrl,
      submittedAt = Date.now(),
    } = req.body;

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

const viewSubmission = async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find();
    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
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

    const newGradeSubmission = new AssignmentSubmission({
      assignment,
      learnerId,
      grade,
      feedback,
      aiFeedback,
    });
    await newGradeSubmission.save();
    res.status(200).json(newGradeSubmission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const viewGradeFeedback = async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find();
    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
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
