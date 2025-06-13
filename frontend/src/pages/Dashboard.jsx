import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../services/auth';
import { Link } from 'react-router-dom';
import { showAuthNotification, showSystemNotification } from '../components/NotificationToast';
import { 
  FaUsers, 
  FaUserTie, 
  FaBuilding, 
  FaRoute, 
  FaClipboardList, 
  FaChartBar,
  FaTruck,
  FaBoxOpen,
  FaSignOutAlt,
  FaTruckMoving,
  FaHistory
} from 'react-icons/fa';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    showAuthNotification('Has cerrado sesión exitosamente', 'LOGOUT');
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    getUser(token)
      .then((response) => {
        setUser(response.data);
        showAuthNotification(`¡Bienvenido de nuevo, ${response.data.name}!`, 'LOGIN');
      })
      .catch(() => {
        localStorage.removeItem('token');
        showAuthNotification('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'ERROR');
        navigate('/login');
      });
  }, [navigate]);

  if (!user) return null;

  const adminCards = [
    {
      title: "Gestión de Usuarios",
      icon: <FaUsers className="text-4xl text-blue-600" />,
      description: "Administra usuarios del sistema",
      link: "/admin/users",
      color: "bg-blue-50 hover:bg-blue-100"
    },
    {
      title: "Gestión de Conductores",
      icon: <FaUserTie className="text-4xl text-green-600" />,
      description: "Gestiona conductores y sus vehículos",
      link: "/admin/conductores",
      color: "bg-green-50 hover:bg-green-100"
    },
    {
      title: "Gestión de Asociaciones",
      icon: <FaBuilding className="text-4xl text-purple-600" />,
      description: "Administra asociaciones de transporte",
      link: "/admin/asociaciones",
      color: "bg-purple-50 hover:bg-purple-100"
    },
    {
      title: "Gestión de Rutas",
      icon: <FaRoute className="text-4xl text-red-600" />,
      description: "Optimiza y gestiona rutas de transporte",
      link: "/admin/rutas",
      color: "bg-red-50 hover:bg-red-100"
    },
    {
      title: "Gestión de Pedidos",
      icon: <FaClipboardList className="text-4xl text-yellow-600" />,
      description: "Administra pedidos y envíos",
      link: "/pedidos",
      color: "bg-yellow-50 hover:bg-yellow-100"
    },
    {
      title: "Reportes",
      icon: <FaChartBar className="text-4xl text-indigo-600" />,
      description: "Genera reportes y estadísticas",
      link: "/admin/reportes",
      color: "bg-indigo-50 hover:bg-indigo-100"
    },
    {
      title: "Auditoría",
      icon: <FaHistory className="text-4xl text-teal-600" />,
      description: "Registro de acciones en el sistema",
      link: "/admin/auditoria",
      color: "bg-teal-50 hover:bg-teal-100"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="h-16 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-between px-6">
        <div className="flex items-center space-x-3">
          <FaTruckMoving className="text-3xl text-white" />
          <span className="text-2xl font-bold text-white">S.A.R.A.</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
        >
          <FaSignOutAlt />
          <span>Cerrar Sesión</span>
        </button>
      </div>
      <main className="flex-grow container mx-auto px-4 py-8 -mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                  Bienvenido, {user.name}
                </h1>
                <p className="text-gray-600 capitalize">
                  Rol: {user.user_type}
                </p>
              </div>
            </div>
          </div>

          {user.user_type === 'admin' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminCards.map((card, index) => (
                <Link 
                  key={index} 
                  to={card.link}
                  className={`${card.color} rounded-lg shadow-md p-6 transition-all duration-300 transform hover:scale-105 border border-gray-100`}
                >
                  <div className="flex items-center space-x-4">
                    {card.icon}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{card.title}</h3>
                      <p className="text-gray-600 mt-1">{card.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {user.user_type === 'client' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex items-center space-x-4">
                  <FaBoxOpen className="text-4xl text-blue-600" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Mis Pedidos</h3>
                    <p className="text-gray-600 mt-1">Consulta el estado de tus pedidos de transporte</p>
                    <Link to="/pedidos" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
                      Gestionar Pedidos →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {user.user_type === 'driver' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex items-center space-x-4">
                  <FaTruck className="text-4xl text-green-600" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Asignaciones</h3>
                    <p className="text-gray-600 mt-1">Revisa tus asignaciones de transporte</p>
                    <Link to="/pedidos" className="mt-4 inline-block text-green-600 hover:text-green-800">
                      Ver Pedidos →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;