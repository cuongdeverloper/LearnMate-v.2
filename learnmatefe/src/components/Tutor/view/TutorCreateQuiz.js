import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  getSubjectsByTutor,
  getBookingsByTutorId,
  getQuestionStorage,
  createQuizStorage,
  getQuizStorage,
  createQuizFromStorage,
  importQuestionsToStorage,
  deleteQuestion,
  deleteQuizStorage,
  updateQuizStorage,
} from "../ApiTutor";

const TutorQuizManager = () => {
  const tutorId = useSelector((state) => state.user.account.id);

  // --- State ---
  const [subjects, setSubjects] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [questionStorage, setQuestionStorage] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [file, setFile] = useState(null);
  const [quizTitle, setQuizTitle] = useState("");
  // QuizStorage
  const [quizStorageList, setQuizStorageList] = useState([]);
  const [filteredQuizStorage, setFilteredQuizStorage] = useState([]);
  const [quizStorageTitle, setQuizStorageTitle] = useState("");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [selectedQuizStorageId, setSelectedQuizStorageId] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizStorageQuestions, setQuizStorageQuestions] = useState([]);
  // --- Load subjects & bookings ---
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [subRes, bookingRes] = await Promise.all([
          getSubjectsByTutor(),
          getBookingsByTutorId(tutorId),
        ]);
        setSubjects(subRes.subjects || []);
        setBookings(bookingRes.data.bookings || []);
        console.log(bookingRes.data.bookings)
      } catch {
        toast.error("❌ Lỗi khi tải dữ liệu ban đầu");
      }
    };
    fetchInitial();
    fetchQuizStorage()
  }, [tutorId]);

  // --- QuestionStorage ---
  const fetchQuestionStorage = async (subjectId) => {
    if (!subjectId) return;
    try {
      const res = await getQuestionStorage();
      const filtered = res.questions.filter((q) => q.subjectId._id === subjectId);
      setQuestionStorage(filtered);
      setFilteredQuestions(filtered);
    } catch {
      toast.error("❌ Lỗi khi tải QuestionStorage");
    }
  };

  const handleUpdateQuizStorage = async () => {
    if (!selectedQuizStorageId) return toast.warning("⚠️ Chọn QuizStorage để cập nhật");
    setLoading(true);
    try {
      await updateQuizStorage(selectedQuizStorageId, {
        questionIds: quizStorageQuestions.map((q) => q._id),
      });
      toast.success("✅ Cập nhật QuizStorage thành công");
      fetchQuizStorage();
    } catch {
      toast.error("❌ Lỗi khi cập nhật QuizStorage");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestionToQuizStorage = (question) => {
    if (!selectedQuizStorageId) return toast.warning("⚠️ Chọn QuizStorage trước");
    if (quizStorageQuestions.some((q) => q._id === question._id)) return;

    setQuizStorageQuestions([...quizStorageQuestions, question]);
    setSelectedQuestionIds([...selectedQuestionIds, question._id]);
  };

  const handleRemoveQuestionFromQuizStorage = (questionId) => {
    setQuizStorageQuestions(quizStorageQuestions.filter((q) => q._id !== questionId));
    setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== questionId));
  };


  useEffect(() => {
  if (selectedQuizStorageId) {
    const selectedQuiz = quizStorageList.find(
      (qs) => qs._id === selectedQuizStorageId
    );
    if (selectedQuiz) {
      setQuizStorageQuestions(selectedQuiz.questions || []);
      // 🔥 Load QuestionStorage theo môn của quiz đó
      if (selectedQuiz.subjectId?._id) {
        setSelectedSubject(selectedQuiz.subjectId._id);
        fetchQuestionStorage(selectedQuiz.subjectId._id);
      }
    }
  }
}, [selectedQuizStorageId, quizStorageList]);


  // --- Import Questions ---
  const handleImportQuestions = async () => {
    if (!selectedSubject || !file) return toast.warning("⚠️ Chọn môn học và file Excel");
    setLoading(true);
    try {
      const res = await importQuestionsToStorage(file, selectedSubject);
      toast.success(res.message || "✅ Import câu hỏi thành công");
      fetchQuestionStorage(selectedSubject);
      setFile(null);
    } catch {
      toast.error("❌ Lỗi khi import câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  // --- QuizStorage ---
  const fetchQuizStorage = async () => {
    try {
      const res = await getQuizStorage();
      setQuizStorageList(res.quizzes || []);
      setFilteredQuizStorage(res.quizzes || []);
    } catch {
      toast.error("❌ Lỗi khi tải QuizStorage");
    }
  };

  const handleCreateQuizStorage = async () => {
    if (!quizStorageTitle || selectedQuestionIds.length === 0 || !selectedSubject)
      return toast.warning("⚠️ Chọn tên quiz, môn học và câu hỏi");
    setLoading(true);
    try {
      await createQuizStorage({
        title: quizStorageTitle,
        questionIds: selectedQuestionIds,
        subjectId: selectedSubject,
      });
      toast.success("✅ Tạo QuizStorage thành công");
      setQuizStorageTitle("");
      setSelectedQuestionIds([]);
      fetchQuizStorage();
    } catch {
      toast.error("❌ Lỗi khi tạo QuizStorage");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignQuiz = async () => {
    if (!selectedQuizStorageId || !selectedBookingId)
      return toast.warning("⚠️ Chọn QuizStorage và buổi học");
    if (!quizTitle.trim())
      return toast.warning("⚠️ Nhập tên quiz trước khi assign");

    setLoading(true);
    try {
      let res = await createQuizFromStorage({
        quizStorageId: selectedQuizStorageId,
        bookingId: selectedBookingId,
        title: quizTitle,
      });
      toast.success("✅ Quiz đã được assign cho buổi học");
      setQuizTitle("");
    } catch {
      toast.error("❌ Lỗi khi assign Quiz");
    } finally {
      setLoading(false);
    }
  };


  // --- Options ---
  const subjectOptions = subjects.map((s) => ({ value: s._id, label: s.name }));
  const bookingOptions = bookings.map((b) => ({
    value: b._id,
    label: `${b.subject?.name || "Không rõ môn"} ${b.subject?.classLevel || "Không rõ lớp"} - ${b.learner?.username || "Học viên"}`,
  }));
  const quizStorageOptions = filteredQuizStorage.map((qs) => ({
    value: qs._id,
    label: `${qs.name} (${qs.subjectId?.name || "Chưa rõ"})`,
  }));

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("❌ Bạn có chắc muốn xóa câu hỏi này?")) return;
    setLoading(true);
    try {
      let res = await deleteQuestion(questionId);
      toast.success("✅ Xóa câu hỏi thành công");
      fetchQuestionStorage(selectedSubject);
    } catch {
      toast.error("❌ Lỗi khi xóa câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuizStorage = async (quizStorageId) => {
    if (!window.confirm("❌ Bạn có chắc muốn xóa QuizStorage này?")) return;
    setLoading(true);
    try {
      await deleteQuizStorage(quizStorageId);
      toast.success("✅ Xóa QuizStorage thành công");
      fetchQuizStorage();
    } catch {
      toast.error("❌ Lỗi khi xóa QuizStorage");
    } finally {
      setLoading(false);
    }
  };

  // --- Search Question ---
  useEffect(() => {
    const filtered =
      searchTerm.trim() === ""
        ? questionStorage
        : questionStorage.filter((q) =>
          q.text.toLowerCase().includes(searchTerm.toLowerCase())
        );
    setFilteredQuestions(filtered);
  }, [searchTerm, questionStorage]);

  // --- Filter QuizStorage by Subject ---
  const handleFilterQuizBySubject = (subjectId) => {
    if (!subjectId) return setFilteredQuizStorage(quizStorageList);
    const filtered = quizStorageList.filter((qs) => qs.subjectId?._id === subjectId);
    setFilteredQuizStorage(filtered);
  };

  // --- JSX ---
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10 bg-gradient-to-b from-indigo-50 to-white min-h-screen">
      <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">
        🧩 Tutor Quiz Management Dashboard
      </h2>

      {/* 1️⃣ Import QuestionStorage */}
      <section className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
        <h3 className="text-xl font-semibold mb-4 text-indigo-600">
          📥 Import Question Storage
        </h3>
        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
          <Select
            options={subjectOptions}
            onChange={(sel) => {
              setSelectedSubject(sel?.value || "");
              fetchQuestionStorage(sel?.value || "");
            }}
            placeholder="📚 Chọn môn học"
            className="flex-1"
          />
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files[0])}
            className="border rounded-md p-2 w-full md:w-1/3"
          />
          <button
            onClick={handleImportQuestions}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            {loading ? "Đang import..." : "📤 Import Excel"}
          </button>
        </div>

        <div className="mt-4">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm câu hỏi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-md p-2 mb-3"
          />
          <div className="max-h-60 overflow-y-auto border rounded-md p-3 bg-gray-50">
            {filteredQuestions.map((q) => (
              <div key={q._id} className="flex justify-between items-center mb-1 p-1 rounded hover:bg-gray-100">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={q._id}
                    checked={selectedQuestionIds.includes(q._id)}
                    onChange={(e) => {
                      if (e.target.checked)
                        setSelectedQuestionIds([...selectedQuestionIds, q._id]);
                      else
                        setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== q._id));
                    }}
                  />
                  <span className="text-gray-700">{q.text}</span>
                </label>
                <button
                  onClick={() => handleDeleteQuestion(q._id)}
                  className="text-red-500 hover:text-red-700 px-2"
                >
                  🗑️
                </button>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* 2️⃣ Quiz Storage */}
      <section className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
        <h3 className="text-xl font-semibold mb-4 text-green-600">📝 Quiz Storage</h3>

        <div className="flex flex-col md:flex-row gap-3 mb-3">
          <input
            type="text"
            placeholder="✏️ Tên Quiz Storage"
            value={quizStorageTitle}
            onChange={(e) => setQuizStorageTitle(e.target.value)}
            className="border rounded-md p-2 flex-1"
          />
          <button
            onClick={handleCreateQuizStorage}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          >
            {loading ? "Đang tạo..." : "✅ Tạo Quiz Storage"}
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <Select
            options={[{ value: "", label: "Tất cả môn" }, ...subjectOptions]}
            onChange={(sel) => handleFilterQuizBySubject(sel?.value || "")}
            placeholder="📚 Lọc theo môn học"
            className="w-1/2"
          />
          <button
            onClick={fetchQuizStorage}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-md"
          >
            🔄 Refresh
          </button>
        </div>

        <Select
          options={quizStorageOptions}
          onChange={(sel) => setSelectedQuizStorageId(sel?.value || "")}
          placeholder="📦 Chọn Quiz Storage để chỉnh sửa"
        />

        {selectedQuizStorageId && (
          <div className="mt-4">
            <h4 className="text-lg font-medium mb-2">📝 Câu hỏi trong QuizStorage</h4>
            <div className="max-h-60 overflow-y-auto border rounded-md p-3 bg-gray-50">
              {quizStorageQuestions.map((q) => (
                <div
                  key={q._id}
                  className="flex justify-between items-center mb-1 p-1 rounded hover:bg-gray-100"
                >
                  <span>{q.text}</span>
                  <button
                    onClick={() => handleRemoveQuestionFromQuizStorage(q._id)}
                    className="text-red-500 hover:text-red-700 px-2"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <h4 className="text-lg font-medium mt-4 mb-2">➕ Thêm câu hỏi từ QuestionStorage</h4>
            <div className="max-h-60 overflow-y-auto border rounded-md p-3 bg-gray-50">
              {questionStorage.length === 0 ? (
                <div className="text-gray-500 italic text-center py-3 border rounded-md bg-gray-50">
                  ⚠️ Chưa có câu hỏi nào. Hãy chọn môn học để tải QuestionStorage.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto border rounded-md p-3 bg-gray-50">
                  {questionStorage.map((q) => (
                    <div
                      key={q._id}
                      className="flex justify-between items-center mb-1 p-1 rounded hover:bg-gray-100"
                    >
                      <span>{q.text}</span>
                      <button
                        onClick={() => handleAddQuestionToQuizStorage(q)}
                        className="text-green-500 hover:text-green-700 px-2"
                      >
                        ➕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleUpdateQuizStorage}
              className="mt-3 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              ✏️ Lưu thay đổi QuizStorage
            </button>
          </div>
        )}

        <ul className="divide-y divide-gray-200 mt-4">
          {filteredQuizStorage.length > 0 ? (
            filteredQuizStorage.map((qs) => (
              <li key={qs._id} className="py-2 flex justify-between items-center">
                <span className="text-gray-800 font-medium">{qs.name}</span>
                <span className="text-sm text-gray-500">
                  {qs.subjectId?.name || "Không rõ môn"}
                </span>
                <button
                  onClick={() => handleDeleteQuizStorage(qs._id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  🗑️
                </button>
              </li>
            ))
          ) : (
            <p className="text-gray-500 italic text-center py-3">
              Không có Quiz Storage nào
            </p>
          )}
        </ul>
      </section>

      {/* 3️⃣ Assign Quiz */}
      <section className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
        <h3 className="text-xl font-semibold mb-4 text-blue-600">
          🎯 Assign Quiz cho Buổi Học
        </h3>
        <div className="flex flex-col md:flex-row gap-4 items-center mb-3">
          <Select
            options={quizStorageOptions}
            onChange={(sel) => setSelectedQuizStorageId(sel?.value || "")}
            placeholder="📦 Chọn Quiz Storage"
            className="flex-1"
          />
          <Select
            options={bookingOptions}
            onChange={(sel) => setSelectedBookingId(sel?.value || "")}
            placeholder="📅 Chọn khoá học"
            className="flex-1"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="✏️ Nhập tên quiz"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            className="border rounded-md p-2 flex-1"
          />
          <button
            onClick={handleAssignQuiz}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Đang assign..." : "📝 Assign Quiz"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default TutorQuizManager;
