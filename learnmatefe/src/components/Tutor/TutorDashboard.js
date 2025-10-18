import React, { useState } from "react";
import TutorBookingList from "./view/TutorBookingList";
import ScheduleManager from "./view/ScheduleManager";
import ProgressTracker from "./view/ProgressTracker";
import MaterialUploader from "./view/MaterialUploader";
import "./TutorDashboard.scss";
import BookingSchedule from "../../pages/Booking/Schedule/BookingSchedule";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { doLogout } from "../../redux/action/userAction";

// Import asset icons
import BookingIcon from "../../asset/Booking.png";
import ScheduleIcon from "../../asset/schedule.png";
import ProgressIcon from "../../asset/Progress.png";
import MaterialIcon from "../../asset/material.png";
import LogoutIcon from "../../asset/logout.png";

const TutorDashboard = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector((state) => state.user.account);

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleLogout = () => {
    dispatch(doLogout());
    navigate("/");
  };

  const renderTab = () => {
    switch (activeTab) {
      case "bookings":
        return <TutorBookingList />;
      case "schedule":
        return <BookingSchedule />;
      case "progress":
        return <ProgressTracker />;
      case "materials":
        return <MaterialUploader />;
      default:
        return <TutorBookingList />;
    }
  };

  const menuItems = [
    {
      id: "bookings",
      icon: BookingIcon,
      label: "Quản lý Booking",
      description: "Duyệt và quản lý các yêu cầu học",
    },
    {
      id: "schedule",
      icon: ScheduleIcon,
      label: "Lịch học",
      description: "Xem và sắp xếp lịch dạy",
    },
    {
      id: "progress",
      icon: ProgressIcon,
      label: "Tiến độ học tập",
      description: "Theo dõi tiến bộ của học viên",
    },
    {
      id: "materials",
      icon: MaterialIcon,
      label: "Tài liệu",
      description: "Chia sẻ tài liệu học tập",
    },
  ];

  const getActiveMenuLabel = () => {
    const activeItem = menuItems.find((item) => item.id === activeTab);
    return activeItem ? activeItem.label : "Dashboard";
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
                className={`menu-card ${activeTab === item.id ? "active" : ""}`}
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
