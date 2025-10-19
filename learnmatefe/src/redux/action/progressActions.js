// ✅ Lấy tiến trình một khóa học
export const fetchProgress = (courseId) => async (dispatch) => {
  dispatch({ type: "PROGRESS_FETCH_REQUEST" });
  try {
    const res = await fetch(`/api/courses/${courseId}/progress`);
    const data = await res.json();
    dispatch({
      type: "PROGRESS_FETCH_SUCCESS",
      payload: { courseId, progress: data },
    });
  } catch (err) {
    dispatch({ type: "PROGRESS_FETCH_FAILURE", payload: err.message });
  }
};

// ✅ Cập nhật tiến trình (ví dụ sau khi hoàn thành bài học)
export const updateProgress = (courseId, progressData) => ({
  type: "PROGRESS_UPDATE",
  payload: { courseId, progress: progressData },
});

// ✅ Reset toàn bộ tiến trình (ví dụ khi logout)
export const resetProgress = () => ({
  type: "PROGRESS_RESET",
});
