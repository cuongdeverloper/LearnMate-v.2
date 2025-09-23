import React, { useState } from 'react';
import TutorBookingList from './view/TutorBookingList';
import ScheduleManager from './view/ScheduleManager';
import ProgressTracker from './view/ProgressTracker';
import MaterialUploader from './view/MaterialUploader';
import './TutorDashboard.scss';
import BookingSchedule from '../../pages/Booking/Schedule/BookingSchedule';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { doLogout } from '../../redux/action/userAction';

// Import asset icons
import BookingIcon from '../../asset/Booking.png';
import ScheduleIcon from '../../asset/schedule.png';
import ProgressIcon from '../../asset/Progress.png';
import MaterialIcon from '../../asset/material.png';
import LogoutIcon from '../../asset/logout.png';

const TutorDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.user.isAuthenticated);
  const user = useSelector(state => state.user.account); 

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleLogout = () => {
    dispatch(doLogout());
    navigate("/");
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'bookings': return <TutorBookingList />;
      case 'schedule': return <BookingSchedule />;
      case 'progress': return <ProgressTracker />;
      case 'materials': return <MaterialUploader />;
      default: return <TutorBookingList />;
    }
  };

  const menuItems = [
    { 
      id: 'bookings', 
      icon: BookingIcon, 
      label: 'Quản lý Booking', 
      description: 'Duyệt và quản lý các yêu cầu học' 
    },
    { 
      id: 'schedule', 
      icon: ScheduleIcon, 
      label: 'Lịch học', 
      description: 'Xem và sắp xếp lịch dạy' 
    },
    { 
      id: 'progress', 
      icon: ProgressIcon, 
      label: 'Tiến độ học tập', 
      description: 'Theo dõi tiến bộ của học viên' 
    },
    { 
      id: 'materials', 
      icon: MaterialIcon, 
      label: 'Tài liệu', 
      description: 'Chia sẻ tài liệu học tập' 
    }
  ];


  const getActiveMenuLabel = () => {
    const activeItem = menuItems.find(item => item.id === activeTab);
    return activeItem ? activeItem.label : 'Dashboard';
  };

  return (
    <div className="tutor-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <button className="back-btn" onClick={handleBackToHome}>
            <span className="back-icon">←</span>
            <span>Trang chủ</span>
          </button>
          <div className="header-title">
            <h1>🎓 LearnMate Tutor</h1>
            <p>Hệ thống quản lý gia sư</p>
          </div>
        </div>
        
        <div className="header-right">
          {!isAuthenticated ? (
            <button className="auth-btn login-btn" onClick={handleBackToHome}>
              <span className="btn-icon">🚪</span>
              Đăng nhập
            </button>
          ) : (
            <div className="user-section">
              <div className="user-info">
                <div className="user-avatar">
                  <span>{user?.username?.charAt(0)?.toUpperCase() || 'T'}</span>
                </div>
                <div className="user-details">
                  <span className="user-name">{user?.username || "Gia sư"}</span>
                  <span className="user-role">Tutor</span>
                </div>
              </div>
              <button className="auth-btn logout-btn" onClick={handleLogout}>
                <img 
                  src={LogoutIcon} 
                  alt="Logout" 
                  className="btn-icon-img"
                  onError={(e) => {
                    console.error('Failed to load logout icon:', LogoutIcon);
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => console.log('✓ Loaded logout icon')}
                />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="dashboard-body">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <h3>📊 Dashboard</h3>
            <p>Chọn chức năng bên dưới</p>
          </div>
          
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <div className="nav-icon">
                  <img 
                    src={item.icon} 
                    alt={item.label} 
                    className="nav-icon-img"
                    onError={(e) => {
                      console.error(`Failed to load icon for ${item.label}:`, item.icon);
                      e.target.style.display = 'none';
                    }}
                    onLoad={() => console.log(`✓ Loaded icon for ${item.label}`)}
                  />
                </div>
                <div className="nav-content">
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-description">{item.description}</span>
                </div>
                <div className="nav-arrow">→</div>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="stats-card">
              <h4>💡 Tip</h4>
              <p>Cập nhật tiến độ học tập thường xuyên để học viên theo dõi!</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          <div className="content-header">
            <div className="breadcrumb">
              <span>Dashboard</span>
              <span className="separator">›</span>
              <span className="current">{getActiveMenuLabel()}</span>
            </div>
          </div>
          
          <div className="content-body">
            {renderTab()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TutorDashboard;