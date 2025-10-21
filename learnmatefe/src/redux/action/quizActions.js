import axios from "../../Service/AxiosCustomize";
import Cookies from "js-cookie";

const token = Cookies.get("accessToken");

export const fetchQuizzesByLearner = (learnerId) => async (dispatch) => {
  dispatch({ type: "QUIZ_LIST_REQUEST" });
  try {
    const res = await axios.get(`/api/quiz/learner/all-quizzes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(res);
    // const data = await res.json();
    dispatch({ type: "QUIZ_LIST_SUCCESS", payload: res });
  } catch (err) {
    dispatch({ type: "QUIZ_LIST_FAILURE", payload: err.message });
  }
};

export const fetchQuizDetailsById = (quizId) => async (dispatch) => {
  dispatch({ type: "QUIZ_DETAILS_REQUEST" });
  try {
    const res = await axios.get(`/api/quiz/getdetailquiz/${quizId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({ type: "QUIZ_DETAILS_SUCCESS", payload: res.quiz });
  } catch (err) {
    dispatch({ type: "QUIZ_DETAILS_FAILURE", payload: err.message });
  }
};

export const fetchQuizzesByCourseId = (courseId) => async (dispatch) => {
  console.log(courseId);

  dispatch({ type: "QUIZ_LIST_REQUEST" });
  try {
    const res = await axios.get(`/api/quiz/booking/${courseId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({ type: "QUIZ_LIST_SUCCESS", payload: res.quizzes });
  } catch (err) {
    dispatch({ type: "QUIZ_LIST_FAILURE", payload: err.message });
  }
};

export const selectQuiz = (quiz) => ({
  type: "QUIZ_SELECT",
  payload: quiz,
});

export const saveQuizAnswer = (questionId, answer) => ({
  type: "QUIZ_SAVE_ANSWER",
  payload: { questionId, answer },
});

export const submitQuiz = (quizId, answers) => async (dispatch) => {
  dispatch({ type: "QUIZ_SUBMIT_REQUEST" });
  try {
    const res = await axios.post(
      `/api/quiz/${quizId}/submit`,
      { answers },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch({ type: "QUIZ_SUBMIT_SUCCESS", payload: res });
  } catch (err) {
    dispatch({ type: "QUIZ_SUBMIT_FAILURE", payload: err.message });
  }
};

export const resetQuiz = () => ({
  type: "QUIZ_RESET",
});
