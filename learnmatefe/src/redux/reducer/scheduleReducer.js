// ✅ Trạng thái khởi tạo
const initialState = {
  allSchedules: [], // Lịch của tất cả các khóa học
  courseSchedule: {}, // Lịch riêng từng khóa học (key: courseId)
  loading: false,
  error: null,
};

// ✅ Reducer xử lý action
const scheduleReducer = (state = initialState, action) => {
  switch (action.type) {
    // --- Lấy toàn bộ lịch học ---
    case "SCHEDULE_ALL_REQUEST":
      return { ...state, loading: true, error: null };

    case "SCHEDULE_ALL_SUCCESS":
      return { ...state, loading: false, allSchedules: action.payload };

    case "SCHEDULE_ALL_FAILURE":
      return { ...state, loading: false, error: action.payload };

    // --- Lấy lịch của một khóa học cụ thể ---
    case "SCHEDULE_COURSE_REQUEST":
      return { ...state, loading: true, error: null };

    case "SCHEDULE_COURSE_SUCCESS":
      return {
        ...state,
        loading: false,
        courseSchedule: {
          ...state.courseSchedule,
          [action.payload.courseId]: action.payload.schedule,
        },
      };

    case "SCHEDULE_COURSE_FAILURE":
      return { ...state, loading: false, error: action.payload };

    // --- Reset (khi logout hoặc đổi user) ---
    case "SCHEDULE_RESET":
      return initialState;

    default:
      return state;
  }
};

export default scheduleReducer;
