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
const QuizStorage = require("../../modal/QuizStorage");
const QuestionStorage = require("../../modal/QuestionStorage");

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

exports.createQuizFromStorage = async (req, res) => {
  try {
    const { quizStorageId, bookingId, title } = req.body;

    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tutor." });
    }

    const quizStorage = await QuizStorage.findById(quizStorageId).populate(
      "questions"
    );
    if (!quizStorage) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy QuizStorage." });
    }

    const quiz = new Quiz({
      tutorId: tutor._id,
      subjectId: quizStorage.subjectId,
      bookingId,
      quizStorageId,
      title: title || quizStorage.name,
      description: quizStorage.description || "",
    });

    await quiz.save();

    // Tạo danh sách câu hỏi mới cho quiz
    const newQuestions = quizStorage.questions.map((q) => ({
      tutorId: tutor._id,
      subjectId: quizStorage.subjectId,
      quizId: quiz._id,
      bookingId,
      sourceQuestionId: q._id,
      topic: q.topic,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
    }));

    if (newQuestions.length > 0) {
      await Question.insertMany(newQuestions);
    }

    res.status(200).json({
      success: true,
      message: "✅ Quiz đã được tạo từ QuizStorage thành công!",
      quiz,
    });
  } catch (error) {
    console.error("CreateQuizFromStorage Error:", error);
    res.status(500).json({
      success: false,
      message: "❌ Lỗi khi tạo quiz từ QuizStorage.",
    });
  }
};

// 🧩 Import câu hỏi từ file Excel
// Import Excel
exports.importQuestionsToStorage = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tutor." });

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const questions = rows.map((row, index) => ({
      tutorId: tutor._id,
      subjectId: req.body.subjectId,
      text: row.text || row.question,
      options: [row.optionA, row.optionB, row.optionC, row.optionD],
      correctAnswer: Number(row.correctAnswer),
    }));

    await QuestionStorage.insertMany(questions);

    res.status(200).json({
      success: true,
      message: "✅ Import câu hỏi vào storage thành công!",
    });
  } catch (error) {
    console.error("ImportQuestionsToStorage Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi import câu hỏi vào storage." });
  }
};

// 🧩 Lấy danh sách quiz theo tutor
exports.getQuizStorage = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor)
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tutor.",
      });

    // ✅ Lấy QuizStorage của tutor, populate đúng reference
    const quizzes = await QuizStorage.find({ tutorId: tutor._id })
      .populate("subjectId", "name")
      .populate("questions", "text topic correctAnswer options"); // ref -> QuestionStorage

    res.status(200).json({
      success: true,
      quizzes,
    });
  } catch (error) {
    console.error("GetQuizStorage Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tải quiz storage.",
    });
  }
};

exports.getQuestionStorage = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    const questions = await QuestionStorage.find({
      tutorId: tutor._id,
    }).populate("subjectId");
    res.status(200).json({ success: true, questions });
  } catch (error) {
    console.error("GetQuestionStorage Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi tải question storage." });
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
    const deleted = await QuestionStorage.findByIdAndDelete(questionId);
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
    const { answers, startedAt, finishedAt } = req.body;
    console.log(answers);
    console.log("started at: ", startedAt, "finished at: ", finishedAt);

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy quiz." });
    }

    if (quiz.attempted >= quiz.maxAttempts) {
      return res
        .status(400)
        .json({ success: false, message: "Quiz has been attempted maximum." });
    }

    const questions = await Question.find({ quizId });

    const results = await Promise.all(
      questions.map(async (question) => {
        const selectedAnswer =
          Number.parseInt(answers[question._id.toString()]) + 1;
        const isCorrect =
          Number.parseInt(answers[question._id.toString()]) + 1 ===
          question.correctAnswer;

        const answer = new Answer({
          questionId: question._id,
          learnerId: req.user.id,
          selectedAnswer: selectedAnswer,
          isCorrect: isCorrect,
        });

        await answer.save();
        return isCorrect;
      })
    );

    const score = results.filter((isCorrect) => isCorrect).length;

    console.log("🥪🥪🥪Score:", score);

    const quizAttempt = new QuizAttempt({
      quizId,
      learnerId: req.user.id,
      totalQuestions: questions.length,
      correctAnswers: score,
      score: (score / questions.length) * 100,
      startedAt,
      finishedAt,
    });

    await quizAttempt.save();

    const result = {
      score: quizAttempt.score,
      correct: quizAttempt.correctAnswers,
      totalQuestions: quizAttempt.totalQuestions,
      timeTaken: Math.floor(
        (quizAttempt.finishedAt - quizAttempt.startedAt) / 1000
      ),
      questions,
      answers,
      rank: 1,
    };

    quiz.attempted += 1;
    quiz.newestScore = (score / questions.length) * 100;
    await quiz.save();

    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Submit Quiz Error:", error);
    res.status(500).json({ success: false, message: "Lỗi khi nộp bài quiz!" });
  }
};

exports.addQuestionsFromStorageToQuiz = async (req, res) => {
  try {
    const { quizId, questionIds } = req.body;
    const quiz = await Quiz.findById(quizId);
    if (!quiz)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy quiz." });

    const tutor = await Tutor.findOne({ user: req.user.id });

    const newQuestions = await Promise.all(
      questionIds.map(async (id) => {
        const questionData = await QuestionStorage.findById(id);
        if (!questionData) return null;

        const newQ = new Question({
          quizId: quiz._id,
          tutorId: tutor._id,
          subjectId: quiz.subjectId,
          text: questionData.text,
          options: questionData.options,
          correctAnswer: questionData.correctAnswer,
        });
        await newQ.save();
        return newQ._id;
      })
    );

    quiz.questions.push(...newQuestions.filter(Boolean));
    await quiz.save();

    res.status(200).json({
      success: true,
      message: "✅ Đã thêm câu hỏi từ storage vào quiz.",
    });
  } catch (error) {
    console.error("AddQuestionsFromStorageToQuiz Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi thêm câu hỏi từ storage." });
  }
};

exports.createQuizStorage = async (req, res) => {
  try {
    const { title, questionIds, subjectId } = req.body;

    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tutor." });

    const quizStorage = new QuizStorage({
      name: title,
      tutorId: tutor._id,
      subjectId,
      questions: questionIds || [],
    });

    await quizStorage.save();
    res.status(201).json({ success: true, quizStorage });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi tạo QuizStorage." });
  }
};

exports.deleteQuizStorage = async (req, res) => {
  try {
    const { quizStorageId } = req.params;
    const deleted = await QuizStorage.findByIdAndDelete(quizStorageId);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy Quiz Storage." });
    res
      .status(200)
      .json({ success: true, message: "Đã xoá Quiz Storage thành công." });
  } catch (error) {
    console.error("Delete Quiz Storage Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi xoá Quiz Storage." });
  }
};

exports.updateQuizStorage = async (req, res) => {
  try {
    const { quizStorageId } = req.params;
    const { questionIds, name } = req.body;

    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tutor." });

    const quizStorage = await QuizStorage.findOne({
      _id: quizStorageId,
      tutorId: tutor._id,
    });
    if (!quizStorage)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy QuizStorage." });

    if (name) quizStorage.name = name;

    if (Array.isArray(questionIds)) {
      quizStorage.questions = questionIds;
    }

    await quizStorage.save();

    await quizStorage.populate("questions", "text topic options correctAnswer");

    res.status(200).json({
      success: true,
      message: "✅ Cập nhật QuizStorage thành công.",
      quizStorage,
    });
  } catch (error) {
    console.error("UpdateQuizStorage Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi cập nhật QuizStorage." });
  }
};
