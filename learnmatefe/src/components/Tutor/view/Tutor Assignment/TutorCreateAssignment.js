import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { getSubjectsByTutor, getAssignmentStorage, createAssignmentStorage } from "../../ApiTutor";
import "./TutorAssignment.scss";

const TutorCreateAssignment = () => {
  const [subjects, setSubjects] = useState([]);
  const [assignmentStorageList, setAssignmentStorageList] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const [subRes, storageRes] = await Promise.all([
          getSubjectsByTutor(),
          getAssignmentStorage(),
        ]);
        setSubjects(subRes.subjects || []);
        setAssignmentStorageList(storageRes.data || []);
      } catch {
        toast.error("❌ Lỗi tải dữ liệu!");
      }
    };
    initData();
  }, []);

  const handleCreate = async () => {
    if (!selectedSubject || !title.trim() || !file) {
      return toast.warning("⚠️ Vui lòng nhập tiêu đề, chọn môn và file!");
    }

    const formData = new FormData();
    formData.append("subjectId", selectedSubject.value);
    formData.append("title", title);
    formData.append("topic", topic);
    formData.append("description", description);
    formData.append("file", file);

    setLoading(true);
    try {
      await createAssignmentStorage(formData);
      toast.success("✅ Tạo Assignment Storage thành công!");
      setTitle(""); setTopic(""); setDescription(""); setFile(null); setSelectedSubject(null);
      const updated = await getAssignmentStorage();
      setAssignmentStorageList(updated.data || []);
    } catch {
      toast.error("❌ Lỗi khi tạo Assignment Storage");
    } finally {
      setLoading(false);
    }
  };

  const subjectOptions = subjects.map(s => ({ value: s._id, label: s.name }));

  return (
    <div className="assignment-card">
      <h3>📂 Tạo Assignment Storage</h3>

      <div className="form-row">
        <Select
          options={subjectOptions}
          value={selectedSubject}
          onChange={setSelectedSubject}
          placeholder="Chọn môn học"
        />
        <input
          type="text"
          placeholder="Tiêu đề bài tập"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <input
        type="text"
        placeholder="Topic (tùy chọn)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <textarea
        placeholder="Mô tả (tùy chọn)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="form-row">
        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleCreate} disabled={loading}>
          {loading ? "Đang tạo..." : "💾 Lưu Assignment"}
        </button>
      </div>

      <h4>📘 Danh sách Assignment đã tạo</h4>
      <ul>
        {assignmentStorageList.map((a) => (
          <li key={a._id}>{a.title} — {a.subjectId?.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default TutorCreateAssignment;
