import axios from "../../Service/AxiosCustomize";
import Cookies from "js-cookie";

export const uploadMaterial = async ({
  bookingId,
  title,
  description,
  file,
}) => {
  try {
    const token = Cookies.get("accessToken");

    if (!token) {
      window.open("/signin", "_blank");
      return { errorCode: 1, message: "Unauthorized" };
    }

    if (!file) {
      return { errorCode: 1, message: "File is required" };
    }

    const formData = new FormData();
    formData.append("bookingId", bookingId);
    formData.append("title", title);
    formData.append("description", description || "");
    formData.append("file", file);
    // call API upload
    const response = await axios.post("/api/tutor/material/upload", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    // kiểm tra response
    if (response.errorCode === 0) {
      return { errorCode: 0, data: response.data };
    } else {
      return { errorCode: 1, message: response?.message || "Upload failed" };
    }
  } catch (error) {
    console.error("Error uploading material:", error);

    // lấy message từ backend nếu có
    const msg =
      error?.response?.data?.message ||
      error.message ||
      "Failed to upload material";
    return { errorCode: 1, message: msg };
  }
};

export const getMaterialsForBooking = async (bookingId) => {
  const token = Cookies.get("accessToken");

  if (!token) {
    return { errorCode: 1, message: "Unauthorized" };
  }

  try {
    const response = await axios.get(
      `/api/tutor/materials/booking/${bookingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error fetching materials:", error);
    return { errorCode: 1, message: "Failed to fetch materials" };
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
    const response = await axios.get("/api/tutor/students");
    return response;
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return [];
  }
};

export const fetchPendingBookings = async (tutorId) => {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await axios.get(`/api/tutor/bookings/pending/${tutorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res;
  } catch (error) {
    console.error("Error fetching pending bookings:", error);
    const msg = error.response?.message || "Cannot fetch pending bookings";
    throw new Error(msg);
  }
};

// ✅ Respond to a booking (approve/reject/cancel)
export const respondBooking = async (bookingId, action, learnerId) => {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await axios.post(
      `/api/tutor/bookings/respond`,
      { bookingId, action, learnerId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res;
  } catch (error) {
    console.error("Error responding booking:", error);
    const msg = error.response?.message || "Error responding to booking";
    throw new Error(msg);
  }
};

// ✅ Cancel a booking
export const cancelBooking = async (bookingId, reason) => {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await axios.post(
      `/api/tutor/bookings/cancel`,
      { bookingId, reason },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res;
  } catch (error) {
    console.error("Error cancelling booking:", error);
    const msg = error.response?.message || "Error cancelling booking";
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
  const token = Cookies.get("accessToken");
  if (!token) throw new Error("Unauthorized");

  const res = await axios.post(`/api/quiz`, quizData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};

/**
 * 🧩 Lấy danh sách quiz theo bookingId
 */
export const getQuizzesByBooking = async (bookingId) => {
  const token = Cookies.get("accessToken");
  if (!token) throw new Error("Unauthorized");

  const res = await axios.get(`/api/quizzes/booking/${bookingId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};

/**
 * 🧩 Lấy danh sách môn học của tutor
 */
export const getSubjectsByTutor = async () => {
  const token = Cookies.get("accessToken");
  if (!token) throw new Error("Unauthorized");

  const res = await axios.get(`/api/tutor/subjects-by-tutor`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};

/**
 * 🧩 Import câu hỏi từ Excel
 */

/**
 * 🧩 Lấy câu hỏi theo quiz
 */
export const getQuestionsByQuizId = async (quizId) => {
  const token = Cookies.get("accessToken");
  if (!token) throw new Error("Unauthorized");

  const res = await axios.get(`/api/quizzes/question/quiz/${quizId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};

/**
 * 🧩 Cập nhật hoặc xoá câu hỏi
 */
export const updateQuestion = async (questionId, data) => {
  const token = Cookies.get("accessToken");
  if (!token) throw new Error("Unauthorized");

  const res = await axios.put(`/api/quizzes/question/${questionId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};

export const deleteQuestion = async (questionId) => {
  const token = Cookies.get("accessToken");
  if (!token) throw new Error("Unauthorized");

  const res = await axios.delete(`/api/quizzes/question/${questionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};

export const deleteQuizStorage = async (quizstorageId) => {
  const token = Cookies.get("accessToken");
  if (!token) throw new Error("Unauthorized");

  const res = await axios.delete(`/api/quizzes/quizstorage/${quizstorageId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};

export const updateQuizStorage = async (quizStorageId, data) => {
  const token = Cookies.get("accessToken");
  if (!token) throw new Error("Unauthorized");

  try {
    const res = await axios.put(
      `/api/quizzes/quiz-storage/${quizStorageId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật QuizStorage:", error);
    const msg =
      error?.response?.data?.message || "Không thể cập nhật QuizStorage";
    return { success: false, message: msg };
  }
};

export const getTutorChangeRequests = async () => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) throw new Error("Unauthorized");

    const res = await axios.get(`/api/tutor/getChangeRequestsTutor`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { errorCode: 0, data: res };
  } catch (error) {
    console.error("❌ Lỗi khi lấy change requests:", error);
    const msg =
      error?.response?.message || "Không thể lấy danh sách yêu cầu thay đổi";
    return { errorCode: 1, message: msg };
  }
};

export const acceptChangeRequest = async (id) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) throw new Error("Unauthorized");

    const res = await axios.put(
      `/api/tutor/${id}/accept`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return { errorCode: 0, message: res };
  } catch (error) {
    console.error("❌ Lỗi khi duyệt yêu cầu:", error);
    const msg = error?.response?.message || "Không thể duyệt yêu cầu";
    return { errorCode: 1, message: msg };
  }
};

export const rejectChangeRequest = async (id) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) throw new Error("Unauthorized");

    const res = await axios.put(
      `/api/tutor/${id}/reject`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return { errorCode: 0, message: res };
  } catch (error) {
    console.error("❌ Lỗi khi từ chối yêu cầu:", error);
    const msg = error?.response?.message || "Không thể từ chối yêu cầu";
    return { errorCode: 1, message: msg };
  }
};

export const importQuestionsToStorage = async (file, subjectId) => {
  const token = Cookies.get("accessToken");
  if (!token) throw new Error("Unauthorized");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("subjectId", subjectId);

  const res = await axios.post(
    `/api/quizzes/import-question-storage`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res;
};

export const getQuestionStorage = async () => {
  const token = Cookies.get("accessToken");
  if (!token) throw new Error("Unauthorized");

  const res = await axios.get(`/api/quizzes/my-question-storage`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};

export const addQuestionsFromStorageToQuiz = async (quizId, questionIds) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) throw new Error("Unauthorized");

    const res = await axios.post(
      `/api/quizzes/add-questions-to-quiz`,
      { quizId, questionIds },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res;
  } catch (error) {
    console.error("❌ Lỗi thêm câu hỏi vào quiz:", error);
    throw error.response || { message: "Không thể thêm câu hỏi." };
  }
};

export const getQuizStorage = async () => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) throw new Error("Unauthorized");

    const res = await axios.get(`/api/quizzes/my-quizzes`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res;
  } catch (error) {
    console.error("❌ Lỗi khi lấy quiz storage:", error);
    throw error.response || { message: "Không thể lấy danh sách quiz." };
  }
};

export const createQuizFromStorage = async (data) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) throw new Error("Unauthorized");

    const res = await axios.post(`/api/quiz`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res;
  } catch (error) {
    console.error("❌ Lỗi khi tạo quiz từ storage:", error);
    throw error.response || { message: "Không thể tạo quiz." };
  }
};

export const createQuizStorage = async ({ title, questionIds, subjectId }) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) throw new Error("Unauthorized");

    const payload = {
      title,
      questionIds: Array.isArray(questionIds) ? questionIds : [questionIds],
      subjectId,
    };

    const res = await axios.post(`/api/quizzes/quiz-storage/create`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res;
  } catch (error) {
    console.error("❌ Lỗi tạo QuizStorage:", error);
    throw error.response || { message: "Không thể tạo QuizStorage." };
  }
};

