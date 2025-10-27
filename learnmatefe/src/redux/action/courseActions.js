import axios from "../../Service/AxiosCustomize";
import Cookies from "js-cookie";

export const fetchCourses = () => async (dispatch) => {
  const token = Cookies.get("accessToken");
  dispatch({ type: "COURSE_REQUEST" });
  try {
    const res = await axios.get("/api/booking/bookings/my-courses", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({ type: "COURSE_SUCCESS", payload: res });
  } catch (err) {
    dispatch({ type: "COURSE_FAILURE", payload: err.message });
  }
};

export const selectCourse = (course) => ({
  type: "SELECT_COURSE",
  payload: course,
});

export const resetCourses = () => ({
  type: "COURSE_RESET",
});
