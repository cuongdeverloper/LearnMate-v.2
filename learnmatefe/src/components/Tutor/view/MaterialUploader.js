import React, { useState, useEffect } from 'react';
import { uploadMaterial, getMaterialsForBooking, getTutorSchedule } from '../ApiTutor';
import './MaterialUploader.scss';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const MaterialUploader = () => {
  const tutorId = useSelector(state => state.user?.account?.id);
  const [fileUrl, setFileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [materials, setMaterials] = useState([]);
  const [bookings, setBookings] = useState([]);

  const loadBookings = async () => {
    if (!tutorId) return;
    try {
      const res = await getTutorSchedule(tutorId);
      setBookings(res);
    } catch {
      setBookings([]);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [tutorId]);

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!bookingId) {
        setMaterials([]);
        return;
      }

      try {
        const res = await getMaterialsForBooking(bookingId);
        console.log(res)
        const list = res;
        setMaterials(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("❌ Error in fetchMaterials:", error);
        setMaterials([]);
      }
    };

    fetchMaterials();
  }, [bookingId]);

  const handleUpload = async () => {
    if (!fileUrl || !title || !bookingId) {
      toast.warn('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      console.log('▶️ Uploading:', { bookingId, title, description, fileUrl });

      const res = await uploadMaterial({
        bookingId,
        title: title.trim(),
        description: description.trim(),
        fileUrl: fileUrl.trim()
      });
      if (res.errorCode === 0) {
        toast.success('Tải tài liệu thành công');
        setFileUrl('');
        setTitle('');
        setDescription('');
        const res1 = await getMaterialsForBooking(bookingId);
        console.log(res1)
        setMaterials(res1.data || []);
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
          {(bookings || []).map(bk => (
            <option key={bk.bookingId} value={bk.bookingId}>
              {dayjs(bk.date).format('DD/MM/YYYY - HH:mm')} - {bk.learnerId?.username || 'Học viên'}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Nhập link tài liệu (file URL)"
          value={fileUrl}
          onChange={e => setFileUrl(e.target.value)}
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
        {(materials || []).map(mat => (
          <div key={mat._id} className="material-item">
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
