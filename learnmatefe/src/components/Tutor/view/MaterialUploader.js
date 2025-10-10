import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { uploadMaterial, getMaterialsForBooking, getTutorSchedule } from "../ApiTutor";
import "./MaterialUploader.scss";

const MaterialUploader = () => {
  const tutorId = useSelector((state) => state.user?.account?.id);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [materials, setMaterials] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBookings = async () => {
    if (!tutorId) return;
    try {
      const res = await getTutorSchedule(tutorId);
      const uniqueBookings = Array.isArray(res)
        ? [...new Map(res.map((bk) => [bk.bookingId, bk])).values()]
        : [];
      setBookings(uniqueBookings);
    } catch {
      setBookings([]);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [tutorId]);

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!bookingId) {
        setMaterials([]);
        return;
      }

      try {
        const res = await getMaterialsForBooking(bookingId);
        const list = Array.isArray(res?.data) ? res.data : [];
        const uniqueMaterials = [...new Map(list.map((m) => [m._id, m])).values()];
        setMaterials(uniqueMaterials);
      } catch (error) {
        console.error("❌ Error in fetchMaterials:", error);
        setMaterials([]);
      }
    };

    fetchMaterials();
  }, [bookingId]);

  const handleUpload = async () => {
    if (!file || !title || !bookingId) {
      toast.warn("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      const res = await uploadMaterial({ bookingId, title, description, file });
      console.log(res)
      if (res.errorCode === 0) {
        toast.success("Tải tài liệu thành công");
        setFile(null);
        setTitle("");
        setDescription("");

        const materialsRes = await getMaterialsForBooking(bookingId);
        const list = Array.isArray(materialsRes?.data) ? materialsRes.data : [];
        const uniqueMaterials = [...new Map(list.map((m) => [m._id, m])).values()];
        setMaterials(uniqueMaterials);
      } else {
        toast.error(res.message || "Lỗi upload");
      }
    } catch (err) {
      toast.error("Lỗi hệ thống khi upload");
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="material-uploader">
      <div className="uploader-header">
        <h2>📂 Quản lý tài liệu học tập</h2>
        <p className="subtitle">Tải lên và quản lý tài liệu cho từng khóa học</p>
      </div>

      {/* Upload Form */}
      <div className="upload-card">
        <div className="form-group">
          <label>Chọn khóa học:</label>
          <select value={bookingId} onChange={(e) => setBookingId(e.target.value)}>
            <option value="">-- Chọn booking --</option>
            {(bookings || []).map((bk, index) => (
              <option key={`${bk.bookingId}-${index}`} value={bk.bookingId}>
                {dayjs(bk.date).format("DD/MM/YYYY - HH:mm")} - {bk.learnerId?.username || "Học viên"}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>File tài liệu:</label>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        </div>

        <div className="form-group">
          <label>Tiêu đề:</label>
          <input
            type="text"
            placeholder="Nhập tiêu đề tài liệu..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Mô tả:</label>
          <input
            type="text"
            placeholder="Mô tả ngắn gọn nội dung..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button className="btn-upload" onClick={handleUpload} disabled={loading}>
          {loading ? "⏳ Đang tải..." : "📤 Tải lên"}
        </button>
      </div>

      {/* Materials List */}
      <div className="materials-section">
        <h3>📘 Danh sách tài liệu</h3>
        {materials.length === 0 ? (
          <p className="empty-text">Chưa có tài liệu nào.</p>
        ) : (
          <div className="material-grid">
            {materials.map((mat, index) => (
              <div key={`${mat._id}-${index}`} className="material-card">
                <h4>{mat.title}</h4>
                <p className="desc">{mat.description || "Không có mô tả"}</p>
                <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className="file-link">
                  🔗 Xem tài liệu
                </a>
                <div className="meta">
                  <span>{mat.fileType}</span>
                  <span>{dayjs(mat.createdAt).format("DD/MM/YYYY HH:mm")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialUploader;
