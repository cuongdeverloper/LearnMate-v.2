// ✅ Lấy lịch của tất cả các khóa học
export const fetchAllSchedules = () => async (dispatch) => {
  dispatch({ type: "SCHEDULE_ALL_REQUEST" });
  try {
    const res = await fetch("/api/schedules"); // endpoint ví dụ
    const data = await res.json();
    dispatch({ type: "SCHEDULE_ALL_SUCCESS", payload: data });
  } catch (err) {
    dispatch({ type: "SCHEDULE_ALL_FAILURE", payload: err.message });
  }
};

// ✅ Lấy lịch của một khóa học cụ thể
export const fetchCourseSchedule = (courseId) => async (dispatch) => {
  dispatch({ type: "SCHEDULE_COURSE_REQUEST" });
  try {
    const res = await fetch(`/api/courses/${courseId}/schedule`);
    const data = await res.json();
    dispatch({
      type: "SCHEDULE_COURSE_SUCCESS",
      payload: { courseId, schedule: data },
    });
  } catch (err) {
    dispatch({ type: "SCHEDULE_COURSE_FAILURE", payload: err.message });
  }
};

// ✅ Reset toàn bộ lịch (khi logout)
export const resetSchedule = () => ({
  type: "SCHEDULE_RESET",
});
