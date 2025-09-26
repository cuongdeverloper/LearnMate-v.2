import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../scss/MyCourses.scss"; // Assuming this SCSS handles tab styling
import {
  finishBooking,
  getMaterialsByBookingId,
  getMyBookings,
  reportBooking, // Make sure this is correctly imported
} from "../../Service/ApiService/ApiBooking";
import {
  getMyWeeklySchedules,
  markScheduleAttendance,
} from "../../Service/ApiService/ApiSchedule";

import { useNavigate } from "react-router-dom";

// Component Modal xác nhận tùy chỉnh (unchanged)
const ConfirmationModal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal-content">
        <div className="confirmation-modal-header">
          <h2>{title}</h2>
        </div>
        <p>{message}</p>
        <div className="confirmation-modal-actions">
          <button onClick={onConfirm} className="confirm-btn">
            Xác nhận
          </button>
          <button onClick={onCancel} className="cancel-btn">
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
};

// Component Modal hiển thị tài liệu (unchanged)
const MaterialsModal = ({ bookingTitle, materials, onClose }) => {
  return (
    <div className="materials-modal-overlay">
      <div className="materials-modal-content">
        <div className="materials-modal-header">
          <h2>Tài liệu học tập: {bookingTitle}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="materials-modal-body">
          {materials.length === 0 ? (
            <p className="no-materials">
              Chưa có tài liệu nào cho khóa học này.
            </p>
          ) : (
            <ul className="materials-list">
              {materials.map((material) => (
                <li key={material._id} className="material-item">
                  <h4 className="material-title">{material.title}</h4>
                  {material.description && (
                    <p className="material-description">
                      {material.description}
                    </p>
                  )}
                  <div className="material-actions">
                    <a
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="material-link"
                    >
                      Xem tài liệu{" "}
                      <span className="material-type">
                        ({material.fileType})
                      </span>
                    </a>
                    <a
                      href={material.fileUrl}
                      download={material.title || "document"}
                      className="download-btn"
                    >
                      Tải xuống
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// NEW: ReportModal component, moved outside MyCourses
const ReportModal = ({ isOpen, onClose, onSubmit, bookingId }) => {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do báo cáo.");
      return;
    }
    onSubmit({ bookingId, reason });
    setReason("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="report-modal-overlay">
      <div className="report-modal-content">
        <h3>Báo cáo khóa học</h3>
        <textarea
          placeholder="Lý do bạn muốn báo cáo..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={onClose}>Hủy</button>
          <button onClick={handleSubmit}>Gửi báo cáo</button>
        </div>
      </div>
    </div>
  );
};

function MyCourses() {
  const navigate = useNavigate();
  const getWeekStart = () => {
    const today = new Date();
    const day = today.getDay();
    // Calculate Monday of the current week
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const weekStartDate = new Date(today.setDate(diff));
    weekStartDate.setHours(0, 0, 0, 0); // Set to start of the day in local time
    return weekStartDate;
  };

  const [bookings, setBookings] = useState([]);
  const [allWeeklySchedules, setAllWeeklySchedules] = useState([]);
  const [weekStart, setWeekStart] = useState(getWeekStart());
  const token = useSelector((state) => state.user.account.access_token);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [errorBookings, setErrorBookings] = useState(null);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [errorSchedules, setErrorSchedules] = useState(null);

  // States for Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingBookingId, setReportingBookingId] = useState(null);

  // States cho Confirmation Modal (điểm danh)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [currentScheduleToMark, setCurrentScheduleToMark] = useState(null);
  const [currentAttendedStatus, setCurrentAttendedStatus] = useState(false);

  // States cho Materials Modal (tài liệu)
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [materialsData, setMaterialsData] = useState([]);
  const [selectedBookingTitle, setSelectedBookingTitle] = useState("");

  // --- NEW STATE for tabs ---
  const [activeTab, setActiveTab] = useState("inProgress"); // 'inProgress' or 'finished'
  // --- END NEW STATE ---

  useEffect(() => {
    fetchBookings();
    fetchAllWeeklySchedules();
  }, [token, weekStart]);

  // Handlers for Report Modal
  const handleOpenReportModal = (bookingId) => {
    setReportingBookingId(bookingId);
    setShowReportModal(true);
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setReportingBookingId(null);
  };

  const handleSubmitReport = async ({ bookingId, reason }) => {
    try {
      // Ensure reportBooking sends the correct targetType ('booking')
      const res = await reportBooking(bookingId, reason);
      if (res.success) {
        toast.success("Báo cáo đã được gửi.");
        fetchBookings(); // Refetch bookings to update the "Đã báo cáo" button
      } else {
        toast.error(res.message || "Gửi báo cáo thất bại.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi gửi báo cáo.");
    } finally {
      handleCloseReportModal(); // Always close modal after submission attempt
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    setErrorBookings(null);
    try {
      const res = await getMyBookings();
      console.log(res);
      setBookings(res.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Không thể tải danh sách khóa học. Vui lòng thử lại.");
      setErrorBookings("Không thể tải danh sách khóa học. Vui lòng thử lại.");
    } finally {
      setLoadingBookings(false);
    }
  };

  // ✅ Hàm hoàn tất khóa học
  const handleFinishBooking = async (bookingId) => {
    const result = await finishBooking(bookingId);

    if (result.success) {
      toast.success(
        result.message ||
          "Khóa học đã hoàn tất, tiền đã được chuyển cho gia sư."
      );
      fetchBookings();
    } else {
      toast.error(result.message || "Lỗi hoàn tất khóa học.");
    }
  };

  const fetchAllWeeklySchedules = async () => {
    setLoadingSchedules(true);
    setErrorSchedules(null);

    const result = await getMyWeeklySchedules(weekStart);

    if (result.success) {
      setAllWeeklySchedules(result.data);
    } else {
      toast.error(result.message);
      setErrorSchedules(result.message);
    }

    setLoadingSchedules(false);
  };

  // Handler for marking attendance
  const handleConfirmAttendanceClick = (scheduleId, attendedStatus) => {
    setCurrentScheduleToMark(scheduleId);
    setCurrentAttendedStatus(attendedStatus);
    setShowConfirmationModal(true);
  };

  const processMarkAttendance = async () => {
    setShowConfirmationModal(false);
    const scheduleId = currentScheduleToMark;
    const newAttendedStatus = !currentAttendedStatus;

    // Optimistic UI update
    setAllWeeklySchedules((prev) =>
      prev.map((slot) =>
        slot._id === scheduleId
          ? { ...slot, attended: newAttendedStatus }
          : slot
      )
    );

    const result = await markScheduleAttendance(scheduleId, newAttendedStatus);

    if (result.success) {
      toast.success(
        newAttendedStatus
          ? "Điểm danh thành công!"
          : "Hủy điểm danh thành công!"
      );

      // Nếu có thông tin bookingId => refetch bookings
      const bookingId = result.data?.schedule?.bookingId;
      if (bookingId) {
        fetchBookings();
      }
    } else {
      // Revert optimistic update
      setAllWeeklySchedules((prev) =>
        prev.map((slot) =>
          slot._id === scheduleId
            ? { ...slot, attended: currentAttendedStatus }
            : slot
        )
      );
      toast.error(`Lỗi điểm danh: ${result.message}`);
    }

    // Reset state
    setCurrentScheduleToMark(null);
    setCurrentAttendedStatus(false);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmationModal(false);
    setCurrentScheduleToMark(null);
    setCurrentAttendedStatus(false);
  };

  // Handler để hiển thị modal tài liệu
  const handleViewMaterialsClick = async (bookingId, bookingTitle) => {
    setSelectedBookingTitle(bookingTitle);
    setMaterialsData([]); // Xoá tài liệu cũ
    setShowMaterialsModal(true); // Mở modal trước

    const result = await getMaterialsByBookingId(bookingId);

    if (result.success) {
      setMaterialsData(result.data);
      if (result.data.length === 0) {
        toast.info("Khóa học này hiện chưa có tài liệu nào.");
      }
    } else {
      toast.error(result.message);
      setShowMaterialsModal(false); // Đóng modal nếu lỗi
    }
  };
  // Handler để đóng modal tài liệu
  const handleCloseMaterialsModal = () => {
    setShowMaterialsModal(false);
    setMaterialsData([]);
    setSelectedBookingTitle("");
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "numeric",
      month: "numeric",
    });
  };

  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

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

  const renderFullWeekGrid = () => {
    const days = getWeekDays();

    return (
      <div className="weekly-schedule-grid">
        <div className="grid-header">
          {days.map((day, index) => (
            <div key={index} className="grid-header-day">
              <span className="weekday">{formatDate(day).split(",")[0]}</span>
              <span className="date">{formatDate(day).split(",")[1]}</span>
            </div>
          ))}
        </div>
        <div className="grid-body">
          {days.map((day, index) => {
            const dayMonthYear = `${day.getFullYear()}-${(day.getMonth() + 1)
              .toString()
              .padStart(2, "0")}-${day.getDate().toString().padStart(2, "0")}`;

            const slotsForDay = allWeeklySchedules.filter((s) => {
              const sDate = new Date(s.date);
              const sDayMonthYear = `${sDate.getFullYear()}-${(
                sDate.getMonth() + 1
              )
                .toString()
                .padStart(2, "0")}-${sDate
                .getDate()
                .toString()
                .padStart(2, "0")}`;

              return sDayMonthYear === dayMonthYear;
            });

            return (
              <div key={index} className="grid-day-column">
                {slotsForDay.length === 0 ? (
                  <p className="no-schedule">Trống</p>
                ) : (
                  slotsForDay.map((slot) => {
                    const sessionDatePart = new Date(slot.date)
                      .toISOString()
                      .split("T")[0];
                    const sessionStartTime = new Date(
                      `${sessionDatePart}T${slot.startTime}:00`
                    );
                    const sessionEndTime = new Date(
                      `${sessionDatePart}T${slot.endTime}:00`
                    );
                    const now = new Date();

                    const isSessionInCurrentWeek =
                      sessionStartTime >= weekStart &&
                      sessionStartTime < addDays(weekStart, 7);

                    // Allow attendance button if session is in the past, or currently ongoing, or (for some flexibility) in the current displayed week
                    const shouldShowAttendanceButton =
                      sessionEndTime < now ||
                      (sessionStartTime <= now && now <= sessionEndTime) ||
                      isSessionInCurrentWeek;

                    return (
                      <div
                        key={slot._id}
                        className={`schedule-slot ${
                          slot.attended ? "attended" : ""
                        }`}
                      >
                        <span className="time">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        {slot.bookingId &&
                          slot.bookingId.tutorId &&
                          slot.bookingId.tutorId.user && (
                            <span className="tutor-name">
                              Gia sư: {slot.bookingId.tutorId.user.username}
                            </span>
                          )}
                        {shouldShowAttendanceButton && (
                          <button
                            className={`attendance-button ${
                              slot.attended
                                ? "attended-btn"
                                : "not-attended-btn"
                            }`}
                            onClick={() =>
                              handleConfirmAttendanceClick(
                                slot._id,
                                slot.attended
                              )
                            }
                            title={
                              slot.attended ? "Đã điểm danh" : "Chưa điểm danh"
                            }
                          >
                            {slot.attended ? "✓" : "✖"}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Filter bookings based on activeTab
  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "inProgress") {
      return !booking.completed;
    } else if (activeTab === "finished") {
      return booking.completed;
    }
    return false; // Should not happen
  });

  return (
    <>
      <div className="my-courses-container">
        <h2 className="section-title">Khoá học của tôi</h2>

        <div className="tabs-navigation">
          <button
            className={`tab-button ${
              activeTab === "inProgress" ? "active" : ""
            }`}
            onClick={() => setActiveTab("inProgress")}
          >
            Đang học
          </button>
          <button
            className={`tab-button ${activeTab === "finished" ? "active" : ""}`}
            onClick={() => setActiveTab("finished")}
          >
            Đã hoàn thành
          </button>
        </div>

        <div className="bookings-list">
          {filteredBookings.length === 0 ? (
            <p className="no-bookings">
              {activeTab === "inProgress"
                ? "Bạn không có khóa học nào đang diễn ra."
                : "Bạn không có khóa học nào đã hoàn thành."}
            </p>
          ) : (
            filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className={`booking-card ${
                  booking.completed ? "completed" : ""
                } ${booking.reported ? "reported" : ""}`}
              >
                <p>
                  <strong>Gia sư:</strong>{" "}
                  {booking.tutorId?.user?.username || "N/A"}
                </p>
                <p>
                  <strong>Số buổi học:</strong> {booking.numberOfSessions}
                </p>
                <p>
                  <strong>Số tiền:</strong>{" "}
                  {booking.amount.toLocaleString("vi-VN")} VNĐ
                </p>

                {booking.completed && (
                  <>
                    <p className="completed-message">Khóa học đã hoàn tất 🎉</p>
                    <button
                      className="review-button"
                      onClick={() =>
                        navigate(`/review/${booking._id}`, {
                          state: {
                            tutorId: booking.tutorId?._id || booking.tutorId,
                          },
                        })
                      }
                    >
                      Viết đánh giá
                    </button>
                  </>
                )}

                <button
                  className="view-materials-button"
                  onClick={() =>
                    handleViewMaterialsClick(
                      booking._id,
                      `Khóa học với ${
                        booking.tutorId?.user?.username || "Gia sư"
                      }`
                    )
                  }
                >
                  Xem tài liệu
                </button>

                {/* Report and Finish Booking Buttons */}
                {!booking.completed && (
                  <div className="booking-actions">
                    <button
                      className="finish-course-button"
                      onClick={() => handleFinishBooking(booking._id)}
                    >
                      Hoàn tất khóa học
                    </button>

                    {booking.reported ? ( // Assuming `booking.reported` is a boolean from your API
                      <button className="report-button reported" disabled>
                        Đã báo cáo
                      </button>
                    ) : (
                      <button
                        className="report-button"
                        onClick={() => handleOpenReportModal(booking._id)} // Open modal
                      >
                        Báo cáo
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <h3 className="section-subtitle">Lịch học tổng quan tuần này</h3>

        <div className="week-navigation">
          <button onClick={handlePrevWeek} className="nav-button">
            &lt; Tuần trước
          </button>
          <span>
            Tuần từ {formatDate(weekStart)} -{" "}
            {formatDate(addDays(weekStart, 6))}
          </span>
          <button onClick={handleNextWeek} className="nav-button">
            Tuần sau &gt;
          </button>
        </div>

        {loadingSchedules ? (
          <p className="loading-message">Đang tải lịch học...</p>
        ) : errorSchedules ? (
          <p className="error-message">{errorSchedules}</p>
        ) : (
          renderFullWeekGrid()
        )}

        {/* Conditional rendering của ConfirmationModal */}
        {showConfirmationModal && (
          <ConfirmationModal
            title={
              currentAttendedStatus
                ? "Xác nhận Hủy Điểm Danh"
                : "Xác nhận Điểm Danh"
            }
            message={
              currentAttendedStatus
                ? "Bạn có chắc chắn muốn HỦY điểm danh buổi học này không?"
                : "Bạn có chắc chắn muốn ĐIỂM DANH buổi học này không?"
            }
            onConfirm={processMarkAttendance}
            onCancel={handleCancelConfirmation}
          />
        )}

        {/* Conditional rendering của MaterialsModal */}
        {showMaterialsModal && (
          <MaterialsModal
            bookingTitle={selectedBookingTitle}
            materials={materialsData}
            onClose={handleCloseMaterialsModal}
          />
        )}

        {/* Conditional rendering of ReportModal */}
        {showReportModal && (
          <ReportModal
            isOpen={showReportModal}
            onClose={handleCloseReportModal}
            onSubmit={handleSubmitReport}
            bookingId={reportingBookingId}
          />
        )}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </>
  );
}

export default MyCourses;
