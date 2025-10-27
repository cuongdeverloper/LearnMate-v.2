const initialState = {
  list: [],
  selectedCourse: null,
  loading: false,
  error: null,
};

const courseReducer = (state = initialState, action) => {
  switch (action.type) {
    case "COURSE_REQUEST":
      return {
        ...state,
        loading: true,
        error: null,
      };

    case "COURSE_SUCCESS":
      return {
        ...state,
        loading: false,
        list: action.payload,
      };

    case "COURSE_FAILURE":
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

    case "COURSE_RESET":
      return initialState;

    default:
      return state;
  }
};

export default courseReducer;
