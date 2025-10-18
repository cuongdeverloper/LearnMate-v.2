const express = require("express");
const router = express.Router();

const { checkAccessToken} = require('../middleware/JWTAction');
const uploadDocs = require("../config/cloudinaryDocxConfig"); 

const {
  createAssignment,
  viewAssignment,
  submitAssignment,
  viewSubmission,
  gradeAssignment,
  viewGradeFeedback,
  deleteAssignment,
} = require("../controller/Assignment/AssignmentController");

/**
 * 🧩 Tutor tạo assignment (upload file Word/PDF)
 * - Middleware checkAccessToken để lấy userId của tutor
 * - uploadDocs.single("file") để upload file
 */
router.post(
  "/create",
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
  createAssignment
);

/**
 * 🧩 Lấy danh sách tất cả assignment
 */
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
