import axios from '../../Service/AxiosCustomize';
import Cookies from 'js-cookie';

export const uploadMaterial = async ({ bookingId, title, description, file }) => {
  try {
    const token = Cookies.get("accessToken");

    if (!token) {
      window.open("/signin", "_blank");
      return { errorCode: 1, message: 'Unauthorized' };
    }

    if (!file) {
      return { errorCode: 1, message: 'File is required' };
    }

    const formData = new FormData();
    formData.append('bookingId', bookingId);
    formData.append('title', title);
    formData.append('description', description || '');
    formData.append('file', file); 
    // call API upload
    const response = await axios.post(
      '/api/tutor/material/upload',
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      }
    );
   
    // kiểm tra response
    if (response.errorCode === 0) {
      return { errorCode: 0, data: response.data };
    } else {
      return { errorCode: 1, message: response?.message || 'Upload failed' };
    }
  } catch (error) {
    console.error("Error uploading material:", error);

    // lấy message từ backend nếu có
    const msg = error?.response?.data?.message || error.message || 'Failed to upload material';
    return { errorCode: 1, message: msg };
  }
};

export const getMaterialsForBooking = async (bookingId) => {
  const token = Cookies.get("accessToken");

  if (!token) {
    return { errorCode: 1, message: "Unauthorized" };
  }

  try {
    const response = await axios.get(`/api/tutor/materials/booking/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching materials:", error);
    return { errorCode: 1, message: 'Failed to fetch materials' };
  }
};
export const getTutorSchedule = (tutorId) => {
  return axios.get(`/api/tutor/schedule/${tutorId}`);
};

export const getTeachingProgress = (studentId) => {
  return axios.get(`/api/tutor/progress/${studentId}`);
};

export const updateTeachingProgress = (studentId, progressData) => {
  return axios.post(`/api/tutor/progress`, { studentId, ...progressData });
}; 

export const getBookingsByTutorId = async (tutorId) => {
  try {
    const token = Cookies.get("accessToken");

    if (!token) {
      window.open("/signin", "_blank");
      return;
    }

    const response = await axios.get(`/api/tutor/tutor/${tutorId}/bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching bookings by tutorId:", error);
    return null;
  }
};

export const createSchedule = (tutorId, scheduleData) => {
  return axios.post(`/api/tutor/schedule`, { tutorId, ...scheduleData });
};

export const deleteSchedule = (scheduleId) => {
  return axios.delete(`/api/tutor/schedule/${scheduleId}`);
};

export const fetchStudentsApi = async () => {
  try {
    const response = await axios.get('/api/tutor/students');
    return response;
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return [];
  }
};

export const fetchPendingBookings = (tutorId) => {
  return axios.get(`/api/tutor/bookings/pending/${tutorId}`);
};
export const respondBooking = async (bookingId, action, learnerId) => {
  try {
    const res = await axios.post(`/api/tutor/bookings/respond`, {
      bookingId,
      action,
      learnerId,
    });
    return res; 
  } catch (error) {
    console.error('Error responding booking:', error);
    const msg = error.response?.message || 'Error responding to booking';
    throw new Error(msg);
  }
};

export const cancelBooking = async (bookingId, reason) => {
  try {
    const res = await axios.post(`/api/tutor/bookings/cancel`, {
      bookingId,
      reason,
    });
    return res;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    const msg = error.response?.data?.message || 'Error cancelling booking';
    throw new Error(msg);
  }
};

export const getTutorAvailability = async (weekStart) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) {
      return { errorCode: 1, message: "Chưa đăng nhập." };
    }

    const meRes = await axios.get("/api/tutor/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const tutorId = meRes._id;
    if (!tutorId) {
      return { errorCode: 1, message: "Không tìm thấy thông tin gia sư." };
    }

    const res = await axios.get(`/api/tutor/${tutorId}/availability`, {
      params: { weekStart },
      headers: { Authorization: `Bearer ${token}` },
    });

    return { errorCode: 0, data: res };
  } catch (error) {
    console.error("Error fetching tutor availability:", error);
    const msg = error?.response?.data?.message || "Không thể tải lịch trống.";
    return { errorCode: 1, message: msg };
  }
};

/**
 * Tạo (thêm) lịch trống mới cho tutor
 */
