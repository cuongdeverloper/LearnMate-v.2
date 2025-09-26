import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import './ChangePasswordForm.scss';
import { useNavigate } from 'react-router-dom';
import { ApiChangePassword } from '../../Service/ApiService/ApiUser';

const ChangePasswordForm = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const access_token = useSelector(state => state.user.account?.access_token);
  const navigate = useNavigate();


const handleSubmit = async (e) => {
  e.preventDefault();

  if (!oldPassword || !newPassword || !confirmPassword) {
    toast.warn('Vui lòng nhập đầy đủ thông tin!');
    return;
  }

  if (newPassword !== confirmPassword) {
    toast.warn('Mật khẩu mới và xác nhận không khớp!');
    return;
  }

  setLoading(true);
  try {
    const data = await ApiChangePassword(oldPassword, newPassword, confirmPassword);
    toast.success(data.message || 'Đổi mật khẩu thành công!');
    setTimeout(() => {
      onClose && onClose();
    }, 1200);
  } catch (err) {
    toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại!');
  } finally {
    setLoading(false);
  }
};


  return (
    <>
    <form className="change-password-form" onSubmit={handleSubmit}>
      <h3>Đổi mật khẩu</h3>
      <div className="form-group">
        <label>Mật khẩu cũ</label>
        <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} autoFocus required />
      </div>
      <div className="form-group">
        <label>Mật khẩu mới</label>
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Nhập lại mật khẩu mới</label>
        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
      </div>
      <div className="profile-actions">
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}</button>
        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading} style={{marginLeft: 8}}>Hủy</button>
      </div>
      <div style={{textAlign: 'center', marginTop: 16}}>
        <button type="button" className="btn-link" style={{background: 'none', border: 'none', color: '#4e54c8', textDecoration: 'underline', cursor: 'pointer'}} onClick={() => navigate('/forgot-password')}>
          Quên mật khẩu?
        </button>
      </div>
    </form>
    </>
  );
};

export default ChangePasswordForm; 