import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaTruck, FaUser, FaMapMarkerAlt, FaInfoCircle, FaUserPlus, FaClock } from 'react-icons/fa';
import axios from 'axios';
import { showPedidoNotification, showSystemNotification, showEstadoNotification, showTiempoNotification } from '../components/NotificationToast';
import NotificationBell from '../components/NotificationBell';

const PedidoManagement = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [formData, setFormData] = useState({ origen: '', destino: '', descripcion: '' });
  const [editingId, setEditingId] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [asignacionForm, setAsignacionForm] = useState({
    pedido_id: '',
    conductor_id: ''
  });
  const notificationBellRef = useRef(null);

  useEffect(() => {
    if (token) {
      fetchUserRole();
    }
  }, [token]);

  useEffect(() => {
    if (userRole) {
      fetchPedidos();
      if (userRole === 'admin') {
        fetchConductores();
      }
    }
  }, [userRole]);

  const fetchUserRole = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserRole(response.data.roles[0].name);
    } catch (err) {
      console.error('Error al obtener el rol del usuario:', err);
      setError('Error al cargar la información del usuario');
    }
  };

  const fetchConductores = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filtrar solo los usuarios que son conductores y obtener sus IDs de conductor
      const conductoresFiltrados = response.data
        .filter(user => user.roles && user.roles.some(role => role.name === 'driver'))
        .map(user => ({
          id: user.conductor?.id, // Usar el ID del conductor, no el ID del usuario
          name: user.name,
          user_id: user.id
        }))
        .filter(conductor => conductor.id); // Solo incluir conductores con ID válido
      
      setConductores(conductoresFiltrados);
      setError(null);
    } catch (err) {
      console.error('Error al cargar conductores:', err);
      setError('Error al cargar la lista de conductores');
    } finally {
      setLoading(false);
    }
  };

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/pedidos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      const response = await axios.post('http://localhost:8000/api/pedidos', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos([...pedidos, response.data]);
      showSystemNotification('Pedido creado exitosamente', 'SUCCESS');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al crear el pedido';
      setError(errorMessage);
      showSystemNotification(errorMessage, 'ERROR');
      console.error('Error detallado:', err.response?.data);
      throw err;
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const response = await axios.put(`http://localhost:8000/api/pedidos/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(pedidos.map(pedido => 
        pedido.id === id ? response.data : pedido
      ));

      // Mostrar notificación de cambio de estado
      if (data.estado) {
        showEstadoNotification(
          `El estado del pedido ha cambiado a: ${data.estado}`,
          data.estado
        );
      }

      // Mostrar notificación de cambio de tiempo
      if (data.tiempo_estimado) {
        showTiempoNotification(
          `El tiempo estimado ha sido actualizado a: ${data.tiempo_estimado}`,
          data.tiempo_estimado,
          data.fecha_estimada
        );
      }

      return response.data;
    } catch (err) {
      setError('Error al actualizar el pedido');
      showSystemNotification('No se pudo actualizar el pedido. Por favor, intente nuevamente.', 'ERROR');
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/pedidos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(pedidos.filter(pedido => pedido.id !== id));
    } catch (err) {
      setError('Error al eliminar el pedido');
    }
  };

  if (!token) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await handleUpdate(editingId, formData);
      } else {
        await handleCreate(formData);
      }
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (pedido) => {
    setEditingId(pedido.id);
    setFormData({
      origen: pedido.origen,
      destino: pedido.destino,
      descripcion: pedido.descripcion || '',
    });
    // Scroll al formulario de edición
    document.querySelector('.form-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ origen: '', destino: '', descripcion: '' });
  };

  const canCreatePedido = userRole === 'client' || userRole === 'admin';
  const canEditPedido = (pedido) => {
    if (userRole === 'admin') return true;
    if (userRole === 'client') return pedido.cliente_id === parseInt(localStorage.getItem('userId'));
    if (userRole === 'driver') return pedido.conductor_id === parseInt(localStorage.getItem('conductorId'));
    return false;
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800';
      case 'completado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAsignarConductor = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/pedido-conductor', {
        pedido_id: parseInt(asignacionForm.pedido_id),
        conductor_id: parseInt(asignacionForm.conductor_id)
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      await fetchPedidos();
      setAsignacionForm({
        pedido_id: '',
        conductor_id: ''
      });
      
      showPedidoNotification('El conductor ha sido asignado exitosamente al pedido', 'ASSIGNED');
      
      // Notificar al cliente
      const pedido = pedidos.find(p => p.id === parseInt(asignacionForm.pedido_id));
      const conductor = conductores.find(c => c.id === parseInt(asignacionForm.conductor_id));
      
      if (pedido && conductor) {
        const notification = {
          title: 'Conductor Asignado',
          message: `Se ha asignado a ${conductor.name} como conductor de tu pedido de ${pedido.origen} a ${pedido.destino}`,
          timestamp: new Date().toISOString(),
          read: false
        };
        notificationBellRef.current?.addNotification(notification);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al asignar conductor:', err);
      setError(err.response?.data?.message || 'Error al asignar el conductor');
      showSystemNotification('No se pudo asignar el conductor. Por favor, intente nuevamente.', 'ERROR');
    }
  };

      return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-16 shadow-lg flex items-center justify-between px-6">
        <div className="flex items-center space-x-3">
          <FaTruck className="text-3xl text-white" />
          <span className="text-2xl font-bold text-white">S.A.R.A.</span>
              </div>
        <div className="flex items-center space-x-4">
          <NotificationBell ref={notificationBellRef} userRole={userRole} />
              </div>
              </div>
      <main className="container mx-auto px-4 py-8 -mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 mb-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaBox className="text-2xl sm:text-3xl text-blue-600" />
              </div>
              <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                    {userRole === 'client' && 'Mis Pedidos'}
                    {userRole === 'driver' && 'Pedidos Asignados'}
                    {userRole === 'admin' && 'Gestión de Pedidos'}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    {userRole === 'client' && 'Administra tus pedidos de transporte'}
                    {userRole === 'driver' && 'Gestiona los pedidos asignados a ti'}
                    {userRole === 'admin' && 'Administra todos los pedidos del sistema'}
                  </p>
              </div>
              </div>
                        </div>
              </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
              <div className="flex items-center">
                <FaInfoCircle className="mr-2" />
                {error}
              </div>
                </div>
              )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8">
            {canCreatePedido && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 form-container">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800 flex items-center">
                  <FaBox className="mr-2 text-blue-600" />
                  {editingId ? 'Editar Pedido' : 'Nuevo Pedido'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaMapMarkerAlt className="inline mr-2 text-blue-600" />
                      Origen
                    </label>
                    <input
                      type="text"
                      value={formData.origen}
                      onChange={(e) => setFormData({...formData, origen: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaMapMarkerAlt className="inline mr-2 text-blue-600" />
                      Destino
                    </label>
                    <input
                      type="text"
                      value={formData.destino}
                      onChange={(e) => setFormData({...formData, destino: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaInfoCircle className="inline mr-2 text-blue-600" />
                      Descripción
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      rows="3"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                  {editingId && (
                                         <button
                                            type="button"
                        onClick={resetForm}
                        className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingId ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {userRole === 'admin' && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800 flex items-center">
                  <FaUserPlus className="mr-2 text-blue-600" />
                  Asignar Conductor
                </h2>
                <form onSubmit={handleAsignarConductor} className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaBox className="inline mr-2 text-blue-600" />
                      Pedido
                    </label>
                   <select
                     value={asignacionForm.pedido_id}
                      onChange={(e) => setAsignacionForm({...asignacionForm, pedido_id: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                     required
                   >
                      <option value="">Seleccionar pedido</option>
                     {pedidos
                        .filter(pedido => !pedido.conductor_id)
                        .map(pedido => (
                         <option key={pedido.id} value={pedido.id}>
                            {pedido.origen} → {pedido.destino}
                         </option>
                       ))}
                   </select>
                 </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaUser className="inline mr-2 text-blue-600" />
                      Conductor
                    </label>
                   <select
                     value={asignacionForm.conductor_id}
                      onChange={(e) => setAsignacionForm({...asignacionForm, conductor_id: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                     required
                      disabled={loading}
                    >
                      <option value="">Seleccionar conductor</option>
                      {conductores.map(conductor => (
                        <option key={conductor.id} value={conductor.id}>
                          {conductor.name || 'Conductor sin nombre'}
                       </option>
                     ))}
                   </select>
                    {loading && (
                      <p className="mt-2 text-sm text-gray-500">
                        Cargando conductores...
                      </p>
                    )}
                 </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      Asignar Conductor
                    </button>
                 </div>
                </form>
                   </div>
                 )}

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 xl:col-span-2">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800 flex items-center">
                <FaTruck className="mr-2 text-blue-600" />
                {userRole === 'client' && 'Mis Pedidos'}
                {userRole === 'driver' && 'Pedidos Asignados'}
                {userRole === 'admin' && 'Lista de Pedidos'}
              </h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Cargando pedidos...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {pedidos.map((pedido) => (
                    <div
                      key={pedido.id}
                      className="p-4 sm:p-6 border rounded-xl hover:shadow-md transition-all bg-white"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <FaMapMarkerAlt className="text-blue-600 flex-shrink-0" />
                          <h3 className="font-semibold text-base sm:text-lg truncate">
                            {pedido.origen} → {pedido.destino}
                          </h3>
                        </div>
                        {pedido.descripcion && (
                          <p className="text-gray-600 text-sm sm:text-base flex items-start">
                            <FaInfoCircle className="mt-1 mr-2 text-blue-600 flex-shrink-0" />
                            {pedido.descripcion}
                                 </p>
                             )}
                        <div className="flex flex-wrap items-center gap-2">
                          {(userRole === 'admin' || userRole === 'driver') && (
                            <select
                              value={pedido.estado}
                              onChange={(e) => handleUpdate(pedido.id, { ...pedido, estado: e.target.value })}
                              className={`px-3 py-1 rounded-full text-sm ${getStatusColor(pedido.estado)} border-0 focus:ring-2 focus:ring-blue-500`}
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="en_progreso">En Progreso</option>
                              <option value="completado">Completado</option>
                              <option value="cancelado">Cancelado</option>
                            </select>
                          )}
                          {userRole === 'client' && (
                            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(pedido.estado)}`}>
                              {pedido.estado}
                            </span>
                          )}
                          {pedido.conductor && (
                            <span className="flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                              <FaTruck className="mr-1" />
                              Conductor asignado: {pedido.conductor?.user?.name || pedido.conductor?.name || 'N/A'}
                            </span>
                          )}
                          {userRole === 'admin' && (
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                              <span className="flex items-center">
                                <FaUser className="mr-1" />
                                Cliente: {pedido.cliente?.name || 'N/A'}
                              </span>
                            </div>
                          )}
                         </div>
                        {canEditPedido(pedido) && (
                          <div className="flex justify-end space-x-2 pt-2">
                            <button
                              onClick={() => handleEdit(pedido)}
                              className="px-3 sm:px-4 py-1 sm:py-2 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(pedido.id)}
                              className="px-3 sm:px-4 py-1 sm:py-2 text-red-600 hover:text-red-800 transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                        {(userRole === 'admin' || userRole === 'driver') && (
                                 <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tiempo Estimado
                            </label>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={pedido.tiempo_estimado || ''}
                                onChange={(e) => handleUpdate(pedido.id, { ...pedido, tiempo_estimado: e.target.value })}
                                placeholder="Ej: 30 minutos"
                                className="px-3 py-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                              <input
                                type="datetime-local"
                                value={pedido.fecha_estimada || ''}
                                onChange={(e) => handleUpdate(pedido.id, { ...pedido, fecha_estimada: e.target.value })}
                                className="px-3 py-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                                       </div>
                                  </div>
                        )}
                        {userRole === 'client' && pedido.tiempo_estimado && (
                          <div className="mt-2">
                            <span className="flex items-center text-sm text-gray-600">
                              <FaClock className="mr-2 text-blue-600" />
                              Tiempo estimado: {pedido.tiempo_estimado}
                              {pedido.fecha_estimada && (
                                <span className="ml-2">
                                  (Llegada estimada: {new Date(pedido.fecha_estimada).toLocaleString()})
                                </span>
                              )}
                      </span>
                                </div>
                            )}
                        </div>
                     </div>
                  ))}
                          </div>
                     )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PedidoManagement;