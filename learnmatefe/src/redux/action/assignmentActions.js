import axios from "../../Service/AxiosCustomize";
import Cookies from "js-cookie";

// ✅ Lấy danh sách bài tập
export const fetchAssignments = (courseId) => async (dispatch) => {
  dispatch({ type: "ASSIGNMENT_LIST_REQUEST" });
  try {
    const res = await fetch(`/api/courses/${courseId}/assignments`);
    const data = await res.json();
    dispatch({ type: "ASSIGNMENT_LIST_SUCCESS", payload: data });
  } catch (err) {
    dispatch({ type: "ASSIGNMENT_LIST_FAILURE", payload: err.message });
  }
};

// ✅ Nộp bài
export const submitAssignment =
  (assignmentId, submissionData) => async (dispatch) => {
    dispatch({ type: "ASSIGNMENT_SUBMIT_REQUEST" });
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
      const data = await res.json();
      dispatch({ type: "ASSIGNMENT_SUBMIT_SUCCESS", payload: data });
    } catch (err) {
      dispatch({ type: "ASSIGNMENT_SUBMIT_FAILURE", payload: err.message });
    }
  };

// ✅ Xem feedback
export const fetchAssignmentFeedback = (assignmentId) => async (dispatch) => {
  try {
    const res = await fetch(`/api/assignments/${assignmentId}/feedback`);
    const data = await res.json();
    dispatch({ type: "ASSIGNMENT_FEEDBACK_SUCCESS", payload: data });
  } catch (err) {
    console.error(err);
  }
};

// ✅ Chọn bài tập
export const selectAssignment = (assignment) => ({
  type: "ASSIGNMENT_SELECT",
  payload: assignment,
});

// ✅ Reset state (khi logout hoặc đổi course)
export const resetAssignments = () => ({
  type: "ASSIGNMENT_RESET",
});
