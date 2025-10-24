import React, { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Aos from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import StudentHomePage from "./components/HomePage/Student homepage/StudentHomePage";
// import SignUp from "./components/Auth/Sign up/SignUp";
import SignIn from "./components/Auth/Sign in/SignIn";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import TutorDashboard from "./components/Tutor/TutorDashboard";
import BookingPage from "./pages/Booking/bookingPage";
import TutorListPage from "./pages/Booking/tutorPage";
import BookingHistoryPage from "./pages/User/BookingHistory";
import SavedTutorsPage from "./pages/Booking/SavedTutorPage";
import ProtectedRoute from "./ProtectRoutes";
import Header from "./components/Layout/Header/Header";
import Footer from "./components/Layout/Footer/Footer";
import TutorProfilePage from "./pages/Tutor/TutorProfilePage";
import MyCourses from "./pages/User/AllCoursesSchedule";
import Profile from "./pages/Profile/Profile";
import AuthCallback from "./components/Auth/AuthCallback";
import EnterOTPRegister from "./components/Auth/Sign up/OTP/EnterOTPRegister";
import RequestPasswordReset from "./components/Auth/reset password/RequestPasswordReset";
import ResetPassword from "./components/Auth/reset password/ResetPassword";

import Messenger from "./Message Socket/Page/Messenger";
import PaymentPage from "./pages/User/PaymentPage";
import PaymentResult from "./pages/User/paymentResult";
import TutorApplicationForm from "./pages/Profile/TutorApplicationForm";
import ReviewCoursePage from "./pages/Review/ReviewCoursePage";

import AdminDashboard from "./components/Admin/AdminDashboard";
import MyCoursesPage from "./pages/User/MyCoursesPage";
import CourseDetails from "./pages/User/CourseDetails";
import StudentQuizTake from "./pages/User/StudentQuizTake";
import StudentQuizResult from "./pages/User/StudentQuizResult";
import StudentQuizOverview from "./pages/User/StudentQuizOverview";
import SubmitAssignment from "./pages/User/SubmitAssignment";
import ViewAssignmentFeedback from "./pages/User/ViewAssignmentFeedback";

const AppLayout = ({ children }) => {
  const location = useLocation();
  const noHeaderFooterRoutes = ["/otp-verify", "/auth/callback"];
  const hideHeaderFooter = noHeaderFooterRoutes.includes(location.pathname);
  useEffect(() => {}, []);
  return (
    <>
      {!hideHeaderFooter && <Header />}
      {children}
      {!hideHeaderFooter && <Footer />}
    </>
  );
};
const Layout = () => {
  useEffect(() => {
    Aos.init({ duration: 1000 });
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StudentHomePage />} />
          {/* <Route path="/signup" element={<SignUp />} /> */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/otp-verify" element={<EnterOTPRegister />} />
          <Route path="auth/callback" element={<AuthCallback />} />

          <Route
            path="/messenger"
            element={
              // <ProtectedRoute allowedRoles={['tutor', 'student', 'admin']}>
              <Messenger />
              // </ProtectedRoute>
            }
          />
          <Route
            path="/messenger/:conversationId"
            element={
              // <ProtectedRoute allowedRoles={['tutor', 'student', 'admin']}>
              <Messenger />
              // </ProtectedRoute>
            }
          />
          <Route path="/forgot-password" element={<RequestPasswordReset />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/TutorDashboard"
            element={
              // <ProtectedRoute allowedRoles={['tutor']}>
              <TutorDashboard />
              // </ProtectedRoute>
            }
          />
          <Route />
          <Route
            path="/tutor"
            element={
              <ProtectedRoute allowedRoles={["student", "admin", "tutor"]}>
                <AppLayout>
                  <TutorListPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route />
          <Route
            path="/tutor/profile/:tutorId"
            element={
              <ProtectedRoute allowedRoles={["student", "admin", "tutor"]}>
                <AppLayout>
                  <TutorProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved-tutors"
            element={
              <ProtectedRoute allowedRoles={["student", "tutor"]}>
                <AppLayout>
                  <SavedTutorsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/book/:tutorId"
            element={
              <ProtectedRoute allowedRoles={["student", "tutor"]}>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/bookinghistory"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student"]}>
                <BookingHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/my-courses"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student"]}>
                <AppLayout>
                  <MyCoursesPage />
                  {/* <MyCourses /> */}
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/my-courses/:id"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student"]}>
                <AppLayout>
                  <CourseDetails />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/quiz/:id"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student"]}>
                <AppLayout>
                  <StudentQuizOverview />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/quiz/:id/take"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student"]}>
                <AppLayout>
                  <StudentQuizTake />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/quiz/:id/result"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student"]}>
                <AppLayout>
                  <StudentQuizResult />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/my-courses/:courseId/assignments/:id/submit"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student"]}>
                <AppLayout>
                  <SubmitAssignment />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/my-courses/:courseId/assignments/:id/feedback"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student"]}>
                <AppLayout>
                  <ViewAssignmentFeedback />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student", "admin"]}>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="auth/callback" element={<AuthCallback />} />
          <Route
            path="/user/paymentinfo"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student"]}>
                <AppLayout>
                  <PaymentPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor-application"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student"]}>
                <AppLayout>
                  <TutorApplicationForm />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/payment/result" element={<PaymentResult />} />
          <Route
            path="/review/:bookingId"
            element={
              <ProtectedRoute allowedRoles={["student", "tutor"]}>
                <AppLayout>
                  <ReviewCoursePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
};

export default Layout;
