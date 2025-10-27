const initialState = {
  list: [],
  selectedQuiz: null,
  quizDetails: null,
  userAnswers: {},
  submitting: false,
  loading: false,
  result: {},
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

    case "QUIZ_SELECT":
      return {
        ...state,
        selectedQuiz: action.payload,
        userAnswers: {},
        score: null,
      };

    case "QUIZ_SAVE_ANSWER":
      return {
        ...state,
        userAnswers: {
          ...state.userAnswers,
          [action.payload.questionId]: action.payload.answer,
        },
      };

    case "QUIZ_SUBMIT_REQUEST":
      return { ...state, submitting: true, error: null, result: null };

    case "QUIZ_SUBMIT_SUCCESS":
      return {
        ...state,
        submitting: false,
        result: action.payload.result,
      };

    case "QUIZ_SUBMIT_FAILURE":
      return { ...state, submitting: false, error: action.payload };

    case "QUIZ_RESET":
      return initialState;

    default:
      return state;
  }
};

export default quizReducer;
