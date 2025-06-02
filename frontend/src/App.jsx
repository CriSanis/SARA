import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import ConductorManagement from './pages/admin/ConductorManagement';
import AsociacionManagement from './pages/admin/AsociacionManagement';
import PedidoManagement from './pages/PedidoManagement';
import RutaManagement from './pages/admin/RutaManagement';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/conductores" element={<ConductorManagement />} />
        <Route path="/admin/asociaciones" element={<AsociacionManagement />} />
        <Route path="/admin/rutas" element={<RutaManagement />} />
        <Route path="/pedidos" element={<PedidoManagement />} />
      </Routes>
    </Router>
  );
}

export default App;