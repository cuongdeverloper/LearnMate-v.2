import React, { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Aos from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import StudentHomePage from "./components/HomePage/Student homepage/StudentHomePage";
import SignUp from "./components/Auth/Sign up/SignUp";
import SignIn from "./components/Auth/Sign in/SignIn";
import { BrowserRouter, Route, Routes ,useLocation} from "react-router-dom";
import TutorDashboard from "./components/Tutor/TutorDashboard";
import BookingPage from "./pages/Booking/bookingPage";
import TutorListPage from "./pages/Booking/tutorPage";
import BookingHistoryPage from "./pages/User/BookingHistory";
import SavedTutorsPage from "./pages/Booking/SavedTutorPage";
import ProtectedRoute from "./ProtectRoutes";
import Header from "./components/Layout/Header/Header";
import Footer from "./components/Layout/Footer/Footer";
import TutorProfilePage from "./pages/Tutor/TutorProfilePage";

const AppLayout = ({ children }) => {
  const location = useLocation();
  const noHeaderFooterRoutes = ["/otp-verify", "/auth/callback"];
  const hideHeaderFooter = noHeaderFooterRoutes.includes(location.pathname);
  useEffect(() => {

  }, [])
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
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/TutorDashboard" element={
            // <ProtectedRoute allowedRoles={['tutor']}>
              <TutorDashboard />
            // </ProtectedRoute>
          } />
        <Route/>
        <Route
            path="/tutors"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin','tutor']}>
                <AppLayout>
                  <TutorListPage />
                </AppLayout>
              </ProtectedRoute>}
          />
                  <Route/>
        <Route
            path="/tutors/profile/:tutorId"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin','tutor']}>
                <AppLayout>
                  <TutorProfilePage />
                </AppLayout>
              </ProtectedRoute>}
          />
          <Route
            path="/saved-tutors"
            element={
              <ProtectedRoute allowedRoles={['student','tutor']}>
                <AppLayout>
                  <SavedTutorsPage />
                </AppLayout>

              </ProtectedRoute>
            }
          />
          <Route
            path="/book/:tutorId"
            element={
              <ProtectedRoute allowedRoles={['student','tutor']}>
                <BookingPage />
              </ProtectedRoute>
            }
          />
                    <Route
            path="/user/bookinghistory"
            element={
              <ProtectedRoute allowedRoles={['tutor', 'student']}>
                <BookingHistoryPage />
              </ProtectedRoute>
            }
          />
       </Routes>
      </BrowserRouter>
    </Suspense>
  );
};

export default Layout;
