// routes/quizRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { checkAccessToken } = require("../middleware/JWTAction");

const {
  getAllQuizzes,
  getQuizById,
  getQuizzesByBookingId,
  getQuestionsByQuizId,
  updateQuestion,
  deleteQuestion,
  getAllQuizzesByLearnerId,
  submitQuiz,
  createQuizFromStorage,
  importQuestionsToStorage,
  getQuizStorage,
  getQuestionStorage,
  addQuestionsFromStorageToQuiz,
  createQuizStorage,
} = require("../controller/Quiz/QuizController");

// =========================
// 📘 QUIZ ROUTES
// =========================
router.get("/", checkAccessToken, getAllQuizzes);
router.get("/getdetailquiz/:id", checkAccessToken, getQuizById);
router.post("/", checkAccessToken, createQuizFromStorage);
router.get("/my-quizzes", checkAccessToken, getQuizStorage);
router.get("/booking/:bookingId", checkAccessToken, getQuizzesByBookingId);

router.get("/learner/all-quizzes", checkAccessToken, getAllQuizzesByLearnerId);

// =========================
// 📤 IMPORT & QUESTIONS
// =========================
router.post(
  "/import-question-storage",
  checkAccessToken,
  upload.single("file"),
  importQuestionsToStorage
);

router.get("/question/quiz/:quizId", checkAccessToken, getQuestionsByQuizId);
router.get("/my-question-storage", checkAccessToken, getQuestionStorage);
router.put("/question/:questionId", checkAccessToken, updateQuestion);
router.delete("/question/:questionId", checkAccessToken, deleteQuestion);
router.post("/:quizId/submit", checkAccessToken, submitQuiz);
router.post(
  "/add-questions-to-quiz",
  checkAccessToken,
  addQuestionsFromStorageToQuiz
);
router.post("/quiz-storage/create", checkAccessToken, createQuizStorage);
module.exports = router;
