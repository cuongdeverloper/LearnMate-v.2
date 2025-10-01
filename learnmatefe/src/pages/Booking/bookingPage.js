// BookingPage.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../Service/AxiosCustomize";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../scss/BookingPage.scss";
import { useSelector } from "react-redux";
import { getUserBalance } from "../../Service/ApiService/ApiUser";
import { getReviewsByTutor, getTutorById } from "../../Service/ApiService/ApiTutor";
import Header from "../../components/Layout/Header/Header";
import { ApiCreateConversation } from "../../Service/ApiService/ApiMessage";

export default function BookingPage() {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [numberOfSessions, setNumberOfSessions] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [balance, setBalance] = useState(null);
  const [note, setNote] = useState("");
  const [reviews, setReviews] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [mode, setMode] = useState("longterm"); // longterm | availability
  const [availabilities, setAvailabilities] = useState([]); // list of availability objects from BE
  const [selectedSlots, setSelectedSlots] = useState([]); // array of availability IDs

  // weekStart as a Date object (Monday)
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const weekStartDate = new Date(today.setDate(diff));
    weekStartDate.setHours(0, 0, 0, 0);
    return weekStartDate;
  });

  const userId = useSelector((state) => state.user.account.id);
  const token = useSelector((state) => state.user.account.access_token);
  const navigate = useNavigate();

  // exact time slots you requested
  const timeSlots = [
    "07:00 - 09:00",
    "09:30 - 11:30",
    "12:00 - 14:00",
    "14:30 - 16:30",
    "17:00 - 19:00",
    "19:30 - 21:30",
  ];

  const handleChatNow = async () => {
    try {
      const res = await ApiCreateConversation(tutor.user._id);
      if (res) {
        navigate(`/messenger/${res._id}`);
      } else {
        toast.error("Không thể tạo cuộc trò chuyện");
      }
    } catch (err) {
      console.error("Lỗi tạo cuộc trò chuyện:", err);
      toast.error("Lỗi khi bắt đầu trò chuyện");
    }
  };

  // initial data: tutor, balance, reviews
  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const res = await getTutorById(tutorId);
        if (res?.tutor) {
          setTutor(res.tutor);
          setSubjects(res.tutor.subjects || []);
        } else {
          toast.error("Không thể tải thông tin gia sư");
        }
      } catch (err) {
        toast.error("Lỗi khi tải thông tin gia sư");
      }
    };

    const fetchBalance = async () => {
      try {
        const b = await getUserBalance();
        if (b !== null && b !== undefined) setBalance(b);
      } catch (err) {
        toast.error("Không thể lấy thông tin số dư");
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await getReviewsByTutor(tutorId);
        if (res) setReviews(res);
      } catch (err) {
        console.error("Lỗi khi tải review:", err);
        toast.error("Lỗi khi tải đánh giá");
      }
    };

    if (tutorId) {
      fetchTutor();
      fetchBalance();
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorId]);

  // fetch availabilities for the tutor for current weekStart
  const fetchAvailabilities = async () => {
    if (!tutorId || !weekStart) return;
    try {
      // pass weekStart to backend so it can filter per week if API supports it
      const params = { weekStart: weekStart.toISOString().split("T")[0] };
      const res = await axios.get(`/api/tutor/${tutorId}/availability`, { params });
      const body = res?.data ?? res;
      console.log(body);

      // tolerate several response shapes:
      if (Array.isArray(body)) {
        setAvailabilities(body);
      } else if (body?.success) {
        // assume body.data is array
        setAvailabilities(Array.isArray(body.data) ? body.data : []);
      } else if (Array.isArray(body?.data)) {
        setAvailabilities(body.data);
      } else if (Array.isArray(body?.availabilities)) {
        setAvailabilities(body.availabilities);
      } else {
        // fallback empty
        setAvailabilities([]);
      }
      // clear selectedSlots when availabilities change (to avoid stale ids)
      setSelectedSlots([]);
    } catch (err) {
      console.error("fetchAvailabilities err:", err);
      toast.error("Lỗi khi tải lịch trống");
      setAvailabilities([]);
    }
  };

  // whenever user switches to availability mode or changes weekStart, reload availabilities
  useEffect(() => {
    if (mode === "availability") {
      fetchAvailabilities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, tutorId, weekStart]);

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const handlePrevWeek = () => {
    const prevWeek = new Date(weekStart);
    prevWeek.setDate(weekStart.getDate() - 7);
    setWeekStart(prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(weekStart);
    nextWeek.setDate(weekStart.getDate() + 7);
    setWeekStart(nextWeek);
  };

  const handleBooking = async () => {
    if (!selectedSubject) {
      toast.warn("Vui lòng chọn môn học");
      return;
    }

    if (mode === "longterm" && (!numberOfSessions || numberOfSessions <= 0)) {
      toast.warn("Vui lòng nhập số buổi học hợp lệ");
      return;
    }

    if (mode === "availability" && selectedSlots.length === 0) {
      toast.warn("Vui lòng chọn ít nhất 1 lịch trống");
      return;
    }

    setLoading(true);
    try {
      const totalAmount =
        tutor.pricePerHour *
        (mode === "longterm" ? numberOfSessions : selectedSlots.length);

      if (balance < totalAmount) {
        toast.error("Số dư không đủ để thanh toán");
        setLoading(false);
        return;
      }

      // call backend to create booking (pass schedule availability ids)
      const res = await axios.post(
        `/api/learner/bookings/${tutorId}`,
        {
          amount: totalAmount,
          numberOfSessions:
            mode === "longterm" ? numberOfSessions : selectedSlots.length,
          note,
          subjectId: selectedSubject,
          option: mode === "availability" ? "schedule" : "longterm", // thêm option
          availabilityIds: mode === "availability" ? selectedSlots : [], // đổi key cho đúng BE
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const body = res?.data ?? res;
      if (body?.success || body?.booking) {
        toast.success("Đặt lịch thành công!");
        // update balance locally if possible
        setBalance((prev) => (typeof prev === "number" ? prev - totalAmount : prev));
        // refresh availabilities so booked slots become unavailable
        await fetchAvailabilities();
        setSelectedSlots([]);
      } else {
        toast.error(body?.message || "Đặt lịch thất bại");
      }
    } catch (err) {
      console.error("Lỗi đặt lịch:", err);
      toast.error(err?.response?.data?.message || err.message || "Đặt lịch thất bại");
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const handleShowConfirm = () => {
    setShowConfirmModal(true);
  };

  const toggleSlot = (slotId) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]
    );
  };

  const renderTutorInfo = () => {
    const user = tutor?.user;
    return (
      <div className="tutor-confirm">
        <img
          src={
            user?.image ||
            `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 70) + 1}`
          }
          alt="avatar"
          className="avatar"
        />
        <div className="tutor-details">
          <h3>{user?.username || "Không rõ tên"}</h3>
          <p>
            <strong>Email:</strong> {user?.email || "Không rõ"}
          </p>
          <p>
            <strong>SĐT:</strong> {user?.phoneNumber || "Không rõ"}
          </p>
          <p>
            <strong>Giới tính:</strong> {user?.gender || "Không rõ"}
          </p>
          <p>
            <strong>Môn:</strong>{" "}
            {subjects && subjects.length > 0
              ? subjects.map((sub) => `${sub.name} (${sub.classLevel})`).join(", ")
              : "Không rõ"}
          </p>
          <p>
            <strong>Giá:</strong> {tutor?.pricePerHour?.toLocaleString()} VND / giờ
          </p>
          <p>
            <strong>Mô tả:</strong> {tutor?.description || "Không có mô tả"}
          </p>
          <button className="btn btn-secondary" onClick={handleChatNow}>
            Trò chuyện ngay
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="booking-wrapper">
        {/* Left Panel: Reviews */}
        <div className="side-panel left-panel">
          <h3>Đánh giá từ học viên</h3>
          {reviews.length ? (
            <ul className="review-list">
              {reviews.map((r) => (
                <li key={r._id}>
                  {r.user?.username || "Ẩn danh"}: {r.comment}
                </li>
              ))}
            </ul>
          ) : (
            <p>Chưa có đánh giá nào.</p>
          )}
        </div>

        {/* Center */}
        <div className="booking-container">
          <div className="booking-card">
            <h2>Xác nhận đặt lịch học</h2>

            {tutor ? renderTutorInfo() : <p>Đang tải...</p>}

            {/* Subject select */}
            <div className="form-group">
              <label>Chọn môn học</label>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                <option value="">--Chọn môn--</option>
                {subjects.map((sub, idx) => (
                  <option key={idx} value={sub._id}>
                    {sub.name} ({sub.classLevel})
                  </option>
                ))}
              </select>
            </div>

            {/* Mode select */}
            <div className="form-group">
              <label>Hình thức đặt lịch</label>
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value);
                }}
              >
                <option value="longterm">Đặt lâu dài (theo số buổi)</option>
                <option value="availability">Chọn theo lịch trống</option>
              </select>
            </div>

            {mode === "longterm" && (
              <div className="form-group">
                <label>Số buổi học</label>
                <input
                  type="number"
                  min={1}
                  value={numberOfSessions}
                  onChange={(e) => setNumberOfSessions(Number(e.target.value))}
                />
              </div>
            )}

            {mode === "availability" && (
              <div className="form-group">
                <label>Chọn lịch trống</label>

                <div className="week-controls">
                  <button onClick={handlePrevWeek}>← Tuần trước</button>
                  <span>Tuần bắt đầu: {weekStart.toLocaleDateString("vi-VN")}</span>
                  <button onClick={handleNextWeek}>Tuần sau →</button>
                </div>

                <div className="weekly-schedule-grid">
                  <div className="grid-header">
                    {getWeekDays().map((day, idx) => (
                      <div key={idx} className="grid-header-day">
                        {day.toLocaleDateString("vi-VN", {
                          weekday: "short",
                          day: "numeric",
                          month: "numeric",
                        })}
                      </div>
                    ))}
                  </div>

                  <div className="grid-body">
                    {getWeekDays().map((day, idx) => {
                      const dayStr = day.toISOString().split("T")[0];

                      return (
                        <div key={idx} className="grid-day-column">
                          {timeSlots.map((slotStr) => {
                            const [startTime, endTime] = slotStr.split(" - ").map((s) => s.trim());
                            // find availability object for this date/time
                            const avail = availabilities.find((a) => {
                              const aDate = new Date(a.date).toISOString().split("T")[0];
                              return aDate === dayStr && a.startTime === startTime && a.endTime === endTime;
                            });

                            const isSelected = !!(avail && selectedSlots.includes(avail._id));
                            // if backend returns booking info on availability
                            const isBooked = !!(avail && (avail.bookingId || avail.isBooked));

                            const cls = !avail ? "not-available" : isBooked ? "booked" : isSelected ? "selected" : "available";

                            return (
                              <div
                                key={`${dayStr}-${slotStr}`}
                                className={`schedule-slot ${cls}`}
                                onClick={() => {
                                  if (!avail) {
                                    // not available (tutor didn't open this slot)
                                    toast.info("Khung giờ này gia sư bận.");
                                    return;
                                  }
                                  if (isBooked) {
                                    toast.info("Khung giờ này đã được đặt.");
                                    return;
                                  }
                                  toggleSlot(avail._id);
                                }}
                              >
                                <div className="slot-time">{startTime} - {endTime}</div>
                                <div className="slot-status">
                                  {!avail ? (
                                    <small>Not available</small>
                                  ) : isBooked ? (
                                    <small>Đã đặt</small>
                                  ) : isSelected ? (
                                    <small>Đã chọn</small>
                                  ) : (
                                    <small>Trống</small>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <strong>Đã chọn:</strong> {selectedSlots.length} ô
                </div>
              </div>
            )}

            {/* Note */}
            <div className="form-group">
              <label>Ghi chú</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)}></textarea>
            </div>

            {/* Balance */}
            <div className="form-group">
              <label>Số dư tài khoản</label>
              <input type="text" value={balance !== null && balance !== undefined ? balance.toLocaleString() + " VND" : ""} disabled />
            </div>

            <button onClick={handleShowConfirm} disabled={loading || !tutor} className="btn-booking">
              {loading ? "Đang xử lý..." : "Trừ tiền & Đặt lịch"}
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="side-panel right-panel">
          <h3>Cam kết từ gia sư</h3>
          <div className="guarantee-section">
            <div className="guarantee-item">
              <h4>Đúng giờ</h4>
              <p>Gia sư luôn đến đúng giờ đã hẹn</p>
            </div>
            <div className="guarantee-item">
              <h4>Chuẩn bị kỹ</h4>
              <p>Chuẩn bị bài học cẩn thận, phù hợp trình độ</p>
            </div>
            <div className="guarantee-item">
              <h4>Hỗ trợ tận tình</h4>
              <p>Luôn sẵn sàng giải đáp thắc mắc của học viên</p>
            </div>
          </div>
        </div>

        {/* Confirm modal */}
        {showConfirmModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Xác nhận đặt lịch</h3>
              <p>
                Bạn có chắc muốn đặt{" "}
                {mode === "longterm" ? numberOfSessions : selectedSlots.length}{" "}
                buổi với tổng số tiền{" "}
                {(tutor?.pricePerHour *
                  (mode === "longterm" ? numberOfSessions : selectedSlots.length)
                ).toLocaleString()}{" "}
                VND?
              </p>
              {note && <p>Ghi chú: {note}</p>}
              <div className="modal-actions">
                <button className="btn btn-confirm" onClick={handleBooking} disabled={loading}>
                  Xác nhận
                </button>
                <button className="btn btn-cancel" onClick={() => setShowConfirmModal(false)} disabled={loading}>
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