export const createTutorAvailability = async (slots = []) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) {
      window.open("/signin", "_blank");
      return { errorCode: 1, message: "Unauthorized" };
    }

    const res = await axios.post(
      `/api/tutor/createavailability`,
      { slots },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { errorCode: 0, data: res.data };
  } catch (error) {
    console.error("Error creating tutor availability:", error);
    const msg = error?.response?.data?.message || "Lỗi khi tạo lịch trống";
    return { errorCode: 1, message: msg };
  }
};

/**
 * Xoá lịch trống (nếu cần xoá thủ công)
 */
export const deleteTutorAvailability = async (availabilityId) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) {
      window.open("/signin", "_blank");
      return { errorCode: 1, message: "Unauthorized" };
    }

    const res = await axios.delete(`/api/tutor/${availabilityId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return { errorCode: 0, data: res.data };
  } catch (error) {
    console.error("Error deleting tutor availability:", error);
    const msg = error?.response?.data?.message || "Lỗi khi xoá lịch trống";
    return { errorCode: 1, message: msg };
  }
};

export const createQuiz = async (quizData) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) throw new Error("Unauthorized");

    const res = await axios.post(`/api/quiz`, quizData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res;
  } catch (error) {
    console.error("Error creating quiz:", error);
    throw error.response || { message: "Không thể tạo quiz" };
  }
};

/**
 * 🧩 Cập nhật quiz
 */
export const updateQuiz = async (quizId, quizData) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) throw new Error("Unauthorized");

    const res = await axios.put(`/api/quiz/${quizId}`, quizData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (error) {
    console.error("Error updating quiz:", error);
    throw error.response?.data || { message: "Không thể cập nhật quiz" };
  }
};

/**
 * 🧩 Lấy danh sách quiz của tutor hiện tại
 */
export const getMyQuizzes = async () => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) throw new Error("Unauthorized");

    const res = await axios.get(`/api/quiz/my-quizzes`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res;
  } catch (error) {
    console.error("Error fetching tutor quizzes:", error);
    throw error.response?.data || { message: "Không thể tải quiz" };
  }
};


export const getSubjectsByTutor = async () => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) {
      window.open("/signin", "_blank");
      return { errorCode: 1, message: "Unauthorized" };
    }

    const response = await axios.get(`/api/tutor/subjects-by-tutor`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response?.success) {
      return {
        errorCode: 0,
        data: response.subjects,
        tutorId: response.tutorId,
      };
    } else {
      return {
        errorCode: 1,
        message:
          response?.message || "Không thể tải danh sách môn học của tutor.",
      };
    }
  } catch (error) {
    console.error("Error fetching subjects by tutor:", error);
    const msg =
      error?.response?.message ||
      "Lỗi khi tải danh sách môn học của tutor.";
    return { errorCode: 1, message: msg };
  }
};

export const importQuestionsFromExcel = async (quizId, file) => {
  const token = Cookies.get("accessToken");
  if (!token) throw new Error("Unauthorized");

  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(`/api/quiz/${quizId}/import`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return res;
};




export const getQuestionsByQuiz = async (quizId) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) throw new Error("Unauthorized");

    const res = await axios.get(`/api/quiz/question/quiz/${quizId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.success) {
      return { errorCode: 0, data: res };
    } else {
      return {
        errorCode: 1,
        message: res?.message || "Không thể tải câu hỏi của quiz.",
      };
    }
  } catch (error) {
    console.error("Error fetching questions by quiz:", error);
    const msg =
      error?.response?.message ||
      error.message ||
      "Lỗi khi tải câu hỏi theo quiz.";
    return { errorCode: 1, message: msg };
  }
};  

export const updateQuestion = async (questionId, data) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) throw new Error("Unauthorized");

    const res = await axios.put(`/api/quiz/question/${questionId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return { errorCode: 0, data: res.data };
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật câu hỏi:", error);
    const msg =
      error?.response?.data?.message ||
      error.message ||
      "Không thể cập nhật câu hỏi.";
    return { errorCode: 1, message: msg };
  }
};

export const deleteQuestion = async (questionId) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) throw new Error("Unauthorized");

    const res = await axios.delete(`/api/quiz/question/${questionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return { errorCode: 0, data: res.data };
  } catch (error) {
    console.error("❌ Lỗi khi xoá câu hỏi:", error);
    const msg =
      error?.response?.data?.message ||
      error.message ||
      "Không thể xoá câu hỏi.";
    return { errorCode: 1, message: msg };
  }
};