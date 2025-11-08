import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";
import { getMyAssignments, deleteAssignedAssignment } from "../../ApiTutor";
import "./TutorAssignment.scss";

const TutorManageAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [learnerOptions, setLearnerOptions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await getMyAssignments();
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      if (data.length === 0) {
        toast.info("Chưa có assignment nào!");
        setAssignments([]);
        setFilteredAssignments([]);
        setSubjectOptions([]);
        setLearnerOptions([]);
        return;
      }

      const subjectOptions = [
        ...new Set(data.map((a) => a.subjectId?.name || "Khác")),
      ].map((name) => ({ label: name, value: name }));

      const learnerOptions = [
        ...new Set(data.map((a) => a.learnerId?.username || "Không rõ")),
      ].map((username) => ({ label: username, value: username }));

      setAssignments(data);
      setFilteredAssignments(data);
      setSubjectOptions(subjectOptions);
      setLearnerOptions(learnerOptions);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách assignment!");
    } finally {
      setLoading(false);
    }
  };

  // Bộ lọc
  useEffect(() => {
    let filtered = [...assignments];
    if (selectedSubject)
      filtered = filtered.filter(
        (a) => a.subjectId?.name === selectedSubject.value
      );
    if (selectedLearner)
      filtered = filtered.filter(
        (a) => a.learnerId?.username === selectedLearner.value
      );
    if (statusFilter)
      filtered = filtered.filter((a) => a.status === statusFilter.value);
    setFilteredAssignments(filtered);
  }, [selectedSubject, selectedLearner, statusFilter, assignments]);

  // Xoá với SweetAlert2
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Xác nhận xoá?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#95a5a6",
    });

    if (!confirm.isConfirmed) return;

    try {
      let res = await deleteAssignedAssignment(id);
      console.log(res)
      setAssignments((prev) => prev.filter((a) => a._id !== id));
      toast.success("Đã xoá assignment!");
    } catch (error) {
      console.error(error);
      toast.error("Xoá thất bại!");
    }
  };

  const statusOptions = [
    { value: "pending", label: "Chưa nộp" },
    { value: "submitted", label: "Đã nộp" },
    { value: "graded", label: "Đã chấm" },
  ];

  return (
    <div className="tutor-manage-assignment">
      <div className="header">
        <h2>📚 Quản lý Assignment</h2>
        <p>Kiểm soát các bài tập đã giao cho học viên</p>
      </div>

      {/* Bộ lọc */}
      <div className="filter-bar">
        <Select
          placeholder="🎯 Môn học"
          options={subjectOptions}
          value={selectedSubject}
          onChange={setSelectedSubject}
          isClearable
        />
        <Select
          placeholder="👩‍🎓 Học viên"
          options={learnerOptions}
          value={selectedLearner}
          onChange={setSelectedLearner}
          isClearable
        />
        <Select
          placeholder="📄 Trạng thái"
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          isClearable
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="loading-container">
          <ClipLoader color="#3498db" size={50} />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <p className="no-data">Không có assignment nào phù hợp.</p>
      ) : (
        <div className="assignment-table-container">
          <table className="assignment-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Môn học</th>
                <th>Học viên</th>
                <th>Ngày giao</th>
                <th>Hạn nộp</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((a) => (
                <tr key={a._id}>
                  <td>{a.title}</td>
                  <td>
                    {a.subjectId
                      ? `${a.subjectId.name} ${a.subjectId.classLevel || ""}`
                      : "—"}
                  </td>
                  <td>{a.learnerId?.username || "—"}</td>
                  <td>
                    {a.openTime
                      ? new Date(a.openTime).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td>
                    {a.deadline
                      ? new Date(a.deadline).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Không có"}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        a.status === "graded"
                          ? "graded"
                          : a.status === "submitted"
                          ? "submitted"
                          : "pending"
                      }`}
                    >
                      {a.status || (a.submitted ? "Đã nộp" : "Chưa nộp")}
                    </span>
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(a._id)}
                    >
                      🗑️ Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TutorManageAssignment;
