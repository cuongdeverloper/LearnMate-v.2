import React, { useState, useEffect } from "react";
import {
  importQuestionsToStorage,
  getQuestionStorage,
  createQuizStorage,
  getQuizStorage,
  getSubjectsByTutor,
  getBookingsByTutorId,
} from "../ApiTutor";
import { toast } from "react-toastify";
import Select from "react-select";
import { useSelector } from "react-redux";
import './TutorCreateQuiz.scss'
const TutorCreateQuiz = () => {
  const [subjects, setSubjects] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [questionStorage, setQuestionStorage] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [quizStorages, setQuizStorages] = useState([]);
  const [isCustomTopic, setIsCustomTopic] = useState(false);
  const [quizTopics, setQuizTopics] = useState([]);
  const [selectedQuizTopic, setSelectedQuizTopic] = useState("");

  const [quizTitle, setQuizTitle] = useState("");
  const [quizTopic, setQuizTopic] = useState("");

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const userId = useSelector((state) => state.user.account.id);

  // 🔹 Load subjects, bookings, quizStorages ban đầu
  useEffect(() => {
    (async () => {
      try {
        const [subRes, bookRes, quizStorageRes] = await Promise.all([
          getSubjectsByTutor(),
          getBookingsByTutorId(userId),
          getQuizStorage(),
        ]);
        setSubjects(subRes.subjects || []);
        setBookings(bookRes.bookings || []);
        setQuizStorages(quizStorageRes.quizzes || []);
        setQuizTopics(
          quizStorageRes.topics.map((t) => ({ label: t, value: t }))
        );
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  // 🔹 Load QuestionStorage khi chọn môn học
  useEffect(() => {
    if (!selectedSubject) return;
    setSelectedTopic("");
    (async () => {
      try {
        const res = await getQuestionStorage(selectedSubject.value, "");
        setQuestionStorage(res.questions || []);
        setTopics(res.topics.map((t) => ({ label: t, value: t })) || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải QuestionStorage:", err);
        setQuestionStorage([]);
        setTopics([]);
      }
    })();
  }, [selectedSubject]);

  // 🔹 Khi chọn topic trong cùng subject
  useEffect(() => {
    if (!selectedSubject || !selectedTopic) return;
    (async () => {
      try {
        const res = await getQuestionStorage(selectedSubject.value, selectedTopic);
        setQuestionStorage(res.questions || []);
      } catch (err) {
        console.error("❌ Lỗi khi lọc theo topic:", err);
      }
    })();
  }, [selectedTopic]);

  // 🧩 Import Excel vào QuestionStorage
  const handleImportExcel = async () => {
    if (!file || !selectedSubject) {
      toast.error("Vui lòng chọn file và môn học!");
      return;
    }
    try {
      setLoading(true);
      await importQuestionsToStorage(file, selectedSubject.value);
      toast.success("Import câu hỏi thành công!");
      setFile(null);
    } catch (error) {
      toast.error("Lỗi khi import câu hỏi!");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Tạo QuizStorage từ các câu hỏi đã chọn
  const handleCreateQuizStorage = async () => {
    if (!selectedSubject || selectedQuestions.length === 0 || !quizTitle) {
      toast.error("Vui lòng chọn môn, tiêu đề và câu hỏi!");
      return;
    }

    setLoading(true);
    try {
      const res = await createQuizStorage({
        title: quizTitle,
        questionIds: selectedQuestions.map((q) => q._id),
        subjectId: selectedSubject.value,
        topic: quizTopic || selectedTopic,
      });

      if (res?.success) {
        toast.success("Tạo QuizStorage thành công!");
        setQuizStorages((prev) => [...prev, res.quizStorage]);
        setSelectedQuestions([]);
        setQuizTitle("");
        setQuizTopic("");
        setIsCustomTopic(false);
      } else {
        console.error("API trả về lỗi:", res?.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tạo QuizStorage!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-semibold text-gray-700">
        📘 Quản lý Quiz cho Tutor
      </h2>

      {/* 🔹 Import Excel */}
      <div className="space-y-3 border-b pb-4">
        <h3 className="text-lg font-medium">Import câu hỏi từ Excel</h3>

        <Select
          options={subjects.map((s) => ({
            label: `${s.name + " " + s.classLevel}`,
            value: s._id,
          }))}
          onChange={setSelectedSubject}
          placeholder="Chọn môn học"
        />

        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={handleImportExcel}
          disabled={loading}
        >
          {loading ? "Đang import..." : "Import Excel"}
        </button>
      </div>

      {/* 🔹 Chọn topic */}
      {selectedSubject && topics.length > 0 && (
        <div className="space-y-3 border-b pb-4 mt-4">
          <h3 className="text-lg font-medium">Chọn Topic của môn học</h3>
          <Select
            options={[{ label: "Tất cả", value: "" }, ...topics]}
            onChange={(val) => setSelectedTopic(val?.value || "")}
            placeholder="Lọc theo topic câu hỏi"
          />
        </div>
      )}

      {/* 🔹 Chọn câu hỏi + tạo QuizStorage */}
      {selectedTopic && questionStorage.length > 0 && (
        <div className="space-y-3 border-b pb-4">
          <h3 className="text-lg font-medium">
            Chọn câu hỏi để tạo QuizStorage
          </h3>

          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto border p-3 rounded-md bg-gray-50">
            {questionStorage.map((q) => (
              <label
                key={q._id}
                className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md border transition-all"
              >
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 accent-blue-500 cursor-pointer"
                  checked={selectedQuestions.some((s) => s._id === q._id)}
                  onChange={(e) =>
                    e.target.checked
                      ? setSelectedQuestions([...selectedQuestions, q])
                      : setSelectedQuestions(
                          selectedQuestions.filter((s) => s._id !== q._id)
                        )
                  }
                />

                <div className="flex-1 space-y-2">
                  <p className="font-semibold text-gray-800 text-base">
                    {q.text}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {q.options?.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-md border ${
                          q.correctAnswer === idx
                            ? "bg-green-100 border-green-400 text-green-700 font-medium"
                            : "bg-gray-50 text-gray-700"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}. {opt}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>
                      ✅ Đáp án đúng: {String.fromCharCode(65 + q.correctAnswer)}
                    </span>
                    {q.topic && <span>📘 Chủ đề: {q.topic}</span>}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <input
            className="border p-2 rounded w-full"
            placeholder="Tên QuizStorage"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
          />

          <Select
            options={[...topics, { label: "Khác (tự nhập)", value: "custom" }]}
            placeholder="Chọn topic cho QuizStorage"
            onChange={(val) => {
              if (val?.value === "custom") {
                setIsCustomTopic(true);
                setQuizTopic("");
              } else {
                setIsCustomTopic(false);
                setQuizTopic(val?.value || "");
              }
            }}
          />

          {isCustomTopic && (
            <input
              className="border p-2 rounded w-full mt-2"
              placeholder="Nhập topic mới (nếu không có trong danh sách)"
              value={quizTopic}
              onChange={(e) => setQuizTopic(e.target.value)}
            />
          )}

          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md"
            onClick={handleCreateQuizStorage}
            disabled={loading}
          >
            Tạo QuizStorage
          </button>
        </div>
      )}
    </div>
  );
};

export default TutorCreateQuiz;
