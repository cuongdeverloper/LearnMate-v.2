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
    console.log(response)
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