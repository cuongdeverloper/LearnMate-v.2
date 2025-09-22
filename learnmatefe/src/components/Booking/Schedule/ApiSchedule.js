import axios from '../../../Service/AxiosCustomize';
import Cookies from 'js-cookie';

export const fetchBookingDetailsApi = async (bookingId) => {
  try {
    const response = await axios.get(`/api/booking/bookings/${bookingId}`);
    return response; 
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return null;
  }
};
export const fetchBusySlotsByBookingId = async (bookingId, weekStart) => {
  try {
    const response = await axios.get(`/api/booking/schedule/booking/${bookingId}/busy-slots?weekStart=${weekStart}`);
    return response;
  } catch (error) {
    console.error("Error fetching busy slots:", error);
    return null;
  }
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