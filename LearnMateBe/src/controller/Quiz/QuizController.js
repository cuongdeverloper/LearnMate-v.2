const XLSX = require("xlsx");

const Quiz = require("../../modal/Quiz");
const Subject = require("../../modal/Subject");
const Tutor = require("../../modal/Tutor");
const Question = require("../../modal/Question");
const Result = require("../../modal/Result");

const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("subject").populate("tutor");
    res.json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách quiz",
      error: error.message,
    });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("subject")
      .populate("tutor");
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }
    const questions = await Question.find({ quiz: req.params.id });

    res.json({ success: true, ...quiz.toObject(), questions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy quiz",
      error: error.message,
    });
  }
};

const createQuiz = async (req, res) => {
  try {
    const { subjectId, tutorId, title } = req.body;
    const subject = await Subject.findById(subjectId);
    const tutor = await Tutor.findById(tutorId);
    if (!subject || !tutor) {
      return res
        .status(404)
        .json({ success: false, message: "Subject or Tutor not found" });
    }
    const quiz = new Quiz({ subjectId, tutorId, title });
    await quiz.save();
    res.status(201).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo quiz",
      error: error.message,
    });
  }
};

const updateQuizById = async (req, res) => {
  try {
    const { title } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }
    quiz.title = title;
    await quiz.save();
    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }
    await quiz.remove();
    await Result.deleteMany({ quiz: req.params.id });
    await Question.deleteMany({ quiz: req.params.id });
    res.json({ success: true, message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const importQuestions = async (req, res) => {
  try {
    const { id: quizId } = req.params;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const questions = rows.map((row) => ({
      quiz: quizId,
      text: row.questionText,
      options: [row.optionA, row.optionB, row.optionC, row.optionD],
      correctAnswer:
        row.correctAnswer === "A"
          ? 0
          : row.correctAnswer === "B"
          ? 1
          : row.correctAnswer === "C"
          ? 2
          : 3,
    }));

    await Question.insertMany(questions);

    res.json({
      success: true,
      message: "Questions imported successfully",
      count: questions.length,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Import thất bại",
        error: error.message,
      });
  }
};

module.exports = {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuizById,
  deleteQuizById,
  importQuestions,
};
