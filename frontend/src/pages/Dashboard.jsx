import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import { getUser } from '../services/auth';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    getUser(token)
      .then((response) => setUser(response.data))
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-100">
        <div className="container mx-auto py-12">
          <h1 className="text-3xl font-bold text-blue-600 mb-6">
            Bienvenido, {user.name} ({user.user_type})
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.user_type === 'client' && (
              <Card title="Mis Pedidos">
                <p>Consulta el estado de tus pedidos de transporte.</p>
                <button className="mt-4 text-blue-600 hover:underline">
                  Ver Pedidos
                </button>
              </Card>
            )}
            {user.user_type === 'driver' && (
              <Card title="Asignaciones">
                <p>Revisa tus asignaciones de transporte.</p>
                <button className="mt-4 text-blue-600 hover:underline">
                  Ver Asignaciones
                </button>
              </Card>
            )}
            {user.user_type === 'admin' && (
              <Card title="Panel de Administración">
                <p>Gestiona usuarios, pedidos y conductores.</p>
                <button className="mt-4 text-blue-600 hover:underline">
                  Ir al Panel
                </button>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;