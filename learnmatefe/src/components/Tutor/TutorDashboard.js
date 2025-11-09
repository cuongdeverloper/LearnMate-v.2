import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  FileText,
  CalendarDays,
  ClipboardList,
  Edit3,
  Layers,
  ClipboardCheck,
  RefreshCcw,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { doLogout } from "../../redux/action/userAction";
import TutorBookingList from "./view/TutorBookingList";
import MaterialUploader from "./view/MaterialUploader";
import AvailableSchedule from "./view/AvailableSchedule";
import TutorSchedule from "./view/TutorSchedule";

import TutorAssignmentManager from "./view/Tutor Assignment/TutorAssignmentManager";
import TutorChangeRequests from "./view/TutorChangeRequests";
import "./TutorDashboard.scss";
import TutorQuizManager from "./view/Tutor Quiz/TutorQuizManager";

const menuItems = [
  { id: "bookings", label: "Quản lý Booking", icon: <BookOpen />, component: <TutorBookingList /> },
  { id: "materials", label: "Tài liệu", icon: <FileText />, component: <MaterialUploader /> },
  { id: "availableSchedule", label: "Lịch trống", icon: <CalendarDays />, component: <AvailableSchedule /> },
  { id: "tutorschedule", label: "Lịch dạy", icon: <ClipboardList />, component: <TutorSchedule /> },
  { id: "managequiz", label: "Quản lý Quiz", icon: <ClipboardCheck />, component: <TutorQuizManager /> },
  { id: "createassignment", label: "Assignment", icon: <FileText />, component: <TutorAssignmentManager /> },
  { id: "changerequestschedule", label: "Đổi lịch", icon: <RefreshCcw />, component: <TutorChangeRequests /> },
];

const TutorDashboard = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.account);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleLogout = () => {
    dispatch(doLogout());
    navigate("/");
  };

  const activeComponent =
    menuItems.find((item) => item.id === activeTab)?.component || <TutorBookingList />;

  return (
    <div className="tutor-dashboard-container">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 250 : 80 }}
        transition={{ duration: 0.3 }}
        className="sidebar"
      >
        <div className="sidebar-header">
          <span className="logo">🎓</span>
          {sidebarOpen && <h2>LearnMate</h2>}
          <button
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "⏪" : "⏩"}
          </button>
        </div>

        <div className="menu">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`menu-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="icon">{item.icon}</div>
              {sidebarOpen && <span>{item.label}</span>}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="logout" onClick={handleLogout}>
            <LogOut size={18} />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="dashboard-header">
          <h2>
            {menuItems.find((m) => m.id === activeTab)?.label || "Dashboard"}
          </h2>
          <div className="header-right">
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="user-info">
              <div className="avatar">
                {user?.username?.charAt(0)?.toUpperCase() || "T"}
              </div>
              <span>{user?.username || "Tutor"}</span>
            </div>
          </div>
        </header>

        <main className="dashboard-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="content-wrapper"
            >
              {activeComponent}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default TutorDashboard;
