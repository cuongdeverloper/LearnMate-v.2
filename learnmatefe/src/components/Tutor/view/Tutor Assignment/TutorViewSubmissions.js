import React, { useEffect, useState } from "react";
import { getAssignmentSubmissions, gradeSubmittedAssignment } from "../../ApiTutor";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const TutorViewSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getAssignmentSubmissions();
      console.log(res)
      setSubmissions(res || []);
    } catch {
      toast.error("❌ Lỗi tải bài nộp!");
    }
  };

 const handleGrade = async (assignment) => {
  const { value: formValues } = await Swal.fire({
    title: "Chấm điểm bài nộp",
    html: `
      <input id="grade" class="swal2-input" placeholder="Điểm (0-10)">
      <textarea id="feedback" class="swal2-textarea" placeholder="Nhận xét..."></textarea>
    `,
    focusConfirm: false,
    preConfirm: () => ({
      grade: document.getElementById("grade").value,
      feedback: document.getElementById("feedback").value,
    }),
  });

  if (!formValues?.grade) return toast.warning("⚠️ Nhập điểm!") 
  try {
    await gradeSubmittedAssignment({
      assignmentId: assignment,          
      grade: Number(formValues.grade),
      feedback: formValues.feedback,
    });

    toast.success("✅ Đã chấm điểm!");
    fetchData();
  } catch {
    toast.error("❌ Lỗi khi chấm!");
  }
};

  return (
    <div className="assignment-card">
      <h3>📥 Danh sách bài nộp</h3>
      <table className="assignment-table">
        <thead>
          <tr>
            <th>Học viên</th>
            <th>Tiêu đề</th>
            <th>File</th>
            <th>Thời gian nộp</th>
            <th>Điểm</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s._id}>
              <td>{s.learnerId?.username}</td>
              <td>{s.assignmentId?.title}</td>
              <td>
                <a href={s.fileUrl} target="_blank" rel="noreferrer">
                  📄 Xem
                </a>
              </td>
              <td>{new Date(s.submittedAt).toLocaleString("vi-VN")}</td>
              <td>{s.grade ?? "—"}</td>
              <td>
                <button onClick={() => handleGrade(s._id)}>✏️ Chấm điểm</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TutorViewSubmissions;
