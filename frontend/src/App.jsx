import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import Users from "./pages/Users";
import Reviews from "./pages/Reviews";
import Settings from "./pages/Settings";
import Blogs from "./pages/Blogs";
import BlogEditor from "./pages/BlogEditor";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AdminAnnouncementEditor from "./pages/AdminAnnouncementEditor";
import AdminMaterials from "./pages/AdminMaterials";
import AdminMaterialEditor from "./pages/AdminMaterialEditor";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books"
            element={
              <ProtectedRoute>
                <Books />
              </ProtectedRoute>
            }
          />
          <Route path="/announcements" element={<ProtectedRoute><AdminAnnouncements /></ProtectedRoute>} />
<Route path="/announcements/new" element={<ProtectedRoute><AdminAnnouncementEditor /></ProtectedRoute>} />
<Route path="/announcements/:id/edit" element={<ProtectedRoute><AdminAnnouncementEditor /></ProtectedRoute>} />

// MATERIALS
<Route path="/materials" element={<ProtectedRoute><AdminMaterials /></ProtectedRoute>} />
<Route path="/materials/new" element={<ProtectedRoute><AdminMaterialEditor /></ProtectedRoute>} />
<Route path="/materials/:id/edit" element={<ProtectedRoute><AdminMaterialEditor /></ProtectedRoute>} />
          <Route
  path="/blogs"
  element={
    <ProtectedRoute>
      <Blogs />
    </ProtectedRoute>
  }
/>
<Route
  path="/blogs/new"
  element={
    <ProtectedRoute>
      <BlogEditor />
    </ProtectedRoute>
  }
/>
<Route
  path="/blogs/:id/edit"
  element={
    <ProtectedRoute>
      <BlogEditor />
    </ProtectedRoute>
  }
/>
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <Reviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}