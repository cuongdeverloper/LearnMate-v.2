import React, { useState, useEffect } from "react";
import "./TutorCreateQuiz.scss";
import {
  getSubjectsByTutor,
  getMyQuizzes,
  createQuiz,
  updateQuiz,
  importQuestionsFromExcel,
  getQuestionsByQuiz,
  updateQuestion,
  deleteQuestion,
} from "../ApiTutor";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const TutorCreateQuiz = () => {
  const [subjects, setSubjects] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [quizId, setQuizId] = useState("");
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Load dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectRes, quizRes] = await Promise.all([
          getSubjectsByTutor(),
          getMyQuizzes(),
        ]);
        setSubjects(subjectRes.subjects || subjectRes.data || []);
        setQuizzes(quizRes.quizzes || quizRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("❌ Lỗi khi tải dữ liệu môn học hoặc quiz.");
      }
    };
    fetchData();
  }, []);

  // ✅ Tạo quiz mới
  const handleCreateQuiz = async () => {
    if (!selectedSubject || !quizTitle) {
      return toast.warning("⚠️ Vui lòng chọn môn học và nhập tiêu đề quiz.");
    }

    setLoading(true);
    try {
      const res = await createQuiz({
        subjectId: selectedSubject,
        title: quizTitle,
      });

      const newQuizId = res.quiz?._id || res.data?.quiz?._id;
      setQuizId(newQuizId);
      setSelectedQuiz(newQuizId);
      setQuestions([]);
      toast.success(`✅ Quiz "${quizTitle}" đã được tạo thành công!`);

      const quizRes = await getMyQuizzes();
      setQuizzes(quizRes.quizzes || quizRes.data || []);
    } catch (error) {
      toast.error("❌ Lỗi khi tạo quiz: " + (error.message || "Không xác định."));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Chọn quiz có sẵn
  const handleSelectExistingQuiz = async (e) => {
    const id = e.target.value;
    setSelectedQuiz(id);
    setQuizId(id);

    if (!id) {
      setQuestions([]);
      return;
    }

    try {
      const res = await getQuestionsByQuiz(id);
      setQuestions(res.data.questions || res.data?.data?.questions || []);
      const quiz = quizzes.find((q) => q._id === id);
      setQuizTitle(quiz?.title || "");
      toast.info("📚 Đang chọn quiz sẵn có để import hoặc cập nhật câu hỏi.");
    } catch (error) {
      console.error("Error loading questions:", error);
      toast.error("❌ Lỗi khi tải danh sách câu hỏi của quiz.");
    }
  };

  // ✅ Import câu hỏi từ Excel
  const handleImportQuestions = async () => {
    if (!quizId) return toast.warning("⚠️ Vui lòng chọn hoặc tạo quiz trước khi import!");
    if (!file) return toast.warning("⚠️ Vui lòng chọn file Excel để import!");

    setLoading(true);
    try {
      const res = await importQuestionsFromExcel(quizId, file);
      toast.success(res.message || "✅ Import câu hỏi thành công!");
      const updated = await getQuestionsByQuiz(quizId);
      setQuestions(updated.data.questions || updated.data?.data?.questions || []);
    } catch (error) {
      console.error("Import error:", error);
      toast.error("❌ Lỗi khi import câu hỏi: " + (error.message || "Không xác định."));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cập nhật quiz
  const handleUpdateQuiz = async () => {
    if (!quizId) return toast.warning("⚠️ Chưa chọn quiz!");
    try {
      await updateQuiz(quizId, { title: quizTitle });
      toast.success("✅ Cập nhật quiz thành công!");
      const updated = await getMyQuizzes();
      setQuizzes(updated.quizzes || updated.data || []);
    } catch (error) {
      toast.error("❌ Lỗi khi cập nhật quiz.");
    }
  };

  // ✅ Xoá quiz
  const handleDeleteQuiz = async () => {
    if (!quizId) return toast.warning("⚠️ Chưa chọn quiz!");
    if (!window.confirm("Bạn có chắc muốn xoá quiz này?")) return;

    try {
      const token = Cookies.get("accessToken");
      await axios.delete(`/api/quiz/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("🗑️ Xoá quiz thành công!");
      setSelectedQuiz("");
      setQuizId("");
      setQuestions([]);
      setQuizTitle("");
      const refreshed = await getMyQuizzes();
      setQuizzes(refreshed.quizzes || refreshed.data || []);
    } catch (error) {
      toast.error("❌ Lỗi khi xoá quiz.");
    }
  };

  return (
    <div className="tutor-create-quiz">
      <h2>🧩 Tạo / Cập nhật Quiz & Quản lý Câu hỏi</h2>

      {/* --- CHỌN QUIZ CŨ --- */}
      <div className="form-group">
        <label>🎓 Chọn quiz đã có:</label>
        <select value={selectedQuiz} onChange={handleSelectExistingQuiz}>
          <option value="">-- Chưa chọn quiz nào --</option>
          {quizzes.map((q) => (
            <option key={q._id} value={q._id}>
              {q.title} ({q.subjectId?.name})
            </option>
          ))}
        </select>
      </div>

      {!selectedQuiz && <div className="divider">Hoặc</div>}

      {/* --- TẠO QUIZ MỚI --- */}
      {!selectedQuiz && (
        <div className="quiz-form">
          <div className="form-group">
            <label>Môn học:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">-- Chọn môn học --</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} - lớp {s.classLevel}
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
              placeholder="VD: Kiểm tra Toán lớp 3"
            />
          </div>

          <button
            type="button"
            onClick={handleCreateQuiz}
            className="create-quiz-btn"
            disabled={loading}
          >
            {loading ? "Đang tạo quiz..." : "📝 Tạo Quiz Mới"}
          </button>
        </div>
      )}

      {/* --- IMPORT FILE + QUẢN LÝ QUIZ --- */}
      {selectedQuiz && (
        <div className="import-section">
          <h3>📥 Import & Quản lý quiz</h3>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="Cập nhật tiêu đề quiz..."
          />
          <div className="quiz-actions">
            <button onClick={handleUpdateQuiz}>💾 Cập nhật quiz</button>
            <button onClick={handleDeleteQuiz} className="delete-btn">
              🗑️ Xoá quiz
            </button>
          </div>

          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button
            type="button"
            onClick={handleImportQuestions}
            className="import-btn"
            disabled={loading}
          >
            {loading ? "Đang import..." : "📤 Import file Excel"}
          </button>

          <p className="note">
            File cần có các cột: <b>Câu hỏi, A, B, C, D, Đáp án</b>
          </p>

          {/* --- DANH SÁCH CÂU HỎI --- */}
          {questions.length > 0 && (
            <div className="question-list">
              <h4>📋 Danh sách câu hỏi ({questions.length}):</h4>
              <ul>
                {questions.map((q, i) => (
                  <li key={q._id}>
                    <b>{i + 1}.</b>{" "}
                    <input
                      type="text"
                      value={q.text}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[i].text = e.target.value;
                        setQuestions(updated);
                      }}
                    />
                    <ul>
                      {q.options?.map((opt, idx) => (
                        <li key={idx}>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[i].options[idx] = e.target.value;
                              setQuestions(updated);
                            }}
                          />
                          <input
                            type="radio"
                            checked={idx === q.correctAnswer}
                            onChange={() => {
                              const updated = [...questions];
                              updated[i].correctAnswer = idx;
                              setQuestions(updated);
                            }}
                          />
                          <label>✅</label>
                        </li>
                      ))}
                    </ul>

                    <div className="question-actions">
                      <button
                        onClick={async () => {
                          try {
                            await updateQuestion(q._id, {
                              questionText: q.text,
                              options: q.options,
                              correctAnswer: q.correctAnswer,
                            });
                            toast.success("💾 Cập nhật câu hỏi thành công!");
                          } catch (error) {
                            toast.error("❌ Lỗi khi cập nhật câu hỏi.");
                          }
                        }}
                      >
                        💾 Lưu
                      </button>

                      <button
                        onClick={async () => {
                          if (!window.confirm("Bạn có chắc muốn xoá câu hỏi này?")) return;
                          try {
                            await deleteQuestion(q._id);
                            const updated = questions.filter(
                              (item) => item._id !== q._id
                            );
                            setQuestions(updated);
                            toast.success("🗑️ Đã xoá câu hỏi!");
                          } catch (error) {
                            toast.error("❌ Lỗi khi xoá câu hỏi.");
                          }
                        }}
                        className="delete-btn"
                      >
                        🗑️ Xoá
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TutorCreateQuiz;
