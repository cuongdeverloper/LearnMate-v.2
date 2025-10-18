import React, { useState, useEffect } from "react";
import {
  createAssignment,
  getAssignments,
  deleteAssignment,
  getBookingsByTutorId
} from "../ApiTutor";
import { toast } from "react-toastify";
import "./TutorAssignmentManager.scss";
import { useSelector } from "react-redux";

const TutorAssignmentManager = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [file, setFile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const tutorId = useSelector((state) => state.user.account.id);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await getBookingsByTutorId(tutorId);
        console.log(res)
        if (res?.bookings) {
          setBookings(res.bookings);
        }
      } catch (err) {
        console.error(err);
        toast.error("Không thể lấy danh sách buổi học");
      }
    };
    fetchBookings();
  }, []);

  useEffect(() => {
    const fetchAssignments = async () => {
      const res = await getAssignments();
      if (res.errorCode === 0) setAssignments(res.data);
    };
    fetchAssignments();
  }, []);

  // 🧩 Tạo assignment mới
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedBooking || !title || !deadline || !file) {
      toast.warning("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const booking = bookings.find((b) => b._id === selectedBooking);
    if (!booking) {
      toast.error("Không tìm thấy buổi học");
      return;
    }

    const formData = new FormData();
    formData.append("subjectId", booking.subjectId?._id);
    formData.append("tutorId", booking.tutorId);
    formData.append("learnerId", booking.learnerId?._id);
    formData.append("bookingId", booking._id);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("deadline", deadline);
    formData.append("file", file);

    setLoading(true);
    const res = await createAssignment(formData);
    // console.log(file)
    setLoading(false);

    if (res.errorCode === 0) {
      toast.success("Tạo bài tập thành công 🎉");
      setAssignments((prev) => [res.data, ...prev]);
      setTitle("");
      setDescription("");
      setDeadline("");
      setFile(null);
      setSelectedBooking("");
    } else {
      toast.error(res.message);
    }
  };

  // 🧩 Xoá assignment
  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xoá bài tập này?")) return;
    const res = await deleteAssignment(id);
    if (res.errorCode === 0) {
      toast.success("Đã xoá bài tập");
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="tutor-assignment-container">
      <h2>📚 Quản lý bài tập</h2>

      {/* --- FORM TẠO BÀI TẬP --- */}
      <form className="assignment-form" onSubmit={handleCreate}>
        <div className="form-group">
          <label>Buổi học</label>
          <select
            value={selectedBooking}
            onChange={(e) => setSelectedBooking(e.target.value)}
          >
            <option value="">-- Chọn buổi học --</option>
            {bookings.map((b, index) => (
              <option key={b._id || index} value={b._id}>
                {b.learnerId?.username || "Không rõ học viên"} -{" "}
                {b.subjectId?.name || "Không rõ môn"} (Lớp{" "}
                {b.subjectId?.classLevel || "?"})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Tiêu đề</label>
          <input
            type="text"
            placeholder="Nhập tiêu đề bài tập"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Mô tả</label>
          <textarea
            placeholder="Mô tả ngắn về bài tập"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="form-group">
          <label>Hạn nộp</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>File bài tập (PDF hoặc DOCX)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Đang tải lên..." : "Tạo bài tập"}
        </button>
      </form>

      {/* --- DANH SÁCH ASSIGNMENT --- */}
      <div className="assignment-list">
        <h3>📖 Danh sách bài tập</h3>
        {assignments.length === 0 ? (
          <p>Chưa có bài tập nào.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Học viên</th>
                <th>Môn</th>
                <th>Deadline</th>
                <th>File</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a, index) => (
                <tr key={a._id || index}>
                  <td>{a.title}</td>
                  <td>{a.learnerId?.email  || "?"} ({a.learnerId?.username || "?"})</td>
                  <td>{a.subjectId?.name || "?"}</td>
                  <td>{new Date(a.deadline).toLocaleDateString()}</td>
                  <td>
                    {a.fileUrl ? (
                      <a href={a.fileUrl} target="_blank" rel="noopener noreferrer">
                        📄 Xem file
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(a._id)}>
                      🗑️ Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TutorAssignmentManager;
