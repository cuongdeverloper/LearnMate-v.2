import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  getSubjectsByTutor,
  getBookingsByTutorId,
  createAssignmentStorage,
  getAssignmentStorage,
  createAssignmentFromStorage,
} from "../ApiTutor";
import "./TutorAssignmentManager.scss";

const TutorAssignmentManager = () => {
  const tutorId = useSelector((state) => state.user.account.id);

  const [subjects, setSubjects] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [assignmentStorageList, setAssignmentStorageList] = useState([]);
  const [filteredStorage, setFilteredStorage] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStorageId, setSelectedStorageId] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState("");
const [assignTitle, setAssignTitle] = useState("");
const [assignDescription, setAssignDescription] = useState("");
const [deadline, setDeadline] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- Fetch subjects + bookings + storage ---
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [subRes, bookingRes, storageRes] = await Promise.all([
          getSubjectsByTutor(),
          getBookingsByTutorId(tutorId),
          getAssignmentStorage(),
        ]);
        console.log( storageRes)
        setSubjects(subRes.subjects || []);
        setBookings(bookingRes.bookings || []);
        setAssignmentStorageList(storageRes.data || []);
        setFilteredStorage(storageRes.data || []);
      } catch {
        toast.error("❌ Lỗi khi tải dữ liệu ban đầu");
      }
    };
    fetchInitial();
  }, [tutorId]);

  // --- Create Assignment Storage ---
  const handleCreateStorage = async () => {
    if (!selectedSubject || !title || !file)
      return toast.warning("⚠️ Vui lòng nhập tiêu đề, chọn môn học và file!");

    const formData = new FormData();
    formData.append("subjectId", selectedSubject);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await createAssignmentStorage(formData);
      toast.success("✅ Tạo Assignment Storage thành công!");
      setTitle("");
      setDescription("");
      setFile(null);
      const updated = await getAssignmentStorage();
      setAssignmentStorageList(updated.storages || []);
      setFilteredStorage(updated.storages || []);
    } catch {
      toast.error("❌ Lỗi khi tạo Assignment Storage");
    } finally {
      setLoading(false);
    }
  };

  // --- Assign Assignment ---
  const handleAssign = async () => {
  if (!selectedStorageId || !selectedBookingId || !assignTitle || !deadline)
    return toast.warning("⚠️ Nhập tiêu đề, chọn storage, buổi học và deadline!");

  setLoading(true);
  try {
    const res = await createAssignmentFromStorage({
      assignmentStorageId: selectedStorageId,
      bookingId: selectedBookingId,
      title: assignTitle,
      description: assignDescription,
      deadline,
    });
    toast.success("✅ Giao bài tập thành công!");
    setAssignTitle("");
    setAssignDescription("");
    setDeadline("");
  } catch {
    toast.error("❌ Lỗi khi giao bài tập");
  } finally {
    setLoading(false);
  }
};


  // --- Filter by subject ---
  const handleFilterBySubject = (subjectId) => {
    if (!subjectId) return setFilteredStorage(assignmentStorageList);
    const filtered = assignmentStorageList.filter(
      (s) => s.subjectId?._id === subjectId
    );
    setFilteredStorage(filtered);
  };

  // --- Options ---
  const subjectOptions = subjects.map((s) => ({ value: s._id, label: s.name }));
  const bookingOptions = bookings.map((b) => ({
    value: b._id,
    label: `${b.subjectId?.name} - ${b.learnerId?.username}`,
  }));
  const storageOptions = filteredStorage.map((a) => ({
    value: a._id,
    label: `${a.title} (${a.subjectId?.name || "Chưa rõ"})`,
  }));

  // --- JSX ---
  return (
    <div className="tutor-assignment-manager">
      <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">
        📘 Tutor Assignment Dashboard
      </h2>

      {/* 1️⃣ Tạo Assignment Storage */}
      <section className="storage-section">
        <h3 className="section-title text-indigo-600">📂 Assignment Storage</h3>
        <div className="flex flex-col md:flex-row gap-4 mb-3">
          <Select
            options={subjectOptions}
            onChange={(sel) => setSelectedSubject(sel?.value || "")}
            placeholder="📚 Chọn môn học"
            className="flex-1"
          />
          <input
            type="text"
            placeholder="✏️ Tiêu đề bài tập"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded-md p-2 flex-1"
          />
        </div>
        <textarea
          placeholder="🧾 Mô tả bài tập (tùy chọn)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded-md p-2 mb-3"
        ></textarea>

        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
            className="border rounded-md p-2 w-full md:w-1/2"
          />
          <button
            onClick={handleCreateStorage}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            {loading ? "Đang tạo..." : "💾 Lưu Assignment Storage"}
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <Select
            options={[{ value: "", label: "Tất cả môn" }, ...subjectOptions]}
            onChange={(sel) => handleFilterBySubject(sel?.value || "")}
            placeholder="📚 Lọc theo môn học"
            className="w-1/2"
          />
        </div>

        <ul className="divide-y divide-gray-200">
          {filteredStorage.length > 0 ? (
            filteredStorage.map((a) => (
              <li
                key={a._id}
                className="py-2 flex justify-between items-center"
              >
                <span className="text-gray-800 font-medium">{a.title}</span>
                <span className="text-sm text-gray-500">
                  {a.subjectId?.name || "Không rõ môn"}
                </span>
              </li>
            ))
          ) : (
            <p className="text-gray-500 italic text-center py-3">
              Không có Assignment Storage nào
            </p>
          )}
        </ul>
      </section>

      {/* 2️⃣ Assign Assignment */}
      <section className="assign-section">
        <h3 className="section-title text-green-600">
          🎯 Giao Assignment cho Buổi Học
        </h3>

        <div className="flex flex-col md:flex-row gap-4 items-center mb-3">
          <Select
            options={storageOptions}
            onChange={(sel) => setSelectedStorageId(sel?.value || "")}
            placeholder="📦 Chọn Assignment Storage"
            className="flex-1"
          />
          <Select
            options={bookingOptions}
            onChange={(sel) => setSelectedBookingId(sel?.value || "")}
            placeholder="📅 Chọn buổi học"
            className="flex-1"
          />
        </div>
<input
  type="text"
  placeholder="✏️ Tiêu đề bài tập khi giao"
  value={assignTitle}
  onChange={(e) => setAssignTitle(e.target.value)}
  className="border rounded-md p-2 w-full mb-2"
/>

<textarea
  placeholder="🧾 Mô tả bài tập khi giao (tùy chọn)"
  value={assignDescription}
  onChange={(e) => setAssignDescription(e.target.value)}
  className="border rounded-md p-2 w-full mb-2"
/>

<input
  type="date"
  value={deadline}
  onChange={(e) => setDeadline(e.target.value)}
  className="border rounded-md p-2 w-full mb-3"
/>
        <button
          onClick={handleAssign}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          {loading ? "Đang giao..." : "📝 Giao Assignment"}
        </button>
      </section>
    </div>
  );
};

export default TutorAssignmentManager;