export const createAssignmentStorage = async (formData) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) throw new Error("Unauthorized");

    const res = await axios.post(`/api/assignments/storage/create`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res;
  } catch (error) {
    console.error("❌ Lỗi tạo AssignmentStorage:", error);
    throw error.response || { message: "Không thể tạo AssignmentStorage." };
  }
};

// 📥 Lấy tất cả AssignmentStorage của tutor
export const getAssignmentStorage = async () => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) throw new Error("Unauthorized");

    const res = await axios.get(`/api/assignments/storage`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res;
  } catch (error) {
    console.error("❌ Lỗi lấy AssignmentStorage:", error);
    throw error.response || { message: "Không thể lấy AssignmentStorage." };
  }
};

// 🗑️ Xóa AssignmentStorage
export const deleteAssignmentStorage = async (storageId) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) throw new Error("Unauthorized");

    const res = await axios.delete(`/api/assignments/storage/${storageId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res;
  } catch (error) {
    console.error("❌ Lỗi xóa AssignmentStorage:", error);
    throw error.response || { message: "Không thể xóa AssignmentStorage." };
  }
};

/* =========================================================
   🎯 ASSIGNMENT ASSIGN API
   ========================================================= */

// 📦 Giao bài tập (tạo Assignment từ Storage cho Booking)
export const createAssignmentFromStorage = async (data) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) throw new Error("Unauthorized");

    const res = await axios.post(`/api/assignments/assign`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res;
  } catch (error) {
    console.error("❌ Lỗi giao Assignment:", error);
    throw error.response || { message: "Không thể giao Assignment." };
  }
};

// 📋 Lấy danh sách các Assignment đã assign (nếu cần)
export const getAssignedAssignments = async () => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) throw new Error("Unauthorized");

    const res = await axios.get(`/api/assignments/assigned`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res;
  } catch (error) {
    console.error("❌ Lỗi lấy danh sách Assignment:", error);
    throw error.response || { message: "Không thể lấy danh sách Assignment." };
  }
};

// 🗑️ Xóa Assignment đã assign
export const deleteAssignedAssignment = async (assignmentId) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) throw new Error("Unauthorized");

    const res = await axios.delete(
      `/api/assignments/assigned/${assignmentId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return res;
  } catch (error) {
    console.error("❌ Lỗi xóa Assignment:", error);
    throw error.response || { message: "Không thể xóa Assignment." };
  }
};
