import React, { useState } from 'react';
import Header from '../Layout/Header/Header';
import Footer from '../Layout/Footer/Footer';
import './TutorApplicationForm.scss';

// Import the new API function
import { submitTutorApplication } from '../../Service/ApiService'; // Adjust path if needed

const classSubjectsMap = {
  1: ["Toán", "Tiếng Việt"],
  2: ["Toán", "Tiếng Việt", "Tiếng Anh"],
  3: ["Toán", "Tiếng Việt", "Tiếng Anh"],
  4: ["Toán", "Tiếng Việt", "Tiếng Anh", "Khoa học"],
  5: ["Toán", "Tiếng Việt", "Tiếng Anh", "Khoa học", "Lịch Sử", "Địa Lý"],
  6: ["Toán", "Ngữ Văn", "Tiếng Anh", "Vật Lý", "Lịch Sử", "Địa Lý"],
  7: ["Toán", "Ngữ Văn", "Tiếng Anh", "Vật Lý", "Hóa Học", "Sinh Học", "Lịch Sử", "Địa Lý"],
  8: ["Toán", "Ngữ Văn", "Tiếng Anh", "Vật Lý", "Hóa Học", "Sinh Học", "Lịch Sử", "Địa Lý"],
  9: ["Toán", "Ngữ Văn", "Tiếng Anh", "Vật Lý", "Hóa Học", "Sinh Học", "Lịch Sử", "Địa Lý"],
  10: ["Toán", "Ngữ Văn", "Tiếng Anh", "Vật Lý", "Hóa Học", "Sinh Học", "Tin Học", "Lịch Sử", "Địa Lý", "GDCD"],
  11: ["Toán", "Ngữ Văn", "Tiếng Anh", "Vật Lý", "Hóa Học", "Sinh Học", "Tin Học", "Lịch Sử", "Địa Lý", "GDCD"],
  12: ["Toán", "Ngữ Văn", "Tiếng Anh", "Vật Lý", "Hóa Học", "Sinh Học", "Tin Học", "Lịch Sử", "Địa Lý", "GDCD"],
};

const classOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const timeSlots = [
  "07:00 - 09:00",
  "09:30 - 11:30",
  "12:00 - 14:00",
  "14:30 - 16:30",
  "17:00 - 19:00",
  "19:30 - 21:30",
];

