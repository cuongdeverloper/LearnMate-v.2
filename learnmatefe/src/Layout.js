import React, { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Aos from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import StudentHomePage from "./components/HomePage/Student homepage/StudentHomePage";
import SignUp from "./components/Auth/Sign up/SignUp";
import SignIn from "./components/Auth/Sign in/SignIn";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import TutorDashboard from "./components/Tutor/TutorDashboard";



const AppLayout = ({ children }) => {

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
       </Routes>
      </BrowserRouter>
    </Suspense>
  );
};

export default Layout;
