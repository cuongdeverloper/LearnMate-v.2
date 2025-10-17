// routes/quizRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { checkAccessToken } = require("../middleware/JWTAction");

const {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  importQuestions,
  getQuizzesByTutorId,
  getQuizzesByBookingId,
  getQuestionsByQuizId,
  updateQuestion,
  deleteQuestion,
} = require("../controller/Quiz/QuizController");

// =========================
// 📘 QUIZ ROUTES
// =========================
router.get("/", checkAccessToken, getAllQuizzes);
router.get("/getdetailquiz/:id", checkAccessToken, getQuizById);
router.post("/", checkAccessToken, createQuiz);
router.get("/my-quizzes", checkAccessToken, getQuizzesByTutorId);
router.get("/booking/:bookingId", checkAccessToken, getQuizzesByBookingId);

// =========================
// 📤 IMPORT & QUESTIONS
// =========================
router.post("/:quizId/:bookingId/import", checkAccessToken, upload.single("file"), importQuestions);
router.get("/question/quiz/:quizId", checkAccessToken, getQuestionsByQuizId);
router.put("/question/:questionId", checkAccessToken, updateQuestion);
router.delete("/question/:questionId", checkAccessToken, deleteQuestion);

module.exports = router;
