import React from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation
} from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import PackagesListing from './pages/PackagesListing';
import PackageDetails from './pages/PackageDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/packages" element={<PackagesListing />} />
          <Route path="/package/:id" element={<PackageDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/panel"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin/panel" replace />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <WhatsAppButton />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppShell />
    </Router>
  );
}

export default App;
