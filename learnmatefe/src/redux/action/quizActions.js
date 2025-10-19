// ✅ Lấy danh sách quiz của khóa học
export const fetchQuizzes = (courseId) => async (dispatch) => {
  dispatch({ type: "QUIZ_LIST_REQUEST" });
  try {
    const res = await fetch(`/api/courses/${courseId}/quizzes`);
    const data = await res.json();
    dispatch({ type: "QUIZ_LIST_SUCCESS", payload: data });
  } catch (err) {
    dispatch({ type: "QUIZ_LIST_FAILURE", payload: err.message });
  }
};

// ✅ Chọn quiz để làm
export const selectQuiz = (quiz) => ({
  type: "QUIZ_SELECT",
  payload: quiz,
});

// ✅ Lưu câu trả lời tạm thời (client side)
export const saveQuizAnswer = (questionId, answer) => ({
  type: "QUIZ_SAVE_ANSWER",
  payload: { questionId, answer },
});

// ✅ Nộp bài quiz
export const submitQuiz = (quizId, userAnswers) => async (dispatch) => {
  dispatch({ type: "QUIZ_SUBMIT_REQUEST" });
  try {
    const res = await fetch(`/api/quizzes/${quizId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: userAnswers }),
    });
    const data = await res.json();
    dispatch({ type: "QUIZ_SUBMIT_SUCCESS", payload: data }); // data.score
  } catch (err) {
    dispatch({ type: "QUIZ_SUBMIT_FAILURE", payload: err.message });
  }
};

// ✅ Reset quiz state
export const resetQuiz = () => ({
  type: "QUIZ_RESET",
});
