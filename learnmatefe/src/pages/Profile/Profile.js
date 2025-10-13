// src/pages/profile/Profile.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Profile.scss';

import UpdateProfile from './UpdateProfile';
import ChangePasswordForm from './ChangePasswordForm';
import UpdateTutorProfile from './UpdateTutorProfile'; // ✅ thêm để chỉnh thông tin gia sư

import { ApiGetProfile } from '../../Service/ApiService/ApiUser';
import { ApiGetMyTutor } from '../../Service/ApiService/ApiTutor';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editTutorMode, setEditTutorMode] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isSocial, setIsSocial] = useState(false);
  const [tutorData, setTutorData] = useState(null);

  const navigate = useNavigate();
  const access_token = useSelector(state => state.user.account?.access_token);

  // ✅ Lấy thông tin người dùng
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await ApiGetProfile();
        if (res.socialLogin) {
          setIsSocial(true);
        }
        setProfile(res);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        navigate('/signin');
      }
    };

    fetchProfile();
  }, [navigate]);

  // ✅ Lấy thông tin gia sư nếu user là tutor
  useEffect(() => {
    const fetchTutorData = async () => {
      if (profile?.role === 'tutor') {
        try {
          const res = await ApiGetMyTutor();
          setTutorData(res);
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchTutorData();
  }, [profile]);

  if (!profile) {
    return <div className="profile-loading">Đang tải thông tin cá nhân...</div>;
  }

  return (
    <div className="profile-page-wrapper">
      {/* ✅ Nếu đang chỉnh sửa hồ sơ user */}
      {editMode ? (
        <UpdateProfile
          profile={profile}
          onUpdate={user => {
            setProfile(user);
            setEditMode(false);
          }}
          onCancel={() => setEditMode(false)}
          isSocial={isSocial}
        />
      ) : showChangePassword ? (
        <ChangePasswordForm onClose={() => setShowChangePassword(false)} />
      ) : editTutorMode ? (
        <UpdateTutorProfile
          tutorData={tutorData}
          onUpdate={updatedTutor => {
            setTutorData(updatedTutor);
            setEditTutorMode(false);
          }}
          onCancel={() => setEditTutorMode(false)}
        />
      ) : (
        <div className="profile-card">
          <h2 className="profile-card-title">Thông tin cá nhân</h2>

          <div className="avatar-section">
            <img
              src={profile.image || '/default-avatar.png'}
              alt="avatar"
              className="avatar"
            />
          </div>

          <div className="info-grid">
            <div className="info-item">
              <label>Tên đăng nhập:</label>
              <span>{profile.username}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{profile.email}</span>
            </div>
            <div className="info-item">
              <label>Số điện thoại:</label>
              <span>{profile.phoneNumber || 'Chưa cập nhật'}</span>
            </div>
            <div className="info-item">
              <label>Giới tính:</label>
              <span>
                {profile.gender === 'male'
                  ? 'Nam'
                  : profile.gender === 'female'
                  ? 'Nữ'
                  : 'Khác'}
              </span>
            </div>
            <div className="info-item">
              <label>Vai trò:</label>
              <span>{profile.role}</span>
            </div>
            <div className="info-item">
              <label>Mật khẩu:</label>
              <span>*********</span>
            </div>
          </div>

          <div className="button-group">
            <button className="btn btn-edit" onClick={() => setEditMode(true)}>
              Chỉnh sửa
            </button>

            {!isSocial && (
              <button
                className="btn btn-change-password"
                onClick={() => setShowChangePassword(true)}
              >
                Đổi mật khẩu
              </button>
            )}

            {profile.role === 'student' && (
              <button
                className="btn btn-apply-tutor"
                onClick={() => navigate('/tutor-application')}
              >
                Trở thành gia sư
              </button>
            )}

            {profile.role === 'tutor' && (
              <button
                className="btn btn-edit-tutor"
                onClick={() => setEditTutorMode(true)}
              >
                Cập nhật hồ sơ gia sư
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
