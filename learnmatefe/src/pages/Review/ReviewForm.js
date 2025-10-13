import React, { useState } from 'react';
import { createReview } from '../../Service/ApiService/ApiBooking';
import RatingStar from './RatingStar';
import './ReviewForm.scss';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ReviewForm = ({ tutorId, courseId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tutorId || !courseId) {
      alert('Thiếu thông tin gia sư hoặc khóa học');
      return;
    }
    try {
      const res = await createReview({ tutor: tutorId, course: courseId, rating, comment });
      setRating(5);
      setComment('');
      toast.success('Gửi đánh giá thành công!', {
        onClose: () => navigate('/tutor'),
        autoClose: 2000,
      });
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Có lỗi xảy ra!');
      }
      console.error('Error submitting review:', error);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Đánh giá: </label>
        <RatingStar value={rating} onChange={setRating} />
      </div>
      <div className="form-group">
        <label>Bình luận: </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          required
          placeholder="Nhập bình luận của bạn..."
        />
      </div>
      <button type="submit" className="btn-submit">Gửi đánh giá</button>
    </form>
  );
};

export default ReviewForm;
