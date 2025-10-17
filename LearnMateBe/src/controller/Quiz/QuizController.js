const XLSX = require("xlsx");

const Quiz = require("../../modal/Quiz");
const Subject = require("../../modal/Subject");
const Tutor = require("../../modal/Tutor");
const Question = require("../../modal/Question");
const Result = require("../../modal/Result");

const getAllQuizzes = async (req, res) => {
  try {
    const userId = req.user.id;
    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({ success: false, message: "Tutor not found" });
    }

    const quizzes = await Quiz.find({ tutorId: tutor._id })
      .populate("subject")
      .populate("tutor");

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
    const userId = req.user.id;
    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({ success: false, message: "Tutor not found" });
    }

    const quiz = await Quiz.findOne({ _id: req.params.id, tutorId: tutor._id })
      .populate("subject")
      .populate("tutor");

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    const questions = await Question.find({ quiz: quiz._id });
    res.json({ success: true, quiz: { ...quiz.toObject(), questions } });
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
    const userId = req.user.id;
    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({ success: false, message: "Tutor not found" });
    }

    const { subjectId, title } = req.body;
    const subject = await Subject.findById(subjectId);

    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    const quiz = new Quiz({
      subjectId,
      tutorId: tutor._id,
      title,
    });

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

/**
 * @desc Cập nhật quiz (chỉ tutor sở hữu mới có thể chỉnh sửa)
 */

/**
 * @desc Import câu hỏi từ file Excel (chỉ tutor sở hữu quiz mới import được)
 */
const importQuestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) return res.status(404).json({ success: false, message: "Tutor not found" });

    const quizId = req.params.id;
    const quiz = await Quiz.findOne({ _id: quizId, tutorId: tutor._id });
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    if (!req.file)
      return res.status(400).json({ success: false, message: "No file uploaded" });

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length)
      return res.status(400).json({ success: false, message: "File Excel rỗng hoặc sai định dạng" });

    // Mapping đáp án từ chữ sang index
    const letterToIndex = { A: 0, B: 1, C: 2, D: 3 };

    const questions = rows.map((row) => ({
  quiz: quizId,
  subjectId: quiz.subjectId,
  tutorId: tutor._id,
  text: row["questionText"] || row["Câu hỏi"],  
  options: [
    row["optionA"] || row["A"],
    row["optionB"] || row["B"],
    row["optionC"] || row["C"],
    row["optionD"] || row["D"],
  ],
  correctAnswer: letterToIndex[(row["correctAnswer"] || row["Đáp án"])?.toUpperCase()] ?? 0,
}));

    await Question.insertMany(questions);

    const updatedQuestions = await Question.find({ quiz: quizId });

    res.json({
      success: true,
      message: `✅ Import thành công ${questions.length} câu hỏi mới.`,
      questions: updatedQuestions,
    });
  } catch (error) {
    console.error("❌ Import error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi import câu hỏi",
      error: error.message,
      stack: error.stack,
    });
  }
};




const getQuizzesByTutorId = async (req, res) => {
  try {
    const userId = req.user.id; 
    const tutor = await Tutor.findOne({ user: userId }); 

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    const quizzes = await Quiz.find({ tutorId: tutor._id })
      .populate("subjectId", "name")
      .populate("tutorId", "name email");

    if (!quizzes.length) {
      return res.status(404).json({
        success: false,
        message: "Tutor này chưa có quiz nào.",
      });
    }

    res.json({
      success: true,
      tutor: { id: tutor._id, name: tutor.name },
      quizzes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy quiz theo tutorId",
      error: error.message,
    });
  }
};

const getQuestionsByQuizId = async (req, res) => {
  try {
    const userId = req.user.id;
    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    const quizId = req.params.quizId;
    const quiz = await Quiz.findOne({ _id: quizId, tutorId: tutor._id });
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found or not owned by this tutor",
      });
    }

    const questions = await Question.find({ quiz: quizId });
    res.json({ success: true, questions });
  } catch (error) {
    console.error("❌ Lỗi khi lấy câu hỏi theo quiz:", error);
    res.status(500).json({
      success: false,
      message: "❌ Lỗi khi lấy câu hỏi theo quiz",
      error: error.message,
    });
  }
};
const updateQuestion = async (req, res) => {
  try {
    const { questionText, options, correctAnswer } = req.body;
    const question = await Question.findByIdAndUpdate(
      req.params.questionId,
      { questionText, options, correctAnswer },
      { new: true }
    );
    if (!question)
      return res.status(404).json({ success: false, message: "Không tìm thấy câu hỏi" });
    res.json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.questionId);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Không tìm thấy câu hỏi để xoá" });
    res.json({ success: true, message: "Đã xoá câu hỏi thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  importQuestions,
  getQuizzesByTutorId,
  getQuestionsByQuizId,
  updateQuestion,
  deleteQuestion
};