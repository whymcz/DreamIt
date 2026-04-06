import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ParentDashboard from "./pages/ParentDashboard";
import MecenatDashboard from "./pages/MecenatDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DreamSubmissionPage from "./pages/DreamSubmissionPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPendingDreams from "./pages/AdminPendingDreams";
import AdminUsers from "./pages/AdminUsers";
import AdminMecenasRequests from "./pages/AdminMecenasRequests";
import JoyWall from "./pages/JoyWall";
import CreateJoyPost from "./pages/CreateJoyPost";
import AdminJoyPosts from "./pages/AdminJoyPosts";


/* DREAM MARKETPLACE */
import MecenasDreams from "./pages/MecenasDreams";

/* NEW MESSAGING PAGE */
import Messages from "./pages/Messages";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>

        {/* REDIRECT ADMIN DASHBOARD */}
        <Route
          path="/admin/dashboard"
          element={<Navigate to="/admin/parent-submissions" />}
        />

        {/* ================= HOME ================= */}
        <Route path="/" element={<Home />} />


        <Route path="/joy" element={<JoyWall />} />
        <Route path="/joy/create" element={<CreateJoyPost />} />
        <Route path="/admin/joy-posts" element={<AdminJoyPosts />} />

        {/* ================= AUTH ================= */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* ================= ADMIN ROUTES ================= */}

        <Route
          path="/admin/parent-submissions"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/mecenas-requests"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminMecenasRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dreams"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPendingDreams />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        {/* ================= USER DASHBOARDS ================= */}

        <Route
          path="/parent-dashboard"
          element={
            <ProtectedRoute>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mecenas-dashboard"
          element={
            <ProtectedRoute>
              <MecenatDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= DREAM MARKETPLACE ================= */}

        <Route
          path="/dreams"
          element={
            <ProtectedRoute requiredRole="mecenas">
              <MecenasDreams />
            </ProtectedRoute>
          }
        />

        {/* ================= PROFILE ================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ================= DREAM SUBMISSION ================= */}

        <Route
          path="/submit-dream"
          element={
            <ProtectedRoute>
              <DreamSubmissionPage />
            </ProtectedRoute>
          }
        />

        {/* ================= MESSAGING ================= */}

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages/:dreamId"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        {/* ================= PASSWORD ================= */}

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

      </Routes>
    </Router>
  );
}

export default App;