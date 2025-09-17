import React, { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Aos from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import TutorListPage from "./pages/Booking/tutorPage";
import SavedTutorsPage from "./pages/Booking/SavedTutorPage";
import Header from "./pages/Layout/Header/Header";
import Footer from "./pages/Layout/Footer/Footer";
import ProtectedRoute from "./ProtectRoutes";
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
       <Route
            path="/tutor"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin','tutor']}>
                <AppLayout>
                  <TutorListPage />
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
       </Routes>
      </BrowserRouter>
    </Suspense>
  );
};

export default Layout;
