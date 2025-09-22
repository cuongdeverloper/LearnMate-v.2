// src/pages/SavedTutorsPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "../../Service/AxiosCustomize";
import { useSelector } from 'react-redux';
import { FaStar, FaTrash, FaShoppingBag } from 'react-icons/fa';
import { toast } from 'react-toastify'; // Import toast
import "../../scss/TutorListPage.scss";

export default function SavedTutorsPage() {
    const [savedTutors, setSavedTutors] = useState([]);
    const navigate = useNavigate();

    const accessToken = useSelector((state) => state.user.account.access_token);

    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const fetchSavedTutors = useCallback(async () => {
        if (!accessToken) {
            setSavedTutors([]);
            return;
        }
        try {
            const res = await axios.get(`/me/saved-tutors`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            setSavedTutors(res || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách gia sư đã lưu:", error);
            if (error.response && error.response.status === 401) {
                toast.error("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại."); // Thay thế alert
                navigate("/login");
            } else {
                toast.error("Lỗi khi lấy danh sách gia sư đã lưu."); // Thêm toast cho lỗi chung
            }
            setSavedTutors([]);
        }
    }, [accessToken, navigate]);

    useEffect(() => {
        fetchSavedTutors();
    }, [fetchSavedTutors]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleRemoveFromList = async (tutorId) => {
        if (!accessToken) {
            toast.info("Bạn cần đăng nhập để thực hiện hành động này!"); // Thay thế alert
            navigate("/login");
            return;
        }
        try {
            const res = await axios.delete(`/me/saved-tutors/${tutorId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            fetchSavedTutors();
            toast.success(res.message || "Đã xóa gia sư khỏi danh sách lưu."); // Thay thế alert, thêm fallback message
        } catch (error) {
            console.error("Lỗi khi xóa gia sư khỏi danh sách:", error.response?.data || error.message);
            if (error.response && error.response.status === 401) {
                toast.error("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại."); // Thay thế alert
                navigate("/login");
            } else {
                toast.error(`Không thể xóa gia sư: ${error.response?.data?.message || 'Lỗi không xác định'}`); // Thay thế alert
            }
        }
    };

    const handleBookNowClick = (tutorId) => {
        navigate(`/book/${tutorId}`);
    };

    return (
        <div className="page-container">
            

            <header className="page-header">
                <h1>Gia Sư Đã Lưu Của Bạn</h1>
                <p className="sub-title">
                    Dưới đây là danh sách các gia sư bạn đã quan tâm và lưu lại.
                </p>
            </header>

            <div className="main-layout">
                <main className="main-content">
                    <section className="tutor-list-section">
                        {savedTutors.length === 0 ? (
                            <p className="no-result">Bạn chưa lưu gia sư nào vào danh sách.</p>
                        ) : (
                            <div className="tutor-list">
                                {savedTutors.map((tutor) => (
                                    <div key={tutor._id} className="tutor-card" onClick={() => navigate(`/tutors/${tutor._id}`)}>
                                        <img
                                            className="tutor-avatar"
                                            src={
                                                tutor.user.image ||
                                                "https://i.pravatar.cc/100?img=" +
                                                (Math.floor(Math.random() * 70) + 1)
                                            }
                                            alt={tutor.user?.username || "Gia sư"}
                                        />
                                        <div className="tutor-info">
                                            <h3>{tutor.user?.username || "Gia sư chưa có tên"}</h3>
                                            <div className="rating">
                                                <FaStar className="star-icon" />
                                                <span>
                                                    {tutor.rating
                                                        ? tutor.rating.toFixed(1)
                                                        : "Chưa có đánh giá"}
                                                </span>
                                            </div>
                                            <p>
                                                <strong>Môn dạy:</strong>{" "}
                                                {tutor.subjects?.join(", ") || "Đang cập nhật"}
                                            </p>
                                            <p className="tutor-desc">
                                                {tutor.bio || "Gia sư chuyên nghiệp, tận tâm, cam kết giúp học sinh tiến bộ trong thời gian ngắn nhất."}
                                            </p>
                                            <div className="tutor-price">
                                                Giá: {tutor.pricePerHour?.toLocaleString() || "Liên hệ"}{" "}
                                                VND / giờ
                                            </div>
                                            <div className="tutor-actions">
                                                <button
                                                    className="btn-add-to-list"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveFromList(tutor._id);
                                                    }}
                                                >
                                                    <FaTrash /> Xóa khỏi danh sách
                                                </button>
                                                <button
                                                    className="btn-book"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleBookNowClick(tutor._id);
                                                    }}
                                                >
                                                    Đặt Lịch Ngay
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}