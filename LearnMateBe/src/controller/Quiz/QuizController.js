// controller/Quiz/QuizController.js
const XLSX = require("xlsx");
const Quiz = require("../../modal/Quiz");
const Question = require("../../modal/Question");
const Booking = require("../../modal/Booking");
const Subject = require("../../modal/Subject");
const Tutor = require("../../modal/Tutor");
const User = require("../../modal/User");
const QuizAttempt = require("../../modal/QuizAttempt");
const Answer = require("../../modal/Answer");

// 🧩 Lấy tất cả quiz (admin hoặc test)
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("subjectId tutorId");
    res.status(200).json({ success: true, quizzes });
  } catch (error) {
    console.error("GetAllQuizzes Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Không thể tải danh sách quiz." });
  }
};

// 🧩 Lấy quiz theo ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate(
      "subjectId tutorId"
    );

    if (!quiz)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy quiz." });

    const questions = await Question.find({ quizId: quiz._id });
    const quizAttempts = await QuizAttempt.find({
      userId: req.user.id,
      quizId: quiz._id,
    });
    const quizDetails = quiz.toObject();

    quizDetails.questions = questions;
    quizDetails.attempts = quizAttempts;

    res.status(200).json({ success: true, quiz: quizDetails });
  } catch (error) {
    console.error("GetQuizById Error:", error);
    res.status(500).json({ success: false, message: "Lỗi khi lấy quiz." });
  }
};

// 🧩 Tạo quiz mới (có thể theo booking)
exports.createQuiz = async (req, res) => {
  try {
    const { subjectId, bookingId, title } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu tiêu đề quiz." });
    }

    // 🔹 Lấy tutorId từ bảng Tutor dựa vào user hiện tại
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tutor tương ứng với user.",
      });
    }

    let finalTutorId = tutor._id;
    let finalSubjectId = subjectId;

    // Nếu có bookingId → tự động lấy subjectId từ đó
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        finalSubjectId = finalSubjectId || booking.subjectId;
      }
    }

    if (!finalSubjectId) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu subjectId." });
    }

    // 🔹 Tạo quiz mới
    const newQuiz = new Quiz({
      title,
      subjectId: finalSubjectId,
      tutorId: finalTutorId,
      bookingId: bookingId || null,
    });

    await newQuiz.save();

    res.status(201).json({
      success: true,
      message: "✅ Tạo quiz thành công.",
      quiz: newQuiz,
    });
  } catch (error) {
    console.error("CreateQuiz Error:", error);
    res.status(500).json({ success: false, message: "Lỗi khi tạo quiz." });
  }
};

// 🧩 Import câu hỏi từ file Excel
// Import Excel
exports.importQuestions = async (req, res) => {
  try {
    const { quizId, bookingId } = req.params;

    if (!quizId || !bookingId) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu quizId hoặc bookingId." });
    }

    // ✅ Lấy quiz để biết tutorId và subjectId
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy quiz." });
    }

    // ✅ Đọc file Excel
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    // ✅ Chuyển dữ liệu Excel thành danh sách câu hỏi
    const questions = rows.map((row, index) => {
      if (!row.text && !row.question) {
        throw new Error(`Dòng ${index + 2} thiếu cột 'text' hoặc 'question'`);
      }

      return {
        quizId,
        bookingId,
        tutorId: quiz.tutorId,
        subjectId: quiz.subjectId,
        text: row.text || row.question,
        options: [row.optionA, row.optionB, row.optionC, row.optionD],
        correctAnswer: Number(row.correctAnswer),
      };
    });

    // ✅ Import vào DB
    await Question.insertMany(questions);

    res
      .status(200)
      .json({ success: true, message: "✅ Import câu hỏi thành công!" });
  } catch (error) {
    console.error("❌ Lỗi import:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi import câu hỏi.",
      error: error.message,
    });
  }
};

