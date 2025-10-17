const express = require("express");
const multer = require("multer");

const {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  importQuestions,
  getQuizzesByTutorId,
  getQuestionsByQuizId,
  updateQuestion,
  deleteQuestion
} = require("../controller/Quiz/QuizController");
const { checkAccessToken } = require("../middleware/JWTAction");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/",checkAccessToken,getAllQuizzes);
router.get("/getdetailquiz/:id",checkAccessToken, getQuizById);
router.post("/",checkAccessToken ,createQuiz);
router.get("/my-quizzes", checkAccessToken, getQuizzesByTutorId);

router.post("/:id/import", checkAccessToken,upload.single("file"), importQuestions);
router.get("/question/quiz/:quizId", checkAccessToken, getQuestionsByQuizId);
router.put("/question/:questionId", checkAccessToken, updateQuestion);
router.delete("/question/:questionId", checkAccessToken, deleteQuestion);

module.exports = router;
