const initialState = {
  list: [],
  selectedCourse: null,
  loading: false,
  error: null,
};

const courseReducer = (state = initialState, action) => {
  switch (action.type) {
    case "MY_COURSE_REQUEST":
      return {
        ...state,
        loading: true,
        error: null,
      };

    case "MY_COURSE_SUCCESS":
      return {
        ...state,
        loading: false,
        list: action.payload,
      };

    case "MY_COURSE_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case "MY_SELECT_COURSE":
      return {
        ...state,
        selectedCourse: action.payload,
      };

    case "MY_COURSE_RESET":
      return initialState;

    default:
      return state;
  }
};

export default courseReducer;
