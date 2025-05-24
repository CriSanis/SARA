import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { register } from '../services/auth';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    user_type: 'client',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await register(formData);
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Error al registrarse. Verifica los datos.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container-center bg-background-light">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Registro</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-text-light mb-1">Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full"
                placeholder="Tu nombre"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-text-light mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full"
                placeholder="tuemail@ejemplo.com"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-text-light mb-1">Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full"
                placeholder="********"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-text-light mb-1">Confirmar Contraseña</label>
              <input
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className="w-full"
                placeholder="********"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-text-light mb-1">Teléfono</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full"
                placeholder="123456789"
              />
            </div>
            <div className="mb-4">
              <label className="block text-text-light mb-1">Tipo de Usuario</label>
              <select
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
                className="w-full"
              >
                <option value="client">Cliente</option>
                <option value="driver">Conductor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <Button type="submit">Registrarse</Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;