const initialState = {
  list: [],
  selectedAssignment: null,
  submitting: false,
  loading: false,
  feedback: null,
  error: null,
};

const assignmentReducer = (state = initialState, action) => {
  switch (action.type) {
    case "ASSIGNMENT_LIST_REQUEST":
      return { ...state, loading: true, error: null };

    case "ASSIGNMENT_LIST_SUCCESS":
      return { ...state, loading: false, list: action.payload };

    case "ASSIGNMENT_LIST_FAILURE":
      return { ...state, loading: false, error: action.payload };

    case "ASSIGNMENT_SELECT":
      return { ...state, selectedAssignment: action.payload };

    case "ASSIGNMENT_SUBMIT_REQUEST":
      return { ...state, submitting: true, error: null };

    case "ASSIGNMENT_SUBMIT_SUCCESS":
      return {
        ...state,
        submitting: false,
        list: state.list.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      };

    case "ASSIGNMENT_SUBMIT_FAILURE":
      return { ...state, submitting: false, error: action.payload };

    case "ASSIGNMENT_FEEDBACK_SUCCESS":
      return { ...state, feedback: action.payload };

    case "ASSIGNMENT_RESET":
      return initialState;

    default:
      return state;
  }
};

export default assignmentReducer;
