import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ScrollToTop from './components/common/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import ConductorManagement from './pages/admin/ConductorManagement';
import AsociacionManagement from './pages/admin/AsociacionManagement';
import PedidoManagement from './pages/PedidoManagement';
import ReporteManagement from './pages/admin/ReporteManagement';
import AuditManagement from './pages/admin/AuditManagement';
import Servicios from './pages/Servicios';
import Contacto from './pages/Contacto';
import Nosotros from './pages/Nosotros';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import SeguimientoPage from './pages/SeguimientoPage';

const AppContent = () => {
  const location = useLocation();
  const adminRoutes = [
    '/dashboard',
    '/admin/users',
    '/admin/conductores',
    '/admin/asociaciones',
    '/admin/reportes',
    '/admin/auditoria',
    '/pedidos'
  ];
  const isAdminRoute = adminRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/conductores" element={<ConductorManagement />} />
          <Route path="/admin/asociaciones" element={<AsociacionManagement />} />
          <Route path="/admin/reportes" element={<ReporteManagement />} />
          <Route path="/admin/auditoria" element={<AuditManagement />} />
          <Route path="/pedidos" element={<PedidoManagement />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/seguimiento/:pedidoId" element={<SeguimientoPage />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      <ToastContainer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;