import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../services/auth';
import { Link } from 'react-router-dom';
import { showAuthNotification, showSystemNotification } from '../components/NotificationToast';
import { 
  FaUsers, 
  FaUserTie, 
  FaBuilding, 
  FaClipboardList, 
  FaChartBar,
  FaTruck,
  FaBoxOpen,
  FaSignOutAlt,
  FaTruckMoving,
  FaHistory,
  FaMapMarkerAlt,
  FaClock
} from 'react-icons/fa';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los íconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [pedidosActivos, setPedidosActivos] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        if (response.data.user_type === 'driver') {
          fetchPedidosActivos(token);
          initializeGeolocation();
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        showAuthNotification('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'ERROR');
        navigate('/login');
      });
  }, [navigate]);

  const fetchPedidosActivos = async (token) => {
    try {
      const response = await axios.get('http://localhost:8000/api/pedidos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userId = parseInt(localStorage.getItem('userId'));
      const pedidosFiltrados = response.data.filter(pedido => 
        pedido.conductor_id === userId && 
        pedido.estado !== 'completado'
      );
      setPedidosActivos(pedidosFiltrados);
    } catch (error) {
      console.error('Error al cargar pedidos activos:', error);
      showSystemNotification('Error al cargar pedidos activos', 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  const initializeGeolocation = () => {
    if ("geolocation" in navigator) {
      // Obtener ubicación inicial
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          showSystemNotification('Ubicación obtenida exitosamente', 'SUCCESS');
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          let mensaje = 'Error al obtener ubicación';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              mensaje = 'Se requiere permiso para acceder a la ubicación';
              break;
            case error.POSITION_UNAVAILABLE:
              mensaje = 'La información de ubicación no está disponible';
              break;
            case error.TIMEOUT:
              mensaje = 'Se agotó el tiempo de espera para obtener la ubicación';
              break;
          }
          showSystemNotification(mensaje, 'ERROR');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );

      // Monitoreo continuo de ubicación
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error monitoreando ubicación:", error);
          // No mostramos notificación aquí para no molestar al usuario
          // ya que el monitoreo continuo puede fallar temporalmente
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );

      // Limpiar el monitoreo cuando el componente se desmonte
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      showSystemNotification('Tu navegador no soporta geolocalización', 'ERROR');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    showAuthNotification('Has cerrado sesión exitosamente', 'LOGOUT');
    navigate('/login');
  };

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
            <div className="grid grid-cols-1 gap-6">
              {/* Información del Conductor */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex items-center space-x-4">
                  <FaUserTie className="text-4xl text-indigo-600" />
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-800">Información del Conductor</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-500">Nombre</p>
                        <p className="text-gray-800 font-medium">{user.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Licencia</p>
                        <p className="text-gray-800 font-medium">{user.conductor?.licencia || 'No disponible'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estado</p>
                        <p className="text-gray-800 font-medium">Activo</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Última Actualización</p>
                        <p className="text-gray-800 font-medium">{new Date().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mi Ubicación Actual */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex items-center space-x-4">
                  <FaMapMarkerAlt className="text-4xl text-blue-600" />
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-800">Mi Ubicación Actual</h3>
                    {currentLocation ? (
                      <div className="mt-4">
                        <div className="h-64 w-full rounded-lg overflow-hidden">
                          <MapContainer 
                            center={[currentLocation.lat, currentLocation.lng]} 
                            zoom={15} 
                            style={{ height: '100%', width: '100%' }}
                          >
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker position={[currentLocation.lat, currentLocation.lng]}>
                              <Popup>
                                Tu ubicación actual
                              </Popup>
                            </Marker>
                          </MapContainer>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <p>Latitud: {currentLocation.lat.toFixed(6)}</p>
                          <p>Longitud: {currentLocation.lng.toFixed(6)}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 mt-2">Obteniendo tu ubicación actual...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Pedidos Activos */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex items-center space-x-4">
                  <FaTruck className="text-4xl text-green-600" />
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-800">Pedidos Activos</h3>
                    {loading ? (
                      <p className="text-gray-600 mt-2">Cargando pedidos...</p>
                    ) : pedidosActivos.length > 0 ? (
                      <div className="mt-4 space-y-4">
                        {pedidosActivos.map(pedido => (
                          <div key={pedido.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                  <div>
                                <h4 className="font-medium text-gray-800">Pedido #{pedido.id}</h4>
                                <p className="text-sm text-gray-600 mt-1">{pedido.direccion_origen} → {pedido.direccion_destino}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                pedido.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                pedido.estado === 'en_progreso' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {pedido.estado}
                              </span>
                            </div>
                            {pedido.fecha_entrega && (
                              <div className="mt-2 flex items-center text-sm text-gray-600">
                                <FaClock className="mr-2" />
                                Entrega: {new Date(pedido.fecha_entrega).toLocaleString()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 mt-2">No tienes pedidos activos en este momento</p>
                    )}
                    <Link to="/pedidos" className="mt-4 inline-block text-green-600 hover:text-green-800">
                      Ver todos los pedidos →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Historial de Entregas */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex items-center space-x-4">
                  <FaHistory className="text-4xl text-purple-600" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Historial de Entregas</h3>
                    <p className="text-gray-600 mt-1">Revisa tus entregas completadas</p>
                    <Link to="/pedidos" className="mt-4 inline-block text-purple-600 hover:text-purple-800">
                      Ver Historial →
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