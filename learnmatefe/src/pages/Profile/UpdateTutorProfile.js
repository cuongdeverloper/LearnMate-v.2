import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import {
  ApiGetMyTutor,
  ApiUpdateTutor,
  ApiGetAllSubjects,
} from "../../Service/ApiService/ApiTutor";
import "./UpdateTutorProfile.scss";

const animatedComponents = makeAnimated();

const UpdateTutorProfile = ({ onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    bio: "",
    subjects: [],
    pricePerHour: "",
    location: "",
    languages: [],
  });

  const [allSubjects, setAllSubjects] = useState([]);
  const [tutorId, setTutorId] = useState(null);

  // ✅ Fetch tutor info + subjects
  useEffect(() => {
    const fetchTutorAndSubjects = async () => {
      try {
        const [tutorRes, subjectsRes] = await Promise.all([
          ApiGetMyTutor(),
          ApiGetAllSubjects(),
        ]);

        const tutorData = tutorRes;
        const subjects = subjectsRes || [];

        if (tutorData) {
          setTutorId(tutorData._id);
          setFormData({
            bio: tutorData.bio || "",
            subjects: tutorData.subjects?.map((s) => s._id) || [],
            pricePerHour: tutorData.pricePerHour || "",
            location: tutorData.location || "",
            languages: tutorData.languages || [],
          });
        }

        setAllSubjects(subjects);
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải dữ liệu gia sư hoặc môn học.");
      }
    };

    fetchTutorAndSubjects();
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle multi-select change (React Select)
  const handleSubjectsChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      subjects: selectedOptions.map((opt) => opt.value),
    }));
  };

  // ✅ Handle languages input
  const handleLanguagesChange = (e) => {
    const langs = e.target.value.split(",").map((l) => l.trim());
    setFormData((prev) => ({ ...prev, languages: langs }));
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tutorId) return toast.error("Không tìm thấy ID gia sư.");

    try {
      const res = await ApiUpdateTutor(tutorId, formData);
      toast.success("Cập nhật thông tin gia sư thành công!");
      onUpdate?.(res);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.message || "Cập nhật thất bại.");
    }
  };

  return (
    <div className="update-tutor-form">
      <h3>Cập nhật thông tin Gia sư</h3>
      <form onSubmit={handleSubmit}>
        {/* Bio */}
        <div className="form-group">
          <label>Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Giới thiệu ngắn gọn về bản thân..."
          />
        </div>

        {/* Subjects */}
        <div className="form-group">
          <label>Subjects</label>
          <Select
            isMulti
            closeMenuOnSelect={false}
            components={animatedComponents}
            options={allSubjects.map((s) => ({
              value: s._id,
              label: `${s.name} (${s.classLevel})`,
            }))}
            value={allSubjects
              .filter((s) => formData.subjects.includes(s._id))
              .map((s) => ({
                value: s._id,
                label: `${s.name} (${s.classLevel})`,
              }))}
            onChange={handleSubjectsChange}
            placeholder="Chọn môn dạy..."
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Price per hour */}
        <div className="form-group">
          <label>Price per hour (VND)</label>
          <input
            type="number"
            name="pricePerHour"
            value={formData.pricePerHour}
            onChange={handleChange}
            placeholder="VD: 200000"
          />
        </div>

        {/* Location */}
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="VD: TP.HCM, Hà Nội..."
          />
        </div>

        {/* Languages */}
        <div className="form-group">
          <label>Languages (comma separated)</label>
          <input
            type="text"
            value={formData.languages.join(", ")}
            onChange={handleLanguagesChange}
            placeholder="VD: English, Vietnamese"
          />
        </div>

        {/* Buttons */}
        <div className="button-group">
          <button type="submit" className="btn btn-primary">
            Lưu
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateTutorProfile;
