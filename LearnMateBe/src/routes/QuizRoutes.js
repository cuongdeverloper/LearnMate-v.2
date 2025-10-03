const express = require("express");
const multer = require("multer");

const {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  importQuestions,
  updateQuizById,
  deleteQuizById,
} = require("../controller/Quiz/QuizController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getAllQuizzes);
router.get("/:id", getQuizById);
router.post("/", createQuiz);
router.put("/:id", updateQuizById);
router.delete("/:id", deleteQuizById);

router.post("/:id/import", upload.single("file"), importQuestions);

module.exports = router;
