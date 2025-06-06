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
                    Gestión de Rutas
                  </h1>
                  <p className="text-gray-600">
                    Administra rutas y asigna pedidos
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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card title={editingId ? 'Editar Ruta' : 'Nueva Ruta'} className="border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ruta Norte"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="origen"
                        value={formData.origen}
                        onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ciudad A"
                        required
                        disabled={loading}
                      />
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="destino"
                        value={formData.destino}
                        onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ciudad B"
                        required
                        disabled={loading}
                      />
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Distancia (km)</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="distancia_km"
                        value={formData.distancia_km}
                        onChange={(e) => setFormData({ ...formData, distancia_km: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="150.5"
                        step="0.1"
                        min="0.1"
                        required
                        disabled={loading}
                      />
                      <FaRoad className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duración Estimada (min)</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="duracion_estimada_min"
                        value={formData.duracion_estimada_min}
                        onChange={(e) => setFormData({ ...formData, duracion_estimada_min: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="120"
                        min="1"
                        required
                        disabled={loading}
                      />
                      <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-2">
                    <Button type="submit" loading={loading} className="flex items-center space-x-2">
                      <FaRoute className="h-4 w-4" />
                      <span>{editingId ? 'Actualizar' : 'Crear'}</span>
                    </Button>
                    {editingId && (
                      <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={resetForm}
                        disabled={loading}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
            </div>
            
            <div className="lg:col-span-1">
              <Card title="Asignar Pedido a Ruta" className="border border-gray-100">
                <form onSubmit={handleAsignar} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pedido</label>
                    <div className="relative">
                      <select
                        name="pedido_id"
                        value={asignacionForm.pedido_id}
                        onChange={(e) => setAsignacionForm({ ...asignacionForm, pedido_id: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={loading}
                      >
                        <option value="">Seleccionar pedido</option>
                        {pedidos
                          .filter(pedido => !pedido.ruta_id)
                          .map((pedido) => (
                            <option key={`pedido-option-${pedido.id}`} value={pedido.id}>
                              #{pedido.id} - {pedido.origen} → {pedido.destino}
                            </option>
                          ))}
                      </select>
                      <FaBox className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ruta</label>
                    <div className="relative">
                      <select
                        name="ruta_id"
                        value={asignacionForm.ruta_id}
                        onChange={(e) => setAsignacionForm({ ...asignacionForm, ruta_id: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={loading}
                      >
                        <option value="">Seleccionar ruta</option>
                        {rutas.map((ruta) => (
                          <option key={`ruta-option-${ruta.id}`} value={ruta.id}>
                            {ruta.nombre} ({ruta.origen} → {ruta.destino})
                          </option>
                        ))}
                      </select>
                      <FaRoute className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  
                  <Button type="submit" loading={loading} className="w-full flex items-center justify-center space-x-2">
                    <FaBox className="h-4 w-4" />
                    <span>Asignar Pedido</span>
                  </Button>
                </form>
              </Card>
            </div>
            
            <div className="lg:col-span-1">
              <Card title="Lista de Rutas" className="border border-gray-100">
                {rutas.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay rutas registradas</p>
                ) : (
                  <div className="space-y-4">
                    {rutas.map((ruta) => (
                      <div 
                        key={`ruta-${ruta.id}`}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800 flex items-center space-x-2">
                              <FaRoute className="h-4 w-4 text-blue-500" />
                              <span>{ruta.nombre}</span>
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {ruta.origen} → {ruta.destino}
                            </p>
                            <div className="flex items-center mt-2 space-x-2">
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center space-x-1">
                                <FaRoad className="h-3 w-3" />
                                <span>{ruta.distancia_km} km</span>
                              </span>
                              <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 flex items-center space-x-1">
                                <FaClock className="h-3 w-3" />
                                <span>{ruta.duracion_estimada_min} min</span>
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(ruta)}
                              className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                              disabled={loading}
                            >
                              <FaEdit className="h-4 w-4" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => handleDelete(ruta.id)}
                              className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                              disabled={loading}
                            >
                              <FaTrash className="h-4 w-4" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </div>
                        
                        {ruta.pedidos.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                              <FaBox className="h-4 w-4 text-gray-400" />
                              <span>Pedidos asignados:</span>
                            </h4>
                            <ul className="space-y-2">
                              {ruta.pedidos.map((pedido) => (
                                <li 
                                  key={`pedido-${pedido.pivot.id}`}
                                  className="flex justify-between items-center bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors"
                                >
                                  <span className="text-sm text-gray-700">
                                    #{pedido.id} - {pedido.origen} → {pedido.destino}
                                  </span>
                                  <button
                                    onClick={() => handleDesasignar(pedido.pivot.id)}
                                    className="text-red-500 hover:text-red-700 flex items-center space-x-1"
                                    disabled={loading}
                                  >
                                    <FaTimes className="h-3 w-3" />
                                    <span>Desasignar</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RutaManagement;