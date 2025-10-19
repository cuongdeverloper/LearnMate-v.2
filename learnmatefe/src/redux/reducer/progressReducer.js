// ✅ Trạng thái khởi tạo
const initialState = {
  data: {}, // Lưu tiến trình theo courseId: { [courseId]: { percent, completedLessons, ... } }
  loading: false, // Khi đang fetch dữ liệu
  error: null, // Khi có lỗi API
};

// ✅ Reducer xử lý action
const progressReducer = (state = initialState, action) => {
  switch (action.type) {
    // --- Lấy tiến trình ---
    case "PROGRESS_FETCH_REQUEST":
      return { ...state, loading: true, error: null };

    case "PROGRESS_FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        // Lưu tiến trình theo courseId
        data: {
          ...state.data,
          [action.payload.courseId]: action.payload.progress,
        },
      };

    case "PROGRESS_FETCH_FAILURE":
      return { ...state, loading: false, error: action.payload };

    // --- Cập nhật tiến trình (ví dụ khi user hoàn thành một phần mới) ---
    case "PROGRESS_UPDATE":
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.courseId]: {
            ...state.data[action.payload.courseId],
            ...action.payload.progress, // cập nhật phần tiến trình mới
          },
        },
      };

    // --- Reset khi logout hoặc đổi user ---
    case "PROGRESS_RESET":
      return initialState;

    default:
      return state;
  }
};

export default progressReducer;
