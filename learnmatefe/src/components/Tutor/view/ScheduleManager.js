import React, { useState, useEffect } from "react";
import {
  createSchedule,
  getTutorSchedule,
  deleteSchedule,
  fetchStudentsApi,
  getBookingsByTutorId,
} from "../ApiTutor";
import { useSelector } from "react-redux";
import "./ScheduleManager.scss";

const ScheduleManager = () => {
  const tutorId = useSelector((state) => state.user.account.id);
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({
    learnerId: "",
    day: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const loadSchedules = async () => {
    const res = await getTutorSchedule(tutorId);
    console.log(res)
    setSchedules(res);
  };

 const loadBookings = async () => {
    try {
      const res = await getBookingsByTutorId(tutorId);
      console.log("Bookings:", res);
      setBookings(res);
    } catch (error) {
      console.error("Failed to load bookings:", error);
    }
  };
 useEffect(() => {
    if (tutorId) {
      loadBookings();
    }
  }, [tutorId]);
  const fetchStudents = async () => {
    try {
      const res = await fetchStudentsApi();
      setStudents(res);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    }
  };

  const handleSubmit = async () => {
    try {
      await createSchedule(tutorId, form);
      setForm({ learnerId: "", day: "", date: "", startTime: "", endTime: "" });
      loadSchedules();
    } catch (err) {
      console.error("Error adding schedule:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSchedule(id);
      loadSchedules();
    } catch (err) {
      console.error("Error deleting schedule:", err);
    }
  };

  useEffect(() => {
    loadSchedules();
    fetchStudents();
  }, [tutorId]);

  return (
    <div className="schedule-manager">
      <h3>📅 Quản lý Lịch học</h3>

      <div className="form-row">
        <select
          value={form.learnerId}
          onChange={(e) => setForm({ ...form, learnerId: e.target.value })}
        >
          <option value="">Chọn học viên</option>
          {students.map((stu) => (
            <option key={stu._id} value={stu._id}>
              {stu.username} ({stu.email})
            </option>
          ))}
        </select>
        <select
          value={form.day}
          onChange={(e) => setForm({ ...form, day: e.target.value })}
        >
          <option value="">Chọn ngày</option>
          <option value="Monday">Thứ 2</option>
          <option value="Tuesday">Thứ 3</option>
          <option value="Wednesday">Thứ 4</option>
          <option value="Thursday">Thứ 5</option>
          <option value="Friday">Thứ 6</option>
          <option value="Saturday">Thứ 7</option>
          <option value="Sunday">Chủ nhật</option>
        </select>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <input
          type="time"
          value={form.startTime}
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
        />
        <input
          type="time"
          value={form.endTime}
          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
        />
        <button onClick={handleSubmit}>➕ Thêm lịch</button>
      </div>

      <ul className="schedule-list">
        {schedules.map((s) => {
          // Format date as DD/MM/YYYY for better display
          const formattedDate = s.date
            ? new Date(s.date).toLocaleDateString("vi-VN")
            : "";
          return (
            <li key={s._id}>
              <div>
                <strong>{formattedDate}</strong>: {s.startTime} - {s.endTime} với{" "}
                <strong>{s.learnerId?.username || s.learnerId.name}</strong>
              </div>
              <button onClick={() => handleDelete(s._id)}>🗑️ Xoá</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ScheduleManager;