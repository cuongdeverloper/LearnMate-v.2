const express = require("express");
const {
  createAssignment,
  viewAssignment,
  submitAssignment,
  viewSubmission,
  gradeAssignment,
  viewGradeFeedback,
  deleteAssignment,
} = require("../controller/Assignment/AssignmentController");

const router = express.Router();

router.post("", createAssignment);
router.get("", viewAssignment);
router.post("/submit", submitAssignment);
router.get("/submission", viewSubmission);
router.put("/grade", gradeAssignment);
router.get("/feedback", viewGradeFeedback);
router.delete("/:id", deleteAssignment);

module.exports = router;
