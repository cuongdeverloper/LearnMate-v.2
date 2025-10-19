// ✅ Trạng thái khởi tạo
const initialState = {
  list: [], // Danh sách quiz của khóa học hiện tại
  selectedQuiz: null, // Quiz đang làm / đang xem
  userAnswers: {}, // Câu trả lời tạm thời trước khi nộp
  submitting: false, // Đang gửi bài
  loading: false, // Đang tải danh sách hoặc quiz chi tiết
  score: null, // Điểm số nhận được sau khi nộp
  error: null, // Lỗi API hoặc logic
};

// ✅ Reducer
const quizReducer = (state = initialState, action) => {
  switch (action.type) {
    // --- Lấy danh sách quiz ---
    case "QUIZ_LIST_REQUEST":
      return { ...state, loading: true, error: null };

    case "QUIZ_LIST_SUCCESS":
      return { ...state, loading: false, list: action.payload };

    case "QUIZ_LIST_FAILURE":
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
