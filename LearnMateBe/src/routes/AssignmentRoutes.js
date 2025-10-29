const express = require("express");
const router = express.Router();

const { checkAccessToken } = require("../middleware/JWTAction");
const uploadDocs = require("../config/cloudinaryDocxConfig");

const {
  viewAssignment,
  submitAssignment,
  viewSubmission,
  gradeAssignment,
  viewGradeFeedback,
  deleteAssignment,
  createAssignmentStorage,
  getAssignmentStorage,
  deleteAssignmentStorage,
  assignAssignmentFromStorage,
  getAssignmentById,
  getAssignmentsForCourse,
} = require("../controller/assignment/assignmentController");

router.post(
  "/storage/create",
  checkAccessToken,
  uploadDocs.single("file"),
  createAssignmentStorage
);
router.get("/storage", checkAccessToken, getAssignmentStorage);
router.delete("/storage/:id", checkAccessToken, deleteAssignmentStorage);

// Assign route
router.post("/assign", checkAccessToken, assignAssignmentFromStorage);

router.get("/", checkAccessToken, viewAssignment);

/**
 * 🧩 Tutor xem danh sách bài nộp
 */
router.get("/submissions", checkAccessToken, viewSubmission);

/**
 * 🧩 Tutor chấm điểm assignment
 */
router.post("/grade", checkAccessToken, gradeAssignment);

/**
 * 🧩 Xóa assignment
 */
router.delete("/:id", checkAccessToken, deleteAssignment);

router.get("/:id", checkAccessToken, getAssignmentById);
router.get("/course/:courseId", checkAccessToken, getAssignmentsForCourse);

// ------------------------ LEARNER ------------------------

router.post(
  "/submit",
  checkAccessToken,
  uploadDocs.single("file"),
  submitAssignment
);

router.get("/:id/feedbacks", checkAccessToken, viewGradeFeedback);

module.exports = router;
