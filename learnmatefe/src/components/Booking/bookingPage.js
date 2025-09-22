import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../Service/AxiosCustomize';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../scss/BookingPage.scss';
import { useSelector } from "react-redux";
import { ApiCreateConversation, getReviewsByTutor, getTutorById, getUserBalance } from '../../Service/ApiService';
import Header from '../Layout/Header/Header';

export default function BookingPage() {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [numberOfSessions, setNumberOfSessions] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [balance, setBalance] = useState(null);
  const [note, setNote] = useState(''); // State for the note
  const [reviews, setReviews] = useState([]);
  const userId = useSelector((state) => state.user.account.id);
  const token = useSelector((state) => state.user.account.access_token);
  const navigate = useNavigate();

  const handleChatNow = async () => {
    try {
      const res = await ApiCreateConversation(tutor.user._id);
      if (res) {
        navigate(`/messenger/${res._id}`);


      } else {
        toast.error("Không thể tạo cuộc trò chuyện");
      }
    } catch (err) {
      console.error("Lỗi tạo cuộc trò chuyện:", err);
      toast.error("Lỗi khi bắt đầu trò chuyện");
    }
  };

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const res = await getTutorById(tutorId);
        if (res?.tutor) {
          setTutor(res.tutor);
        } else {
          toast.error('Không thể tải thông tin gia sư');
        }
      } catch (err) {
        toast.error('Lỗi khi tải thông tin gia sư');
      }
    };

    const fetchBalance = async () => {
      const balance = await getUserBalance();
      if (balance !== null) {
        setBalance(balance);
      } else {
        toast.error('Không thể lấy thông tin số dư');
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await getReviewsByTutor(tutorId);
        if (res) {
          setReviews(res);
        }
      } catch (err) {
        console.error('Lỗi khi tải review:', err);
        toast.error('Lỗi khi tải đánh giá');
      }
    };

    fetchTutor();
    fetchBalance();
    fetchReviews();
  }, [tutorId, userId, token]);
  const renderReviews = () => {
    if (!reviews.length) {
      return <p>Chưa có đánh giá nào cho gia sư này.</p>;
    }

    return (
      <ul className="review-list">
        {reviews.map((review) => (
          <li key={review._id} className="review-item">
            <p>
              <strong>{review.user?.username || "Người dùng ẩn danh"}</strong>: {review.comment}
            </p>
            <p>Đánh giá: {"⭐".repeat(review.rating)}</p>
          </li>
        ))}
      </ul>
    );
  };

  const handleBooking = async () => {
    if (!numberOfSessions || numberOfSessions <= 0) {
      toast.warn('Vui lòng nhập số buổi học hợp lệ');
      return;
    }

    setLoading(true);
    try {
      const totalAmount = tutor.pricePerHour * numberOfSessions;

      if (balance < totalAmount) {
        toast.error('Số dư không đủ để thanh toán');
        setLoading(false);
        return;
      }

      const res = await axios.post(
        `/bookings/${tutorId}`,
        {
          amount: totalAmount,
          numberOfSessions,
          note, // Include the note in the request
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.success) {
        toast.success('Đặt lịch thành công và đã trừ tiền từ số dư!');
        setBalance(prev => prev - totalAmount); // Update balance locally
      } else {
        toast.error(res.message || 'Đặt lịch thất bại');
      }
    } catch (err) {
      console.error('Lỗi đặt lịch:', err);
      toast.error(err.response?.data?.message || err.message || 'Đặt lịch thất bại');
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const handleShowConfirm = () => {
    if (!numberOfSessions || numberOfSessions <= 0) {
      toast.warn('Vui lòng nhập số buổi học hợp lệ');
      return;
    }
    setShowConfirmModal(true);
  };

  const renderTutorInfo = () => {
    const user = tutor?.user;
    return (
      <div className="tutor-confirm">
        <img
          src={
            user?.image ||
            `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 70) + 1}`
          }
          alt="avatar"
          className="avatar"
        />
        <div className="tutor-details">
          <h3>{user?.username || 'Không rõ tên'}</h3>
          <p><strong>Email:</strong> {user?.email || 'Không rõ'}</p>
          <p><strong>SĐT:</strong> {user?.phoneNumber || 'Không rõ'}</p>
          <p><strong>Giới tính:</strong> {user?.gender || 'Không rõ'}</p>
          <p><strong>Môn:</strong> {tutor.subjects || 'Không rõ'}</p>
          <p><strong>Giá:</strong> {tutor.pricePerHour?.toLocaleString()} VND / giờ</p>
          <p><strong>Mô tả:</strong> {tutor.description || 'Không có mô tả'}</p>
          <button className='btn btn-secondary' onClick={handleChatNow}>Trò chuyện ngay</button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="booking-wrapper">
      {/* Left Panel: Đánh giá */}
      <div className="side-panel left-panel">
  <h3>Đánh giá từ học viên</h3>
  {renderReviews()}
</div>

      {/* Center: Thông tin gia sư + đặt lịch */}
      <div className="booking-container">
        <div className="booking-card">
          <h2>Xác nhận đặt lịch học</h2>

          {tutor ? renderTutorInfo() : <p>Đang tải thông tin gia sư...</p>}

          <div className="form-group">
            <label htmlFor="numberOfSessions">Số buổi học</label>
            <input
              id="numberOfSessions"
              type="number"
              min={1}
              value={numberOfSessions}
              onChange={(e) => setNumberOfSessions(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="totalAmount">Tổng số tiền thanh toán (VND)</label>
            <input
              id="totalAmount"
              type="text"
              value={(tutor?.pricePerHour * numberOfSessions)?.toLocaleString() || ''}
              disabled
            />
          </div>

          {/* New form group for the note */}
          <div className="form-group">
            <label htmlFor="note">Ghi chú cho gia sư (ví dụ: thời gian rảnh, yêu cầu đặc biệt)</label>
            <textarea
              id="note"
              rows="4"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Em muốn học vào buổi tối các ngày thứ 3, 5. Em cần gia sư tập trung vào phần ngữ pháp..."
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="balance">Số dư tài khoản</label>
            <input
              id="balance"
              type="text"
              value={balance !== null ? balance.toLocaleString() + ' VND' : '...'}
              disabled
            />
          </div>

          <button
            onClick={handleShowConfirm}
            disabled={loading || !tutor}
            className="btn-booking"
          >
            {loading ? 'Đang xử lý...' : 'Trừ tiền & Đặt lịch'}
          </button>
        </div>
      </div>

      {/* Right Panel: Cam kết */}
      <div className="side-panel right-panel">
  <h3>Cam kết từ gia sư</h3>
  <div className="guarantee-section">
    <div className="guarantee-item">
      <h4>⏰ Thời gian & Tính kỷ luật</h4>
      <p>Gia sư luôn đúng giờ, không nghỉ đột xuất. Buổi học được đảm bảo đúng lịch, thông báo trước ít nhất 24h nếu có thay đổi.</p>
    </div>
    <div className="guarantee-item">
      <h4>📚 Chất lượng bài giảng</h4>
      <p>Bài học được chuẩn bị trước, phù hợp trình độ và mục tiêu học sinh. Có lộ trình rõ ràng và tài liệu hỗ trợ.</p>
    </div>
    <div className="guarantee-item">
      <h4>💬 Hỗ trợ ngoài giờ</h4>
      <p>Luôn sẵn sàng giải đáp thắc mắc qua tin nhắn hoặc video call ngắn. Học sinh có thể gửi bài tập mọi lúc.</p>
    </div>
    <div className="guarantee-item">
      <h4>📈 Cam kết hiệu quả</h4>
      <p>Sau 4 tuần, học sinh sẽ thấy sự tiến bộ rõ rệt về kỹ năng, điểm số hoặc sự tự tin khi học. Nếu không, hỗ trợ học thêm miễn phí.</p>
    </div>
    <div className="guarantee-item">
      <h4>🤝 Cá nhân hóa & Thích nghi</h4>
      <p>Luôn lắng nghe phụ huynh và học sinh để điều chỉnh phương pháp, tốc độ học cho phù hợp nhất.</p>
    </div>
  </div>
</div>

      {/* Modal Xác nhận */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Xác nhận đặt lịch</h3>
            <p>Bạn có chắc muốn đặt **{numberOfSessions} buổi học** với tổng số tiền **{(tutor?.pricePerHour * numberOfSessions).toLocaleString()} VND**?</p>
            {note && <p className="modal-note">Ghi chú của bạn: _{note}_</p>} {/* Display the note in the modal */}
            <div className="modal-actions">
              <button
                className="btn btn-confirm"
                onClick={handleBooking}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
              <button
                className="btn btn-cancel"
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>

  );
}