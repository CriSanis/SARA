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
      <main className="flex-grow container-center bg-background-light">
        <h1 className="text-3xl font-bold mb-6">
          Bienvenido, {user.name} ({user.user_type})
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          {user.user_type === 'client' && (
            <Card title="Mis Pedidos">
              <p className="text-text-light">Consulta el estado de tus pedidos de transporte.</p>
              <button className="mt-4 text-primary hover:underline">
                Ver Pedidos
              </button>
            </Card>
          )}
          {user.user_type === 'driver' && (
            <Card title="Asignaciones">
              <p className="text-text-light">Revisa tus asignaciones de transporte.</p>
              <button className="mt-4 text-primary hover:underline">
                Ver Asignaciones
              </button>
            </Card>
          )}
          {user.user_type === 'admin' && (
            <Card title="Panel de Administración">
              <p className="text-text-light">Gestiona usuarios, pedidos y conductores.</p>
              <button className="mt-4 text-primary hover:underline">
                Ir al Panel
              </button>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;