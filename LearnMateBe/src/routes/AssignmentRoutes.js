const express = require("express");
const router = express.Router();

const { checkAccessToken} = require('../middleware/JWTAction');
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
} = require("../controller/Assignment/AssignmentController");


router.post("/storage/create", checkAccessToken, uploadDocs.single("file"), createAssignmentStorage);
router.get("/storage", checkAccessToken, getAssignmentStorage);
router.delete("/storage/:id", checkAccessToken, deleteAssignmentStorage);

// Assign route
router.post("/assign", checkAccessToken, assignAssignmentFromStorage);

router.get("/", checkAccessToken, viewAssignment);

/**
 * 🧩 Học viên nộp bài assignment
 */
router.post(
  "/submit",
  checkAccessToken,
  uploadDocs.single("file"),
  async (req, res, next) => {
    try {
      if (req.file && req.file.path) {
        req.body.fileUrl = req.file.path;
      }
      next();
    } catch (err) {
      console.error("❌ File upload failed:", err);
      res.status(400).json({ error: "File upload failed", details: err.message });
    }
  },
  submitAssignment
);

/**
 * 🧩 Tutor xem danh sách bài nộp
 */
router.get("/submissions", checkAccessToken, viewSubmission);

/**
 * 🧩 Tutor chấm điểm assignment
 */
router.post("/grade", checkAccessToken, gradeAssignment);

/**
 * 🧩 Học viên xem feedback điểm
 */
router.get("/feedbacks", checkAccessToken, viewGradeFeedback);

/**
 * 🧩 Xóa assignment
 */
router.delete("/:id", checkAccessToken, deleteAssignment);

module.exports = router;
