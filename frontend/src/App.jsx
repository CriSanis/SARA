import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import ConductorManagement from './pages/admin/ConductorManagement';
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
      </Routes>
    </Router>
  );
}

export default App;