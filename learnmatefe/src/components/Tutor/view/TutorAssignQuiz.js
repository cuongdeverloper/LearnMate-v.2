import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  getSubjectsByTutor,
  getBookingsByTutorId,
  getQuizStorage,
  createQuizFromStorage,
} from "../ApiTutor";

const TutorAssignQuiz = () => {
  const [subjects, setSubjects] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [quizStorages, setQuizStorages] = useState([]);
  const [quizTopics, setQuizTopics] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedQuizStorage, setSelectedQuizStorage] = useState(null);
  const [bookingId, setBookingId] = useState("");

  const [openTime, setOpenTime] = useState("");
  const [duration, setDuration] = useState(1800);
  const [quizTitle, setQuizTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = useSelector((state) => state.user.account.id);


  // 🔹 Load subjects & bookings
  useEffect(() => {
    (async () => {
      try {
        const [subRes, bookRes] = await Promise.all([
          getSubjectsByTutor(),
          getBookingsByTutorId(userId),
        ]);
        setSubjects(subRes.subjects || []);
        const approvedBookings = (bookRes.data.bookings || []).filter(
          (b) => b.status === "approve"
        );
        setBookings(approvedBookings);
        console.log(bookRes)
      } catch (error) {
        console.error("❌ Lỗi khi load subjects/bookings:", error);
      }
    })();
  }, []);

  // 🔹 Khi chọn môn → load quizStorage + topics của môn đó
  useEffect(() => {
    if (!selectedSubject) return;

    (async () => {
      try {
        const res = await getQuizStorage(selectedSubject.value, "");
        const filtered = (res.quizzes || []).filter(
          (q) => q.subjectId?._id === selectedSubject.value
        );

        setQuizStorages(filtered);

        // ✅ Lọc topic chỉ thuộc môn đó
        const subjectTopics = [
          ...new Set(filtered.map((q) => q.topic).filter(Boolean)),
        ];
        setQuizTopics(subjectTopics.map((t) => ({ label: t, value: t })));

        setSelectedTopic("");
        setSelectedQuizStorage(null);
      } catch (err) {
        console.error("❌ Lỗi khi load quizStorage theo môn:", err);
        setQuizStorages([]);
        setQuizTopics([]);
      }
    })();
  }, [selectedSubject]);

  // 🔹 Khi chọn topic → lọc lại quizStorage (frontend + backend)
  useEffect(() => {
    if (!selectedSubject) return;

    (async () => {
      try {
        const res = await getQuizStorage(selectedSubject.value, selectedTopic);
        let filtered = (res.quizzes || []).filter(
          (q) => q.subjectId?._id === selectedSubject.value
        );

        // ✅ Nếu topic được chọn khác rỗng → lọc tiếp ở FE
        if (selectedTopic) {
          filtered = filtered.filter((q) => q.topic === selectedTopic);
        }

        setQuizStorages(filtered);
      } catch (err) {
        console.error("❌ Lỗi khi lọc quiz theo topic:", err);
        setQuizStorages([]);
      }
    })();
  }, [selectedTopic, selectedSubject]);

  // 🔹 Gán QuizStorage cho học viên
  const handleAssignQuiz = async () => {
    if (!selectedQuizStorage || !bookingId || !openTime) {
      toast.error("Vui lòng chọn quiz, học viên và thời gian mở!");
      return;
    }

    try {
      setLoading(true);
      const res = await createQuizFromStorage({
        quizStorageId: selectedQuizStorage.value,
        bookingId,
        title: quizTitle || selectedQuizStorage.label,
        duration,
        openTime,
      });

      if (res?.success) {
        toast.success("🎉 Quiz đã được tạo và gán thành công!");
        setQuizTitle("");
        setBookingId("");
        setOpenTime("");
        setSelectedQuizStorage(null);
      } else {
        toast.error("❌ Gán quiz thất bại!");
      }
    } catch (err) {
      console.error("❌ Lỗi khi gán quiz:", err);
      toast.error("Đã xảy ra lỗi khi gán quiz!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-semibold text-gray-700">🧩 Gán Quiz cho Học viên</h2>

      {/* 🔹 Chọn môn */}
      <div>
        <h3 className="font-medium mb-2">Chọn môn học</h3>
        <Select
          options={subjects.map((s) => ({
            label: `${s.name} ${s.classLevel || ""}`,
            value: s._id,
          }))}
          onChange={setSelectedSubject}
          placeholder="Chọn môn học"
        />
      </div>

      {/* 🔹 Lọc theo topic */}
      {quizTopics.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Lọc theo Topic</h3>
          <Select
            options={[{ label: "Tất cả", value: "" }, ...quizTopics]}
            onChange={(val) => setSelectedTopic(val?.value || "")}
            placeholder="Chọn topic quiz"
          />
        </div>
      )}

      {/* 🔹 Danh sách QuizStorage */}
      <div>
        <h3 className="font-medium mb-2">Chọn QuizStorage</h3>
        <Select
          options={quizStorages.map((q) => ({
            label: `${q.name} (${q.topic || "Không có topic"})`,
            value: q._id,
          }))}
          onChange={setSelectedQuizStorage}
          placeholder="Chọn quiz để gán"
        />
      </div>

      {/* 🔹 Booking học viên */}
      <div>
        <h3 className="font-medium mb-2">Chọn học viên</h3>
        <Select
          options={bookings.map((b) => ({
            label: (
              <div className="flex flex-col">
                <span className="font-semibold">{b.learner?.username || "Không rõ"}</span>
                <span className="text-sm text-gray-600">
                  📘 {b.subject?.name} - Lớp {b.subject?.classLevel}
                </span>
                <span className="text-xs text-gray-500">
                  📅 {new Date(b.startDate).toLocaleDateString("vi-VN")} →{" "}
                  {new Date(b.endDate).toLocaleDateString("vi-VN")}
                </span>
                <span className="text-xs text-gray-500">
                  💬 {b.learner?.email || "N/A"} | ☎ {b.learner?.phoneNumber || "N/A"}
                </span>
                <span className="text-xs text-gray-400">🏠 {b.address || "Không có địa chỉ"}</span>
              </div>
            ),
            value: b._id,
          }))}
          onChange={(val) => setBookingId(val.value)}
          placeholder="Chọn học viên (booking)"
          formatOptionLabel={(option) => option.label} // 👈 Đảm bảo JSX hiển thị
        />
      </div>


      {/* 🔹 Cài đặt quiz */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex flex-col flex-1">
          <label className="text-sm text-gray-600 mb-1">Thời gian mở quiz</label>
          <input
            type="datetime-local"
            className="border p-2 rounded"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Thời lượng (giây)</label>
          <input
            type="number"
            className="border p-2 rounded w-40"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </div>
      </div>

      {/* 🔹 Tiêu đề Quiz */}
      <div>
        <label className="text-sm text-gray-600 mb-1">Tiêu đề Quiz</label>
        <input
          className="border p-2 rounded w-full"
          placeholder="Nhập tiêu đề quiz (tuỳ chọn)"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
        />
      </div>

      {/* 🔹 Nút gán quiz */}
      <button
        onClick={handleAssignQuiz}
        disabled={loading}
        className={`px-6 py-2 rounded-md text-white ${loading ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"
          }`}
      >
        {loading ? "Đang gán..." : "Gán Quiz cho học viên"}
      </button>
    </div>
  );
};

export default TutorAssignQuiz;
