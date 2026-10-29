// client/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import BooksPage from "./pages/BooksPage";
import BookDetail from "./pages/BookDetail";
import About from "./pages/About";
import BackEditions from "./pages/BackEditions";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import RequireAuth from "./context/RequireAuth";
import Checkout from "./pages/Checkout";
import BlogList from "./pages/BlogList";
import BlogDetail from "./pages/BlogDetail";
import AnnouncementList from "./pages/AnnouncementList";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import MaterialList from "./pages/MaterialList";
import MaterialDetail from "./pages/MaterialDetail";

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/books" element={<BooksPage />} />
                  <Route path="/books/:id" element={<BookDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/blog" element={<BlogList />} />
                  <Route path="/announcements" element={<AnnouncementList />} />
<Route path="/announcements/:category" element={<AnnouncementList />} />
<Route path="/announcements/detail/:id" element={<AnnouncementDetail />} />
<Route path="/back-editions" element={<BackEditions />} />

// MATERIALS
<Route path="/materials" element={<MaterialList />} />
<Route path="/materials/:category" element={<MaterialList />} />
<Route path="/materials/detail/:id" element={<MaterialDetail />} />
<Route path="/blog/:slug" element={<BlogDetail />} />
                  <Route path="*" element={<Home />} />
                  <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                  <Route
  path="/checkout"
  element={
    <RequireAuth>
      <Checkout />
    </RequireAuth>
  }
/>
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}