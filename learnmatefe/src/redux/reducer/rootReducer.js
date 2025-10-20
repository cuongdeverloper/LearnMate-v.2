import { combineReducers } from "redux";
import userReducer from "./userReducer";
import assignmentReducer from "./assignmentReducer";
import courseReducer from "./courseReducer";
import progressReducer from "./progressReducer";
import quizReducer from "./quizReducer";
import scheduleReducer from "./scheduleReducer";

const rootReducer = combineReducers({
  user: userReducer,
  assignments: assignmentReducer,
  courses: courseReducer,
  progress: progressReducer,
  quizzes: quizReducer,
  schedules: scheduleReducer,
});

export default rootReducer;
