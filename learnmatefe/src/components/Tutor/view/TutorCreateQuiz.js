import React, { useState, useEffect } from "react";
import "./TutorCreateQuiz.scss";
import {
  getSubjectsByTutor,
  getBookingsByTutorId,
  getQuizzesByBooking,
  createQuiz,
  getQuestionsByQuiz,
  importQuestionsFromExcel,
  updateQuestion,
  deleteQuestion,
} from "../ApiTutor";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const TutorCreateQuiz = () => {
  const tutorId = useSelector((state) => state.user.account.id);

  const [subjects, setSubjects] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [quizId, setQuizId] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Load dữ liệu ban đầu: môn học + buổi học
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [subjectRes, bookingRes] = await Promise.all([
          getSubjectsByTutor(),
          getBookingsByTutorId(tutorId),
        ]);
        setSubjects(subjectRes.subjects || []);
        setBookings(bookingRes.bookings || []);
      } catch (err) {
        console.error(err);
        toast.error("❌ Lỗi khi tải dữ liệu ban đầu.");
      }
    };
    fetchInitial();
  }, [tutorId]);

  // ✅ Lấy quiz theo buổi học
  const fetchQuizByBooking = async (bookingId) => {
    try {
      const res = await getQuizzesByBooking(bookingId);
      setQuizzes(res.quizzes || []);
    } catch (err) {
      console.error(err);
      toast.error("❌ Lỗi khi tải quiz.");
    }
  };

  const handleSelectBooking = async (e) => {
    const id = e.target.value;
    setSelectedBooking(id);
    setSelectedQuiz("");
    setQuizTitle("");
    setQuestions([]);
    if (id) await fetchQuizByBooking(id);
  };

  // ✅ Tạo quiz mới
  const handleCreateQuiz = async () => {
    if (!selectedBooking || !selectedSubject || !quizTitle)
      return toast.warning("⚠️ Vui lòng chọn buổi học, môn học và nhập tiêu đề quiz.");

    setLoading(true);
    try {
      const res = await createQuiz({
        bookingId: selectedBooking,
        subjectId: selectedSubject,
        title: quizTitle,
      });
      const newQuizId = res.quiz?._id;
      setQuizId(newQuizId);
      setSelectedQuiz(newQuizId);
      toast.success(`✅ Quiz "${quizTitle}" đã được tạo!`);
      await fetchQuizByBooking(selectedBooking);
    } catch (err) {
      console.error(err);
      toast.error("❌ Lỗi khi tạo quiz.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Chọn quiz có sẵn để xem câu hỏi
  const handleSelectExistingQuiz = async (e) => {
    const id = e.target.value;
    setSelectedQuiz(id);
    setQuizId(id);
    if (!id) return setQuestions([]);

    try {
      const res = await getQuestionsByQuiz(id);
      setQuestions(res.questions || []);
      const quiz = quizzes.find((q) => q._id === id);
      setQuizTitle(quiz?.title || "");
      toast.info("📘 Đã chọn quiz để chỉnh sửa hoặc import.");
    } catch (err) {
      toast.error("❌ Lỗi khi tải câu hỏi.");
    }
  };

  // ✅ Import câu hỏi từ Excel
  const handleImportQuestions = async () => {
    if (!quizId) return toast.warning("⚠️ Vui lòng chọn quiz!");
    if (!selectedBooking) return toast.warning("⚠️ Vui lòng chọn buổi học!");
    if (!file) return toast.warning("⚠️ Chọn file Excel!");

    setLoading(true);
    try {
      const res = await importQuestionsFromExcel(quizId, selectedBooking, file);
      toast.success(res.message || "✅ Import câu hỏi thành công!");
      const updated = await getQuestionsByQuiz(quizId);
      setQuestions(updated.questions || []);
    } catch (err) {
      toast.error("❌ Lỗi khi import câu hỏi.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Xoá câu hỏi
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá câu hỏi này không?")) return;
    try {
      await deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
      toast.success("🗑️ Đã xoá câu hỏi.");
    } catch (err) {
      toast.error("❌ Lỗi khi xoá câu hỏi.");
    }
  };

  // ✅ Cập nhật câu hỏi (inline edit)
  const handleEditQuestion = async (id, field, value) => {
    const updatedQuestions = questions.map((q) =>
      q._id === id ? { ...q, [field]: value } : q
    );
    setQuestions(updatedQuestions);

    try {
      await updateQuestion(id, { [field]: value });
    } catch (err) {
      toast.error("❌ Lỗi khi cập nhật câu hỏi.");
    }
  };

  // ✅ Cập nhật đáp án đúng
  const handleCorrectAnswerChange = async (qId, idx) => {
    const updated = questions.map((q) =>
      q._id === qId ? { ...q, correctAnswer: idx } : q
    );
    setQuestions(updated);
    try {
      await updateQuestion(qId, { correctAnswer: idx });
      toast.info("✅ Đã cập nhật đáp án đúng.");
    } catch {
      toast.error("❌ Lỗi khi cập nhật đáp án đúng.");
    }
  };

  return (
    <div className="tutor-create-quiz">
      <h2>🧩 Quản lý Quiz theo buổi học</h2>

      {/* --- CHỌN BUỔI HỌC --- */}
      <div className="form-group">
        <label>📅 Chọn buổi học:</label>
        <select value={selectedBooking} onChange={handleSelectBooking}>
          <option value="">-- Chọn buổi học --</option>
          {bookings.map((b) => (
            <option key={b._id} value={b._id}>
              {b.learnerId?.username || "Không rõ học viên"} -{" "}
              {b.subjectId?.name || "Không rõ môn"} (Lớp{" "}
              {b.subjectId?.classLevel || "?"})
            </option>
          ))}
        </select>
      </div>

      {/* --- CHỌN QUIZ --- */}
      {selectedBooking && (
        <>
          <div className="form-group">
            <label>🎓 Chọn quiz:</label>
            <select value={selectedQuiz} onChange={handleSelectExistingQuiz}>
              <option value="">-- Chưa chọn quiz --</option>
              {quizzes.map((q) => (
                <option key={q._id} value={q._id}>
                  {q.title} ({q.subjectId?.name})
                </option>
              ))}
            </select>
          </div>

          {!selectedQuiz && (
            <div className="quiz-form">
              <h4>🆕 Tạo quiz mới</h4>
              <div className="form-group">
                <label>Môn học:</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">-- Chọn môn học --</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} - Lớp {s.classLevel}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tiêu đề quiz:</label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="VD: Kiểm tra giữa kỳ Toán 6"
                />
              </div>

              <button onClick={handleCreateQuiz} disabled={loading}>
                {loading ? "Đang tạo..." : "📝 Tạo Quiz Mới"}
              </button>
            </div>
          )}
        </>
      )}

      {/* --- IMPORT FILE --- */}
      {selectedQuiz && (
        <div className="import-section">
          <h3>📥 Import câu hỏi từ Excel</h3>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button onClick={handleImportQuestions} disabled={loading}>
            {loading ? "Đang import..." : "📤 Import File Excel"}
          </button>
        </div>
      )}

      {/* --- DANH SÁCH CÂU HỎI --- */}
      {questions.length > 0 && (
        <div className="question-list">
          <h3>📋 Danh sách câu hỏi ({questions.length})</h3>
          {questions.map((q, i) => (
            <div key={q._id} className="question-item">
              <div className="question-header">
                <strong>
                  {i + 1}.{" "}
                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) =>
                      handleEditQuestion(q._id, "text", e.target.value)
                    }
                  />
                </strong>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteQuestion(q._id)}
                >
                  🗑️ Xoá
                </button>
              </div>

              <ul>
                {q.options.map((opt, idx) => (
                  <li key={idx}>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...q.options];
                        updated[idx] = e.target.value;
                        handleEditQuestion(q._id, "options", updated);
                      }}
                    />
                    <input
                      type="radio"
                      name={`correct-${q._id}`}
                      checked={q.correctAnswer === idx}
                      onChange={() => handleCorrectAnswerChange(q._id, idx)}
                    />{" "}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorCreateQuiz;
