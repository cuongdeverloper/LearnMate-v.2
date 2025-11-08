import React, { useState } from 'react';
import TutorBookingList from './view/TutorBookingList';
import MaterialUploader from './view/MaterialUploader';
import './TutorDashboard.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { doLogout } from '../../redux/action/userAction';

import BookingIcon from '../../asset/Booking.png';
import ProgressIcon from '../../asset/Progress.png';
import MaterialIcon from '../../asset/material.png';
import LogoutIcon from '../../asset/logout.png';
import QuizIcon from '../../asset/Quiz.png';
import AssignmentIcon from '../../asset/Assignment.png';
import AvailableSchedule from './view/AvailableSchedule';
import TutorCreateQuiz from './view/TutorCreateQuiz';
import TutorAssignmentManager from './view/TutorAssignmentManager';
import TutorChangeRequests from './view/TutorChangeRequests';
import TutorAssignQuiz from './view/TutorAssignQuiz';
import TutorSchedule from './view/TutorSchedule';
import TutorQuizManage from './view/TutorQuizManage';

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
      case 'materials': return <MaterialUploader />;
      case 'availableSchedule': return <AvailableSchedule />;
      case 'tutorschedule': return <TutorSchedule />;
      case 'createquiz': return <TutorCreateQuiz />;
      case 'assignquiz': return <TutorAssignQuiz />;
      case 'managequiz': return <TutorQuizManage />;
      case 'createassignment': return <TutorAssignmentManager />;
      case 'changerequestschedule': return <TutorChangeRequests />;
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
      id: 'materials', 
      icon: MaterialIcon, 
      label: 'Tài liệu', 
      description: 'Chia sẻ tài liệu học tập' 
    },
    { 
      id: 'availableSchedule', 
      icon: MaterialIcon, 
      label: 'Lịch trống', 
      description: 'Đặt lịch trống cho gia sư' 
    },
    { 
      id: 'tutorschedule', 
      icon: MaterialIcon, 
      label: 'Lịch dạy', 
      description: 'Lịch dạy của gia sư' 
    },
    { 
      id: 'createquiz', 
      icon: QuizIcon, 
      label: 'Tạo quiz', 
      description: 'Tạo quiz' 
    },
    { 
      id: 'assignquiz', 
      icon: QuizIcon, 
      label: 'Quizz Assign management', 
      description: 'Quản lý đóng mở quiz' 
    },
    { 
      id: 'managequiz', 
      icon: QuizIcon, 
      label: 'Quizz management', 
      description: 'Quản lý quiz của học sinh' 
    },
    { 
      id: 'createassignment', 
      icon: AssignmentIcon, 
      label: 'Tạo Assignment', 
      description: 'Tạo assignment cho từng lịch booking' 
    },
    { 
      id: 'changerequestschedule', 
      icon: MaterialIcon, 
      label: 'Đổi lịch', 
      description: 'Quản lý đổi lịch' 
    },
  ];


  const getActiveMenuLabel = () => {
    const activeItem = menuItems.find(item => item.id === activeTab);
    return activeItem ? activeItem.label : 'Dashboard';
  };

  return (
    <div className="tutor-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo" onClick={handleBackToHome}>
          🎓 <span>LearnMate Tutor</span>
        </div>

        <div className="user-menu">
          {isAuthenticated ? (
            <>
              <div className="user-info">
                <div className="avatar">
                  {user?.username?.charAt(0)?.toUpperCase() || "T"}
                </div>
                <div className="username">{user?.username || "Gia sư"}</div>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                <img src={LogoutIcon} alt="Logout" />
                <span>Đăng xuất</span>
              </button>
            </>
          ) : (
            <button className="login-btn" onClick={handleBackToHome}>
              Đăng nhập
            </button>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="dashboard-content">
        <aside className="sidebar">
          <h2 className="sidebar-title">📊 Chức năng</h2>
          <div className="menu-grid">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className={`menu-card ${
                  activeTab === item.id ? "active" : ""
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <div className="icon">
                  <img src={item.icon} alt={item.label} />
                </div>
                <div className="info">
                  <h4>{item.label}</h4>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="main-panel">
          <div className="panel-header">
            <h3>
              {menuItems.find((m) => m.id === activeTab)?.label || "Dashboard"}
            </h3>
          </div>
          <div className="panel-body">{renderTab()}</div>
        </main>
      </div>
    </div>
  );
};

export default TutorDashboard;