const TutorApplicationForm = () => {
  const [formData, setFormData] = useState({
    experience: '',
    education: '',
    subjects: [],
    bio: '',
    pricePerHour: '',
    location: '',
    languages: '',
    certificates: '',
    classes: [],
    availableTimes: [],
    cvFile: null
  });
  const [message, setMessage] = useState(null);

  const [groupedFilteredSubjects, setGroupedFilteredSubjects] = useState({});

  React.useEffect(() => {
    const newGroupedSubjects = {};
    formData.classes.sort((a, b) => parseInt(a) - parseInt(b)).forEach(cls => {
      if (classSubjectsMap[cls]) {
        newGroupedSubjects[cls] = classSubjectsMap[cls];
      }
    });
    setGroupedFilteredSubjects(newGroupedSubjects);

    setFormData(prev => {
      const availableSubjects = Object.values(newGroupedSubjects).flat();
      const updatedSubjects = prev.subjects.filter(subject =>
        availableSubjects.includes(subject)
      );
      return { ...prev, subjects: updatedSubjects };
    });

  }, [formData.classes]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleClassToggle = cls => {
    setFormData(prev => {
      const classes = new Set(prev.classes);
      classes.has(cls) ? classes.delete(cls) : classes.add(cls);
      return { ...prev, classes: Array.from(classes) };
    });
  };

  const handleSubjectToggle = subject => {
    setFormData(prev => {
      const subjects = new Set(prev.subjects);
      subjects.has(subject) ? subjects.delete(subject) : subjects.add(subject);
      return { ...prev, subjects: Array.from(subjects) };
    });
  };

  const handleSlotChange = (day, slot, checked) => {
    setFormData(prev => {
      const current = [...prev.availableTimes];
      const value = { day, slot };
      const exists = current.some(item => item.day === day && item.slot === slot);
      const updated = checked
        ? exists ? current : [...current, value]
        : current.filter(item => !(item.day === day && item.slot === slot));
      return { ...prev, availableTimes: updated };
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage(null); // Clear previous messages

    // --- FRONTEND VALIDATION ---
    const requiredFields = [
      { field: 'experience', label: 'Kinh nghiệm' },
      { field: 'education', label: 'Học vấn' },
      { field: 'bio', label: 'Giới thiệu bản thân' },
      { field: 'pricePerHour', label: 'Giá mỗi giờ' },
      { field: 'location', label: 'Địa điểm' },
      { field: 'cvFile', label: 'CV' },
    ];

    for (const { field, label } of requiredFields) {
      if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
        setMessage(`❌ Vui lòng điền đầy đủ thông tin: ${label}.`);
        return; // Stop submission
      }
    }

    // Additional checks for arrays
    if (formData.classes.length === 0) {
      setMessage('❌ Vui lòng chọn ít nhất một khối lớp bạn có thể dạy.');
      return;
    }
    if (formData.subjects.length === 0) {
      setMessage('❌ Vui lòng chọn ít nhất một môn học bạn muốn dạy.');
      return;
    }
    if (formData.availableTimes.length === 0) {
      setMessage('❌ Vui lòng chọn ít nhất một khung thời gian rảnh.');
      return;
    }

    try {
      const result = await submitTutorApplication(formData);

      if (result.success) {
        setMessage('✅ Nộp đơn thành công! Chờ admin duyệt.');
        // Optionally, reset form data here
        setFormData({
            experience: '',
            education: '',
            subjects: [],
            bio: '',
            pricePerHour: '',
            location: '',
            languages: '',
            certificates: '',
            classes: [],
            availableTimes: [],
            cvFile: null
        });
      } else {
        // Display the specific error message from the backend
        setMessage(`❌ ${result.message}`);
        console.error('API Error:', result.error);
      }
    } catch (err) {
      console.error('Unexpected error from API call (frontend catch block):', err);
      setMessage('❌ Đã xảy ra lỗi không mong muốn khi nộp đơn. Vui lòng thử lại.');
    }
  };

  return (
    <>
      <Header />
      <div className="application-container">
        <h2>Đăng ký trở thành gia sư</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <label>Kinh nghiệm: <span style={{ color: 'red' }}>*</span></label>
          <textarea name="experience" value={formData.experience} onChange={handleChange} required />

          <label>Học vấn: <span style={{ color: 'red' }}>*</span></label>
          <textarea name="education" value={formData.education} onChange={handleChange} required />

          <label>Chọn khối lớp bạn có thể dạy: <span style={{ color: 'red' }}>*</span></label>
          <div className="checkbox-group class-selection">
            {classOptions.map(cls => (
              <label key={cls}>
                <input
                  type="checkbox"
                  value={cls}
                  checked={formData.classes.includes(cls)}
                  onChange={() => handleClassToggle(cls)}
                />
                Lớp {cls}
              </label>
            ))}
          </div>

          {Object.keys(groupedFilteredSubjects).length > 0 && (
            <>
              <label>Chọn môn học bạn muốn dạy (tương ứng với lớp đã chọn): <span style={{ color: 'red' }}>*</span></label>
              <div className="checkbox-group subject-selection">
                {Object.entries(groupedFilteredSubjects).map(([cls, subjects]) => (
                  <div key={cls} className={`class-subject-group class-${cls}`}>
                    <h3>Lớp {cls}</h3>
                    <div className="subjects-for-class">
                      {subjects.map(subj => (
                        <label key={`${cls}-${subj}`}>
                          <input
                            type="checkbox"
                            value={subj}
                            checked={formData.subjects.includes(subj)}
                            onChange={() => handleSubjectToggle(subj)}
                          />
                          {subj}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <label>Giới thiệu bản thân: <span style={{ color: 'red' }}>*</span></label>
          <textarea name="bio" value={formData.bio} onChange={handleChange} required />

          <label>Giá mỗi giờ (VND): <span style={{ color: 'red' }}>*</span></label>
          <input type="number" name="pricePerHour" value={formData.pricePerHour} onChange={handleChange} required />

          <label>Địa điểm: <span style={{ color: 'red' }}>*</span></label>
          <input name="location" value={formData.location} onChange={handleChange} required />

          <label>Ngôn ngữ (phân cách dấu phẩy):</label>
          <input name="languages" value={formData.languages} onChange={handleChange} />

          <label>Chứng chỉ (phân cách dấu phẩy):</label>
          <input name="certificates" value={formData.certificates} onChange={handleChange} />

          <label>Thời gian rảnh: <span style={{ color: 'red' }}>*</span></label>
          <div className="time-slot-grid">
            <div className="grid-header">
              <div></div>
              {timeSlots.map(slot => <div key={slot}>{slot}</div>)}
            </div>
            {days.map(day => (
              <div className="grid-row" key={day}>
                <div className="day-label">{day}</div>
                {timeSlots.map(slot => {
                  const checked = formData.availableTimes.some(t => t.day === day && t.slot === slot);
                  return (
                    <label key={`${day}-${slot}`} className="slot-cell">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => handleSlotChange(day, slot, e.target.checked)}
                      />
                    </label>
                  );
                })}
              </div>
            ))}
          </div>

          <label>CV (PDF): <span style={{ color: 'red' }}>*</span></label>
          <input type="file" name="cvFile" accept=".pdf" onChange={handleChange} required />

          <button type="submit" className="btn-primary">Gửi đơn</button>
        </form>
        {message && <div className="application-message">{message}</div>}
      </div>
      <Footer />
    </>
  );
};

export default TutorApplicationForm;