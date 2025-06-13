import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getRutas, createRuta, updateRuta, deleteRuta, asignarRuta, desasignarRuta } from '../../services/ruta';
import { getPedidos } from '../../services/pedido';
import { FaRoute, FaMapMarkerAlt, FaClock, FaRoad, FaEdit, FaTrash, FaBox, FaTimes } from 'react-icons/fa';

const RutaManagement = () => {
  const [rutas, setRutas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    origen: '',
    destino: '',
    distancia_km: '',
    duracion_estimada_min: '',
  });
  const [asignacionForm, setAsignacionForm] = useState({ 
    pedido_id: '', 
    ruta_id: '' 
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const showMessage = (message, isError = false) => {
    if (isError) {
      setErrorMessage(message);
      setSuccessMessage('');
    } else {
      setSuccessMessage(message);
      setErrorMessage('');
    }
    setTimeout(() => {
      setErrorMessage('');
      setSuccessMessage('');
    }, 5000);
  };

  const fetchData = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const [rutasResponse, pedidosResponse] = await Promise.all([
        getRutas(token),
        getPedidos(token)
      ]);
      setRutas(rutasResponse.data);
      setPedidos(pedidosResponse.data);
      
      // Obtener el rol del usuario del token decodificado
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      setUserRole(tokenData.role);
    } catch (err) {
      showMessage(err.response?.data?.message || 'Error al cargar datos', true);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userRole !== 'admin') {
      showMessage('No tienes permisos para realizar esta acción', true);
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await updateRuta(token, editingId, formData);
        showMessage('Ruta actualizada correctamente');
      } else {
        await createRuta(token, formData);
        showMessage('Ruta creada correctamente');
      }
      resetForm();
      await fetchData();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Error al guardar ruta', true);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ruta) => {
    if (userRole !== 'admin') {
      showMessage('No tienes permisos para realizar esta acción', true);
      return;
    }
    setEditingId(ruta.id);
    setFormData({
      nombre: ruta.nombre,
      origen: ruta.origen,
      destino: ruta.destino,
      distancia_km: ruta.distancia_km,
      duracion_estimada_min: ruta.duracion_estimada_min,
    });
  };

  const handleDelete = async (id) => {
    if (userRole !== 'admin') {
      showMessage('No tienes permisos para realizar esta acción', true);
      return;
    }

    if (window.confirm('¿Estás seguro de eliminar esta ruta?')) {
      setLoading(true);
      try {
        await deleteRuta(token, id);
        showMessage('Ruta eliminada correctamente');
        await fetchData();
      } catch (err) {
        showMessage(err.response?.data?.message || 'Error al eliminar ruta', true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAsignar = async (e) => {
    e.preventDefault();
    if (userRole !== 'admin') {
      showMessage('No tienes permisos para realizar esta acción', true);
      return;
    }

    setLoading(true);
    try {
      await asignarRuta(token, asignacionForm);
      showMessage('Pedido asignado a ruta correctamente');
      setAsignacionForm({ pedido_id: '', ruta_id: '' });
      await fetchData();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Error al asignar ruta', true);
    } finally {
      setLoading(false);
    }
  };

  const handleDesasignar = async (asignacionId) => {
    if (userRole !== 'admin') {
      showMessage('No tienes permisos para realizar esta acción', true);
      return;
    }

    if (window.confirm('¿Estás seguro de desasignar este pedido?')) {
      setLoading(true);
      try {
        await desasignarRuta(token, asignacionId);
        showMessage('Pedido desasignado correctamente');
        await fetchData();
      } catch (err) {
        showMessage(err.response?.data?.message || 'Error al desasignar ruta', true);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      nombre: '',
      origen: '',
      destino: '',
      distancia_km: '',
      duracion_estimada_min: '',
    });
  };

  if (loading && rutas.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow flex items-center justify-center">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="h-16 bg-gradient-to-r from-blue-500 to-blue-600"></div>
      <main className="flex-grow container mx-auto px-4 py-8 -mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaRoute className="text-3xl text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-1">
                    {userRole === 'admin' ? 'Gestión de Rutas' : 'Mis Rutas'}
                  </h1>
                  <p className="text-gray-600">
                    {userRole === 'admin' ? 'Administra rutas y asigna pedidos' : 'Visualiza tus rutas asignadas'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center border border-red-200">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-center border border-green-200">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {successMessage}
            </div>
          )}

          {userRole === 'admin' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <Card>
                <h2 className="text-xl font-semibold mb-4">
                  {editingId ? 'Editar Ruta' : 'Nueva Ruta'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Origen</label>
                    <input
                      type="text"
                      value={formData.origen}
                      onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Destino</label>
                    <input
                      type="text"
                      value={formData.destino}
                      onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Distancia (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.distancia_km}
                      onChange={(e) => setFormData({ ...formData, distancia_km: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duración (minutos)</label>
                    <input
                      type="number"
                      value={formData.duracion_estimada_min}
                      onChange={(e) => setFormData({ ...formData, duracion_estimada_min: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex space-x-4">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      {editingId ? 'Actualizar' : 'Crear'}
                    </Button>
                    {editingId && (
                      <Button
                        type="button"
                        onClick={resetForm}
                        className="bg-gray-500 hover:bg-gray-600"
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </Card>

              <Card>
                <h2 className="text-xl font-semibold mb-4">Asignar Pedido a Ruta</h2>
                <form onSubmit={handleAsignar} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pedido</label>
                    <select
                      value={asignacionForm.pedido_id}
                      onChange={(e) => setAsignacionForm({ ...asignacionForm, pedido_id: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar pedido</option>
                      {pedidos.map((pedido) => (
                        <option key={pedido.id} value={pedido.id}>
                          Pedido #{pedido.id} - {pedido.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ruta</label>
                    <select
                      value={asignacionForm.ruta_id}
                      onChange={(e) => setAsignacionForm({ ...asignacionForm, ruta_id: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar ruta</option>
                      {rutas.map((ruta) => (
                        <option key={ruta.id} value={ruta.id}>
                          {ruta.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Asignar
                  </Button>
                </form>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rutas.map((ruta) => (
              <Card key={ruta.id} className="relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{ruta.nombre}</h3>
                    <div className="flex items-center text-gray-600 mt-1">
                      <FaMapMarkerAlt className="mr-2" />
                      <span>{ruta.origen} → {ruta.destino}</span>
                    </div>
                  </div>
                  {userRole === 'admin' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(ruta)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(ruta.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <FaRoad className="mr-2" />
                    <span>{ruta.distancia_km} km</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaClock className="mr-2" />
                    <span>{ruta.duracion_estimada_min} minutos</span>
                  </div>
                </div>
                {ruta.pedidos && ruta.pedidos.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Pedidos asignados:</h4>
                    <div className="space-y-2">
                      {ruta.pedidos.map((pedido) => (
                        <div key={pedido.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div className="flex items-center">
                            <FaBox className="text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">
                              Pedido #{pedido.id}
                            </span>
                          </div>
                          {userRole === 'admin' && (
                            <button
                              onClick={() => handleDesasignar(pedido.pivot.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTimes />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RutaManagement;