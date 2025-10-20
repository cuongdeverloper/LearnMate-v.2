export const fetchCourses = () => async (dispatch) => {
  dispatch({ type: "MY_COURSE_REQUEST" });
  try {
    const res = await fetch("/api/courses");
    const data = await res.json();
    dispatch({ type: "MY_COURSE_SUCCESS", payload: data });
  } catch (err) {
    dispatch({ type: "MY_COURSE_FAILURE", payload: err.message });
  }
};

export const selectCourse = (course) => ({
  type: "SELECT_COURSE",
  payload: course,
});

export const resetCourses = () => ({
  type: "COURSE_RESET",
});
