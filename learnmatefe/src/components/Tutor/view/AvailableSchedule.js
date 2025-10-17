import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  createTutorAvailability,
  deleteTutorAvailability,
  getTutorAvailability,
} from "../ApiTutor";
import Swal from "sweetalert2";

const TutorManageAvailability = () => {
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [availabilities, setAvailabilities] = useState([]); // slot rảnh trong tuần
  const [selectedSlots, setSelectedSlots] = useState([]); // slot sắp thêm
  const [isAllBusy, setIsAllBusy] = useState(false); // nếu tuần này chưa có slot nào → bận toàn tuần

  const token = useSelector((state) => state.user.account.access_token);
  const tutorId = useSelector((state) => state.user.account.id);

  const timeSlots = [
    "07:00 - 09:00",
    "09:30 - 11:30",
    "12:00 - 14:00",
    "14:30 - 16:30",
    "17:00 - 19:00",
    "19:30 - 21:30",
  ];

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const fetchAvailabilities = async () => {
    const res = await getTutorAvailability(
      weekStart.toISOString().split("T")[0]
    );
console.log(res)
    if (res.errorCode === 0) {
      const data = res.data?.data || [];
      
      setAvailabilities(data);
      // Nếu tuần này chưa có slot nào → xem như bận toàn tuần
      setIsAllBusy(data.length === 0);
    } else {
      toast.error(res.message);
    }
  };

  useEffect(() => {
    fetchAvailabilities();
  }, [weekStart]);

  const handlePrevWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
  };

  // 🟡 Khi click chọn slot
  const toggleSlot = (day, slotStr) => {
    const [startTime, endTime] = slotStr.split(" - ");
    const dateStr = day.toISOString().split("T")[0];

    const existing = availabilities.find(
      (a) =>
        new Date(a.date).toISOString().split("T")[0] === dateStr &&
        a.startTime === startTime &&
        a.endTime === endTime
    );

    // Nếu slot đã mở → click xoá
    if (existing) {
      handleDelete(existing._id);
      return;
    }

    // Nếu slot chưa có → thêm mới
    const found = selectedSlots.find(
      (s) => s.date === dateStr && s.startTime === startTime && s.endTime === endTime
    );
    if (found) {
      setSelectedSlots(selectedSlots.filter((s) => s !== found));
    } else {
      setSelectedSlots([...selectedSlots, { date: dateStr, startTime, endTime }]);
    }

    // Khi click thêm slot đầu tiên → chuyển từ “bận toàn tuần” sang có trống
    if (isAllBusy) setIsAllBusy(false);
  };

  // 🟢 Lưu slot mới
  const handleSave = async () => {
  if (!selectedSlots.length) {
    toast.warn("Chưa chọn slot nào!");
    return;
  }

  const confirm = await Swal.fire({
    title: "Xác nhận lưu lịch trống?",
    text: `Bạn có chắc muốn lưu ${selectedSlots.length} khung giờ mới không?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Lưu",
    cancelButtonText: "Huỷ",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
  });

  if (!confirm.isConfirmed) return;

  Swal.fire({
    title: "Đang lưu...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  const res = await createTutorAvailability(selectedSlots);
  Swal.close();

  if (res.errorCode === 0) {
    Swal.fire({
      icon: "success",
      title: "Đã lưu thành công!",
      text: "Các khung giờ trống đã được thêm.",
      timer: 2000,
      showConfirmButton: false,
    });
    setSelectedSlots([]);
    fetchAvailabilities();
  } else {
    Swal.fire({
      icon: "error",
      title: "Lỗi khi lưu!",
      text: res.message || "Không thể lưu lịch trống.",
    });
  }
};

const handleDelete = async (availabilityId) => {
  const confirm = await Swal.fire({
    title: "Xác nhận xoá?",
    text: "Bạn có chắc muốn xoá khung giờ này?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Xoá",
    cancelButtonText: "Huỷ",
    confirmButtonColor: "#e74c3c",
    cancelButtonColor: "#95a5a6",
  });

  if (!confirm.isConfirmed) return;

  Swal.fire({
    title: "Đang xoá...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  const res = await deleteTutorAvailability(availabilityId);
  Swal.close();

  if (res.errorCode === 0) {
    Swal.fire({
      icon: "success",
      title: "Đã xoá thành công!",
      text: "Khung giờ trống đã được xoá.",
      timer: 2000,
      showConfirmButton: false,
    });
    fetchAvailabilities();
  } else {
    Swal.fire({
      icon: "error",
      title: "Lỗi khi xoá!",
      text: res.message || "Không thể xoá khung giờ.",
    });
  }
};

  return (
    <>
      <div className="availability-wrapper">
        <h2>Quản lý lịch trống</h2>

        <div className="week-controls">
          <button onClick={handlePrevWeek}>← Tuần trước</button>
          <span>Tuần bắt đầu: {weekStart.toLocaleDateString("vi-VN")}</span>
          <button onClick={handleNextWeek}>Tuần sau →</button>
        </div>

        {isAllBusy && (
          <p style={{ color: "gray", marginTop: 8 }}>
            Tuần này bạn <strong>bận toàn bộ</strong>.  
            Hãy click vào ô trống để mở lịch.
          </p>
        )}

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
              const dateStr = day.toISOString().split("T")[0];
              return (
                <div key={idx} className="grid-day-column">
                  {timeSlots.map((slot) => {
                    const [startTime, endTime] = slot.split(" - ");
                    const existing = availabilities.find(
                      (a) =>
                        new Date(a.date).toISOString().split("T")[0] === dateStr &&
                        a.startTime === startTime &&
                        a.endTime === endTime
                    );
                    const selected = selectedSlots.find(
                      (s) =>
                        s.date === dateStr &&
                        s.startTime === startTime &&
                        s.endTime === endTime
                    );

                    const cls = existing
                      ? "available"
                      : selected
                      ? "selected"
                      : isAllBusy
                      ? "busy" // toàn tuần bận
                      : "empty";

                    return (
                      <div
                        key={`${dateStr}-${slot}`}
                        className={`schedule-slot ${cls}`}
                        onClick={() => toggleSlot(day, slot)}
                      >
                        <div className="slot-time">{slot}</div>
                        <div className="slot-status">
                          {existing
                            ? "Đã mở (bấm để xoá)"
                            : selected
                            ? "Sẽ thêm"
                            : isAllBusy
                            ? "Bận"
                            : "Trống"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {selectedSlots.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <strong>Đã chọn {selectedSlots.length} khung giờ.</strong>
            <button onClick={handleSave} className="btn btn-primary btn-save">
              Lưu lịch trống
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default TutorManageAvailability;
