const initialState = {
  myCourses: [],
  selectedCourse: null, // courseId
  schedule: [],

  quizzes: [],
  selectedQuiz: null,
  quizDetails: null,
  userAnswers: {},
  quizResult: {},

  assignments: [],
  selectedAssignment: null,

  progress: {},

  submitting: false,
  loading: false,
  error: null,
};

const courseReducer = (state = initialState, action) => {
  switch (action.type) {
    // -------------------------------- COURSES -------------------------------
    case "COURSES_REQUEST":
      return {
        ...state,
        loading: true,
        error: null,
      };

    case "COURSES_SUCCESS":
      return {
        ...state,
        loading: false,
        myCourses: action.payload,
      };

    case "COURSES_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case "SELECT_COURSE":
      return {
        ...state,
        selectedCourse: action.payload,
      };

    case "COURSES_RESET":
      return initialState;

    // -------------------------------- SCHEDULE TASKS -------------------------------
    case "SCHEDULE_REQUEST":
      return {
        ...state,
        loading: true,
        error: null,
      };

    case "SCHEDULE_SUCCESS":
      return {
        ...state,
        schedule: action.payload,
      };

    case "SCHEDULE_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case "SCHEDULE_RESET":
      return {
        ...state,
        schedule: [],
      };

    // -------------------------------- QUIZZES -------------------------------

    case "QUIZZES_REQUEST":
      return {
        ...state,
        loading: true,
        error: null,
      };

    case "QUIZZES_SUCCESS":
      return {
        ...state,
        loading: false,
        quizzes: action.payload,
      };

    case "QUIZZES_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case "QUIZ_SELECT":
      return {
        ...state,
        selectedQuiz: action.payload.quizId,
        quizDetails: action.payload.quizDetails,
        userAnswers: {},
        quizResult: {},
      };

    case "QUIZ_SUBMIT_REQUEST":
      return {
        ...state,
        submitting: true,
        error: null,
      };

    case "QUIZ_SUBMIT_SUCCESS":
      return {
        ...state,
        submitting: false,
        quizzes: state.quizzes.map((q) =>
          q.id === action.payload.id ? action.payload : q
        ),
        result: action.payload.result,
      };

    case "QUIZ_SUBMIT_FAILURE":
      return {
        ...state,
        submitting: false,
        error: action.payload,
      };

    // -------------------------------- ASSIGNMENTS -------------------------------

    case "ASSIGNMENTS_REQUEST":
      return {
        ...state,
        loading: true,
        error: null,
      };

    case "ASSIGNMENTS_SUCCESS":
      return {
        ...state,
        loading: false,
        assignments: action.payload,
      };

    case "ASSIGNMENTS_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case "ASSIGNMENT_SELECT":
      return {
        ...state,
        selectedAssignment: action.payload,
      };
    case "ASSIGNMENT_SUBMIT_REQUEST":
      return {
        ...state,
        submitting: true,
        error: null,
      };

    case "ASSIGNMENT_SUBMIT_SUCCESS":
      return {
        ...state,
        submitting: false,
        assignments: state.assignments.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      };

    case "ASSIGNMENT_SUBMIT_FAILURE":
      return {
        ...state,
        submitting: false,
        error: action.payload,
      };

    // -------------------------------- PROGRESS -------------------------------

    case "PROGRESS_REQUEST":
      return {
        ...state,
        loading: true,
        error: null,
      };

    case "PROGRESS_SUCCESS":
      return {
        ...state,
        loading: false,
        progress: action.payload,
      };

    case "PROGRESS_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default courseReducer;
