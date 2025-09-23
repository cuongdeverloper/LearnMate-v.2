import React, { useState, useEffect } from 'react';
import { uploadMaterial, getMaterialsForBooking, getTutorSchedule } from '../ApiTutor';
import './MaterialUploader.scss';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const MaterialUploader = () => {
  const tutorId = useSelector(state => state.user?.account?.id);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [materials, setMaterials] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Load bookings cho tutor
  const loadBookings = async () => {
    if (!tutorId) return;
    try {
      const res = await getTutorSchedule(tutorId);
      // Loại bỏ duplicate bookingId
      const uniqueBookings = Array.isArray(res)
        ? [...new Map(res.map(bk => [bk.bookingId, bk])).values()]
        : [];
      setBookings(uniqueBookings);
    } catch {
      setBookings([]);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [tutorId]);

  // Load materials khi chọn booking
  useEffect(() => {
    const fetchMaterials = async () => {
      if (!bookingId) {
        setMaterials([]);
        return;
      }

      try {
        const res = await getMaterialsForBooking(bookingId);
        const list = Array.isArray(res?.data) ? res.data : [];
        // Loại bỏ duplicate _id
        const uniqueMaterials = [...new Map(list.map(mat => [mat._id, mat])).values()];
        setMaterials(uniqueMaterials);
      } catch (error) {
        console.error("❌ Error in fetchMaterials:", error);
        setMaterials([]);
      }
    };

    fetchMaterials();
  }, [bookingId]);

  const handleUpload = async () => {
  if (!file || !title || !bookingId) {
    toast.warn('Vui lòng nhập đầy đủ thông tin');
    return;
  }

  try {
    const res = await uploadMaterial({ bookingId, title, description, file });
    console.log(res)
    if (res.errorCode === 0) {
      toast.success('Tải tài liệu thành công');
      setFile(null);
      setTitle('');
      setDescription('');

      // Refresh materials
      const materialsRes = await getMaterialsForBooking(bookingId);
      const list = Array.isArray(materialsRes?.data) ? materialsRes.data : [];
      const uniqueMaterials = [...new Map(list.map(mat => [mat._id, mat])).values()];
      setMaterials(uniqueMaterials);
    } else {
      toast.error(res.message || 'Lỗi upload');
    }
  } catch (err) {
    toast.error('Lỗi hệ thống khi upload');
    console.error('Upload error:', err);
  }
};


  return (
    <div className="material-uploader">
      <h3>📂 Tải tài liệu học tập</h3>
      <div className="form-upload">
        <select value={bookingId} onChange={e => setBookingId(e.target.value)}>
          <option value="">-- Chọn booking --</option>
          {(bookings || []).map((bk, index) => (
            <option key={`${bk.bookingId}-${index}`} value={bk.bookingId}>
              {dayjs(bk.date).format('DD/MM/YYYY - HH:mm')} - {bk.learnerId?.username || 'Học viên'}
            </option>
          ))}
        </select>

        <input
          type="file"
          onChange={e => setFile(e.target.files[0])}
        />
        <input
          type="text"
          placeholder="Tiêu đề tài liệu"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Mô tả tài liệu"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button onClick={handleUpload}>📤 Tải lên</button>
      </div>

      <div className="material-list">
        <h4>Danh sách tài liệu đã upload</h4>
        {materials.length === 0 && <p>Chưa có tài liệu nào.</p>}
        {(materials || []).map((mat, index) => (
          <div key={`${mat._id}-${index}`} className="material-item">
            <div><b>_id:</b> {mat._id}</div>
            <div><b>bookingId:</b> {mat.bookingId}</div>
            <div><b>title:</b> {mat.title}</div>
            <div><b>description:</b> {mat.description}</div>
            <div>
              <b>fileUrl:</b>{' '}
              <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer">
                {mat.fileUrl}
              </a>
            </div>
            <div><b>fileType:</b> {mat.fileType}</div>
            <div><b>uploadDate:</b> {new Date(mat.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialUploader;
