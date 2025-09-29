import React, { useEffect, useState } from "react";
import { fetchPendingBookings, respondBooking, cancelBooking } from "../ApiTutor";
import { useSelector } from "react-redux";
import "./TutorBookingList.scss";
import { toast } from 'react-toastify';

const TutorBookingList = () => {
  const [bookings, setBookings] = useState([]);
  const tutorId = useSelector((state) => state.user.account.id);

  const loadBookings = async () => {
    try {
      const res = await fetchPendingBookings(tutorId);
      setBookings(res || []);
    } catch (error) {
      console.error("Lỗi khi load bookings:", error);
      setBookings([]);
    }
  };

  const handleResponse = async (id, action, learnerId) => {
    try {
      const res = await respondBooking(id, action, learnerId);
      toast.success(res.message || "Cập nhật thành công 🎉");
      loadBookings();
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi phản hồi booking");
    }
  };

  const handleCancel = async (id) => {
    const reason = prompt("Lý do hủy buổi học:");
    if (!reason) return;
    try {
      const res = await cancelBooking(id, reason);
      toast.success(res.message || "Đã hủy buổi học thành công");
      loadBookings();
    } catch (error) {
      toast.error(error.message || "Không thể hủy buổi học");
    }
  };

  useEffect(() => {
    loadBookings();
  }, [tutorId]);

  return (
    <div className="booking-page">
      <header className="booking-header">
        <h1>🌸 Danh sách Booking 🌸</h1>
        <p>Quản lý các buổi học đang chờ duyệt của bạn</p>
      </header>

      <div className="booking-container">
        {bookings.length === 0 ? (
          <div className="empty-state">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076507.png"
              alt="no booking"
            />
            <p>Hiện tại chưa có booking nào đang chờ duyệt 💭</p>
          </div>
        ) : (
          bookings.map((b) => (
            <div className="booking-card" key={b._id}>
              <div className="booking-info">
                <h3>{b.learnerId?.username || b.studentId}</h3>
                <span className={`status ${b.status}`}>{b.status}</span>
              </div>

              <div className="booking-actions">
                <button
                  className="btn-accept"
                  onClick={() => handleResponse(b._id, "approve", b.studentId)}
                >
                  ✔️ Duyệt
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleResponse(b._id, "cancelled", b.studentId)}
                >
                  ❌ Từ chối
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TutorBookingList;
