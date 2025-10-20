const initialState = {
  list: [],
  selectedQuiz: null,
  quizDetails: null,
  userAnswers: {},
  submitting: false,
  loading: false,
  score: null,
  error: null,
};

// ✅ Reducer
const quizReducer = (state = initialState, action) => {
  switch (action.type) {
    case "QUIZ_LIST_REQUEST":
      return { ...state, loading: true, error: null };

    case "QUIZ_LIST_SUCCESS":
      return { ...state, loading: false, list: action.payload };

    case "QUIZ_LIST_FAILURE":
      return { ...state, loading: false, error: action.payload };

    case "QUIZ_DETAILS_REQUEST":
      return { ...state, loading: true, error: null };

    case "QUIZ_DETAILS_SUCCESS":
      return { ...state, loading: false, quizDetails: action.payload };

    case "QUIZ_DETAILS_FAILURE":
      return { ...state, loading: false, error: action.payload };

    // --- Chọn quiz để làm ---
    case "QUIZ_SELECT":
      return {
        ...state,
        selectedQuiz: action.payload,
        userAnswers: {}, // reset câu trả lời cũ
        score: null, // reset điểm cũ
      };

    // --- Lưu câu trả lời tạm ---
    case "QUIZ_SAVE_ANSWER":
      return {
        ...state,
        userAnswers: {
          ...state.userAnswers,
          [action.payload.questionId]: action.payload.answer,
        },
      };

    // --- Nộp bài quiz ---
    case "QUIZ_SUBMIT_REQUEST":
      return { ...state, submitting: true, error: null };

    case "QUIZ_SUBMIT_SUCCESS":
      return {
        ...state,
        submitting: false,
        score: action.payload.score, // Điểm từ API
      };

    case "QUIZ_SUBMIT_FAILURE":
      return { ...state, submitting: false, error: action.payload };

    // --- Reset khi đổi khóa học hoặc logout ---
    case "QUIZ_RESET":
      return initialState;

    default:
      return state;
  }
};

export default quizReducer;
