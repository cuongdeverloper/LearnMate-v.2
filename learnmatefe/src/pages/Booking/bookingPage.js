// BookingPage.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../Service/AxiosCustomize";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../scss/BookingPage.scss";
import { useSelector } from "react-redux";
import { getUserBalance } from "../../Service/ApiService/ApiUser";
import {
  getReviewsByTutor,
  getTutorById,
} from "../../Service/ApiService/ApiTutor";
import Header from "../../components/Layout/Header/Header";
import { ApiCreateConversation } from "../../Service/ApiService/ApiMessage";

export default function BookingPage() {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [numberOfMonths, setNumberOfMonths] = useState(1);
  const [depositOption, setDepositOption] = useState(30); // % cọc
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [balance, setBalance] = useState(null);
  const [note, setNote] = useState("");
  const [reviews, setReviews] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [availabilities, setAvailabilities] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [addressDetail, setAddressDetail] = useState("");
  const [province, setProvince] = useState("");

  const provinces = [
    "An Giang",
    "Bà Rịa - Vũng Tàu",
    "Bắc Giang",
    "Bắc Kạn",
    "Bạc Liêu",
    "Bắc Ninh",
    "Bến Tre",
    "Bình Dương",
    "Bình Định",
    "Bình Phước",
    "Bình Thuận",
    "Cà Mau",
    "Cao Bằng",
    "Đắk Lắk",
    "Đắk Nông",
    "Điện Biên",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "Hà Giang",
    "Hà Nam",
    "Hà Nội",
    "Hà Tĩnh",
    "Hải Dương",
    "Hải Phòng",
    "Hậu Giang",
    "Hòa Bình",
    "Hưng Yên",
    "Khánh Hòa",
    "Kiên Giang",
    "Kon Tum",
    "Lai Châu",
    "Lâm Đồng",
    "Lạng Sơn",
    "Lào Cai",
    "Long An",
    "Nam Định",
    "Nghệ An",
    "Ninh Bình",
    "Ninh Thuận",
    "Phú Thọ",
    "Phú Yên",
    "Quảng Bình",
    "Quảng Nam",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Sóc Trăng",
    "Sơn La",
    "Tây Ninh",
    "Thái Bình",
    "Thái Nguyên",
    "Thanh Hóa",
    "Thừa Thiên Huế",
    "Tiền Giang",
    "TP Hồ Chí Minh",
    "Trà Vinh",
    "Tuyên Quang",
    "Vĩnh Long",
    "Vĩnh Phúc",
    "Yên Bái",
    "Đà Nẵng",
    "Cần Thơ",
  ];

  const userId = useSelector((state) => state.user.account.id);
  const token = useSelector((state) => state.user.account.access_token);
  const navigate = useNavigate();

  const timeSlots = [
    "07:00 - 09:00",
    "09:30 - 11:30",
    "12:00 - 14:00",
    "14:30 - 16:30",
    "17:00 - 19:00",
    "19:30 - 21:30",
  ];

  // Lấy ngày hiện tại làm tuần gốc
  const [weekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const weekStartDate = new Date(today.setDate(diff));
    weekStartDate.setHours(0, 0, 0, 0);
    return weekStartDate;
  });

  const handleChatNow = async () => {
    try {
      const res = await ApiCreateConversation(tutor.user._id);
      if (res) navigate(`/messenger/${res._id}`);
      else toast.error("Không thể tạo cuộc trò chuyện");
    } catch (err) {
      toast.error("Lỗi khi bắt đầu trò chuyện");
    }
  };

  // Load dữ liệu gia sư, số dư, đánh giá
  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const res = await getTutorById(tutorId);
        if (res?.tutor) {
          setTutor(res.tutor);
          setSubjects(res.tutor.subjects || []);
        } else toast.error("Không thể tải thông tin gia sư");
      } catch {
        toast.error("Lỗi khi tải thông tin gia sư");
      }
    };
    const fetchBalance = async () => {
      try {
        const b = await getUserBalance();
        if (b !== null && b !== undefined) setBalance(b);
      } catch {
        toast.error("Không thể lấy thông tin số dư");
      }
    };
    const fetchReviews = async () => {
      try {
        const res = await getReviewsByTutor(tutorId);
        if (res) setReviews(res);
      } catch {
        toast.error("Lỗi khi tải đánh giá");
      }
    };
    if (tutorId) {
      fetchTutor();
      fetchBalance();
      fetchReviews();
    }
  }, [tutorId]);

  // Lấy lịch trống tuần hiện tại (chỉ tuần gốc, không chuyển tuần)
  const fetchAvailabilities = async () => {
    if (!tutorId || !weekStart) return;
    try {
      const params = { weekStart: weekStart.toISOString().split("T")[0] };
      const res = await axios.get(`/api/tutor/${tutorId}/availability`, {
        params,
      });
      const body = res?.data ?? res;
      if (Array.isArray(body)) setAvailabilities(body);
      else if (Array.isArray(body?.data)) setAvailabilities(body.data);
      else if (Array.isArray(body?.availabilities))
        setAvailabilities(body.availabilities);
      else setAvailabilities([]);
      setSelectedSlots([]);
    } catch {
      toast.error("Lỗi khi tải lịch trống");
      setAvailabilities([]);
    }
  };

  useEffect(() => {
    fetchAvailabilities();
  }, [tutorId, weekStart]);

  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + ((i - today.getDay() + 7) % 7));
      days.push(day);
    }
    return days;
  };

  const toggleSlot = (slotId) =>
    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );

  const handleBooking = async () => {
    if (!selectedSubject) return toast.warn("Vui lòng chọn môn học");
    if (selectedSlots.length === 0)
      return toast.warn("Vui lòng chọn ít nhất 1 lịch trống");
    if (!province || !addressDetail)
      return toast.warn("Vui lòng nhập địa chỉ học");
    setLoading(true);
    try {
      const totalSessions = selectedSlots.length * numberOfMonths * 4; // tự nhân 4 tuần/tháng
      const totalAmount = tutor.pricePerHour * totalSessions;
      const deposit = Math.round(totalAmount * (depositOption / 100));
      const remaining = totalAmount - deposit;
      const monthlyPayment = Math.round(remaining / numberOfMonths);

      if (balance < deposit) {
        toast.error(`Số dư không đủ để đặt cọc (${depositOption}%)`);
        setLoading(false);
        return;
      }

      const address = `${addressDetail}, ${province}`.trim();

      const res = await axios.post(
        `/api/learner/bookings/${tutorId}`,
        {
          amount: totalAmount,
          numberOfMonths,
          note,
          subjectId: selectedSubject,
          availabilityIds: selectedSlots,
          addressDetail,
          province,
          depositOption,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const body = res?.data ?? res;
      if (body?.success || body?.bookingId) {
        toast.success("Đặt lịch thành công!");
        setBalance((prev) =>
          typeof prev === "number" ? prev - deposit : prev
        );
        await fetchAvailabilities();
        setSelectedSlots([]);
      } else toast.error(body?.message || "Đặt lịch thất bại");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Đặt lịch thất bại");
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const renderTutorInfo = () => {
    const user = tutor?.user;
    return (
      <div className="tutor-confirm">
        <img
          src={
            user?.image ||
            `https://i.pravatar.cc/100?img=${
              Math.floor(Math.random() * 70) + 1
            }`
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
            {subjects?.length
              ? subjects.map((s) => `${s.name} (${s.classLevel})`).join(", ")
              : "Không rõ"}
          </p>
          <p>
            <strong>Giá:</strong> {tutor?.pricePerHour?.toLocaleString()} VND /
            giờ
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

  const totalSessions = selectedSlots.length * numberOfMonths * 4;
  const totalAmount = tutor ? tutor.pricePerHour * totalSessions : 0;
  const deposit = Math.round(totalAmount * (depositOption / 100));
  const remaining = totalAmount - deposit;
  const monthlyPayment =
    numberOfMonths > 0 ? Math.round(remaining / numberOfMonths) : 0;

  return (
    <>
      <Header />
      <div className="booking-wrapper">
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

        <div className="booking-container">
          <div className="booking-card">
            <h2>Xác nhận đặt lịch học</h2>
            {tutor ? renderTutorInfo() : <p>Đang tải...</p>}

            <div className="form-group">
              <label>Chọn môn học</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">--Chọn môn--</option>
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name} ({sub.classLevel})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Số tháng học</label>
              <input
                type="number"
                min={1}
                value={numberOfMonths}
                onChange={(e) => setNumberOfMonths(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Chọn phần trăm cọc</label>
              <select
                value={depositOption}
                onChange={(e) => setDepositOption(Number(e.target.value))}
              >
                <option value={30}>30%</option>
                <option value={60}>60%</option>
              </select>
            </div>

            <div className="form-group">
              <label>Chọn lịch trống</label>
              <div className="weekly-schedule-grid">
                <div className="grid-header">
                  {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(
                    (dayName, idx) => (
                      <div key={idx} className="grid-header-day">
                        {dayName}
                      </div>
                    )
                  )}
                </div>

                <div className="grid-body">
                  {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(
                    (dayName, idx) => {
                      return (
                        <div key={idx} className="grid-day-column">
                          {timeSlots.map((slotStr) => {
                            const [startTime, endTime] = slotStr
                              .split(" - ")
                              .map((s) => s.trim());
                            // map dayName sang dayOfWeek: T2->1, ..., CN->0
                            const dayOfWeek = idx === 6 ? 0 : idx + 1;
                            const avail = availabilities.find(
                              (a) =>
                                a.dayOfWeek === dayOfWeek &&
                                a.startTime === startTime &&
                                a.endTime === endTime
                            );
                            const isSelected =
                              avail && selectedSlots.includes(avail._id);
                            const isBooked =
                              avail && (avail.bookingId || avail.isBooked);
                            const cls = !avail
                              ? "not-available"
                              : isBooked
                              ? "booked"
                              : isSelected
                              ? "selected"
                              : "available";
                            return (
                              <div
                                key={`${dayName}-${slotStr}`}
                                className={`schedule-slot ${cls}`}
                                onClick={() => {
                                  if (!avail)
                                    return toast.info(
                                      "Khung giờ này gia sư bận."
                                    );
                                  if (isBooked)
                                    return toast.info(
                                      "Khung giờ này đã được đặt."
                                    );
                                  toggleSlot(avail._id);
                                }}
                              >
                                <div className="slot-time">{slotStr}</div>
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
                    }
                  )}
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <strong>Đã chọn:</strong> {selectedSlots.length} ô
              </div>
            </div>

            <div className="form-group">
              <label>Địa chỉ chi tiết</label>
              <input
                type="text"
                placeholder="Nhập địa chỉ chi tiết"
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Chọn tỉnh/thành</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              >
                <option value="">--Chọn tỉnh/thành--</option>
                {provinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Ghi chú</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
            </div>

            <div className="form-group">
              <label>Số dư tài khoản</label>
              <input
                type="text"
                value={
                  balance !== null && balance !== undefined
                    ? balance.toLocaleString() + " VND"
                    : ""
                }
                disabled
              />
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={loading || !tutor}
              className="btn-booking"
            >
              {loading ? "Đang xử lý..." : "Đặt lịch học"}
            </button>
          </div>
        </div>

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
              <p>Luôn sẵn sàng giải đáp và hỗ trợ học viên</p>
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Xác nhận đặt lịch</h3>
            <p>Bạn có chắc chắn muốn đặt lịch học với gia sư này?</p>
            <p>
              <strong>Số buổi học:</strong> {totalSessions}
            </p>
            <p>
              <strong>Số tháng học:</strong> {numberOfMonths}
            </p>
            <p>
              <strong>Tổng tiền:</strong> {totalAmount.toLocaleString()} VND
            </p>
            <p>
              <strong>Phần trăm cọc:</strong> {depositOption}%
            </p>
            <p>
              <strong>Số tiền cọc:</strong> {deposit.toLocaleString()} VND
            </p>
            <p>
              <strong>Tiền trả hàng tháng:</strong>{" "}
              {monthlyPayment.toLocaleString()} VND
            </p>

            <div className="modal-actions">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn btn-secondary"
              >
                Hủy
              </button>
              <button
                onClick={handleBooking}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