// 🧩 Lấy danh sách quiz theo tutor
exports.getQuizzesByTutorId = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tutor." });

    const quizzes = await Quiz.find({ tutorId: tutor._id })
      .populate("subjectId", "name classLevel")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, quizzes });
  } catch (error) {
    console.error("GetQuizzesByTutorId Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi lấy danh sách quiz." });
  }
};

// 🧩 Lấy quiz theo booking
exports.getQuizzesByBookingId = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const quizzes = await Quiz.find({ bookingId })
      .populate("subjectId", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, quizzes });
  } catch (error) {
    console.error("GetQuizzesByBookingId Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Không thể tải quiz theo booking." });
  }
};

// 🧩 Lấy danh sách câu hỏi của quiz
exports.getQuestionsByQuizId = async (req, res) => {
  try {
    const { quizId } = req.params;
    const questions = await Question.find({ quizId });
    res.status(200).json({ success: true, questions });
  } catch (error) {
    console.error("GetQuestionsByQuizId Error:", error);
    res.status(500).json({ success: false, message: "Lỗi khi tải câu hỏi." });
  }
};

// 🧩 Cập nhật câu hỏi
exports.updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { text, options, correctAnswer } = req.body;

    const updated = await Question.findByIdAndUpdate(
      questionId,
      { text, options, correctAnswer },
      { new: true }
    );

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy câu hỏi." });
    res.status(200).json({ success: true, question: updated });
  } catch (error) {
    console.error("UpdateQuestion Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi cập nhật câu hỏi." });
  }
};

// 🧩 Xoá câu hỏi
exports.deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const deleted = await Question.findByIdAndDelete(questionId);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy câu hỏi." });
    res
      .status(200)
      .json({ success: true, message: "Đã xoá câu hỏi thành công." });
  } catch (error) {
    console.error("DeleteQuestion Error:", error);
    res.status(500).json({ success: false, message: "Lỗi khi xoá câu hỏi." });
  }
};

exports.getAllQuizzesByLearnerId = async (req, res) => {
  try {
    const learner = await User.findOne({ _id: req.user.id });

    if (!learner) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy learner." });
    }

    const joinedCourse = await Booking.find({ learnerId: learner._id });
    console.log(joinedCourse);

    if (!joinedCourse) {
      return res.status(200).json({ success: true, quizzes: [] });
    }

    const joinedCourseIds = joinedCourse.map((course) => course._id);

    const quizzes = await Quiz.find({
      bookingId: { $in: joinedCourseIds },
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, quizzes });
  } catch (error) {
    console.error("Get all quizzes by learner Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách quiz theo learner.",
    });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    console.log(answers);

    let score = 0;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy quiz." });
    }

    const questions = await Question.find({ quizId });

    questions.forEach((question, index) => {
      const answer = new Answer({
        questionId: question._id,
        learnerId: req.user.id,
        selectedAnswer: Number.parseInt(answers[question._id.toString()]) + 1,
        isCorrect:
          Number.parseInt(answers[question._id.toString()]) + 1 ===
          question.correctAnswer,
      });

      answer.save();

      if (answer.isCorrect) {
        score += 1;
      }
    });

    console.log("🥪🥪🥪Score:", score);

    const quizAttempt = new QuizAttempt({
      quizId,
      learnerId: req.user.id,
      totalQuestions: questions.length,
      correctAnswers: score,
      score: (score / questions.length) * 100,
      finishedAt: Date.now(),
    });

    await quizAttempt.save();

    const result = {
      score: quizAttempt.score,
      correct: quizAttempt.correctAnswers,
      totalQuestions: quizAttempt.totalQuestions,
      timeTaken: quizAttempt.finishedAt - quizAttempt.startedAt,
      questions,
      answers,
      rank: 1,
    };

    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Submit Quiz Error:", error);
    res.status(500).json({ success: false, message: "Lỗi khi nộp bài quiz!" });
  }
};
