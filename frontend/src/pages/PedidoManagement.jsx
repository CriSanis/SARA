import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getUser } from '../services/auth';
import { getPedidos, createPedido, updatePedido, deletePedido, asignarConductor } from '../services/pedido';
import { getUsers } from '../services/auth';

const PedidoManagement = () => {
  const [pedidos, setPedidos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [formData, setFormData] = useState({ 
    origen: '', 
    destino: '', 
    descripcion: '',
    peso: '',
    tipo_carga: 'general'
  });
  const [asignacionForm, setAsignacionForm] = useState({ 
    pedido_id: '', 
    conductor_id: '' 
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const tiposCarga = [
    { value: 'general', label: 'Carga General' },
    { value: 'refrigerada', label: 'Carga Refrigerada' },
    { value: 'peligrosa', label: 'Carga Peligrosa' },
    { value: 'fragil', label: 'Carga Frágil' }
  ];

  const fetchData = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const userResponse = await getUser(token);
      setUser(userResponse.data);
      
      const pedidosResponse = await getPedidos(token);
      setPedidos(pedidosResponse.data);
      
      if (userResponse.data.user_type === 'admin') {
        const usersResponse = await getUsers(token);
        const drivers = usersResponse.data.filter(user => user.user_type === 'driver');
        setConductores(drivers);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cargar datos');
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
        await updatePedido(token, editingId, formData);
        toast.success('Pedido actualizado correctamente');
      } else {
        await createPedido(token, formData);
        toast.success('Pedido creado correctamente');
      }
      resetForm();
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pedido) => {
    setEditingId(pedido.id);
    setFormData({
      origen: pedido.origen,
      destino: pedido.destino,
      descripcion: pedido.descripcion || '',
      peso: pedido.peso || '',
      tipo_carga: pedido.tipo_carga || 'general'
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este pedido?')) {
      setLoading(true);
      try {
        await deletePedido(token, id);
        toast.success('Pedido eliminado correctamente');
        await fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error al eliminar pedido');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEstadoChange = async (id, estado) => {
    setLoading(true);
    try {
      await updatePedido(token, id, { estado });
      toast.success('Estado actualizado correctamente');
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar estado');
    } finally {
      setLoading(false);
    }
  };

  const handleAsignar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await asignarConductor(token, asignacionForm);
      toast.success('Conductor asignado correctamente');
      setAsignacionForm({ pedido_id: '', conductor_id: '' });
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al asignar conductor');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ 
      origen: '', 
      destino: '', 
      descripcion: '',
      peso: '',
      tipo_carga: 'general'
    });
  };

  if (loading && pedidos.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Gestión de Pedidos</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {['client', 'admin'].includes(user?.user_type) && (
            <div className="lg:col-span-1">
              <Card title={editingId ? 'Editar Pedido' : 'Nuevo Pedido'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
                    <input
                      type="text"
                      name="origen"
                      value={formData.origen}
                      onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ciudad de origen"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                    <input
                      type="text"
                      name="destino"
                      value={formData.destino}
                      onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ciudad de destino"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      name="peso"
                      value={formData.peso}
                      onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Peso en kilogramos"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Carga</label>
                    <select
                      name="tipo_carga"
                      value={formData.tipo_carga}
                      onChange={(e) => setFormData({ ...formData, tipo_carga: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {tiposCarga.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Detalles adicionales sobre la carga"
                      rows="3"
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-2">
                    <Button type="submit" loading={loading}>
                      {editingId ? 'Actualizar' : 'Crear'}
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
          )}
          
          {user?.user_type === 'admin' && (
            <div className="lg:col-span-1">
              <Card title="Asignar Conductor">
                <form onSubmit={handleAsignar} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pedido</label>
                    <select
                      name="pedido_id"
                      value={asignacionForm.pedido_id}
                      onChange={(e) => setAsignacionForm({ ...asignacionForm, pedido_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={loading}
                    >
                      <option value="">Seleccionar pedido</option>
                      {pedidos
                        .filter(pedido => !pedido.conductor_id)
                        .map((pedido) => (
                          <option key={pedido.id} value={pedido.id}>
                            #{pedido.id} - {pedido.origen} → {pedido.destino}
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Conductor</label>
                    <select
                      name="conductor_id"
                      value={asignacionForm.conductor_id}
                      onChange={(e) => setAsignacionForm({ ...asignacionForm, conductor_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={loading}
                    >
                      <option value="">Seleccionar conductor</option>
                      {conductores.map((conductor) => (
                        <option key={conductor.id} value={conductor.conductor.id}>
                          {conductor.name} - {conductor.conductor?.licencia || 'Sin licencia'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <Button type="submit" loading={loading} className="w-full">
                    Asignar Conductor
                  </Button>
                </form>
              </Card>
            </div>
          )}
          
          <div className={user?.user_type === 'admin' ? 'lg:col-span-1' : 'lg:col-span-2'}>
            <Card title="Lista de Pedidos">
              {pedidos.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay pedidos registrados</p>
              ) : (
                <div className="space-y-4">
                  {pedidos.map((pedido) => (
                    <div 
                      key={pedido.id} 
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800">
                            #{pedido.id} - {pedido.origen} → {pedido.destino}
                          </h3>
                          <div className="flex items-center mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              pedido.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                              pedido.estado === 'en_progreso' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {pedido.estado.replace('_', ' ')}
                            </span>
                            {pedido.tipo_carga && (
                              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                                {tiposCarga.find(t => t.value === pedido.tipo_carga)?.label || pedido.tipo_carga}
                              </span>
                            )}
                            {pedido.peso && (
                              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                {pedido.peso} kg
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          {(user?.user_type === 'client' && pedido.cliente_id === user.id) || user?.user_type === 'admin' ? (
                            <>
                              <button
                                onClick={() => handleEdit(pedido)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                disabled={loading}
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(pedido.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                disabled={loading}
                              >
                                Eliminar
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                      
                      {pedido.descripcion && (
                        <p className="text-gray-600 text-sm mt-2">{pedido.descripcion}</p>
                      )}
                      
                      <div className="mt-2 pt-2 border-t border-gray-100 text-sm text-gray-500">
                        <p>
                          <span className="font-medium">Cliente:</span> {pedido.cliente?.name || 'Desconocido'}
                        </p>
                        <p>
                          <span className="font-medium">Conductor:</span> {pedido.conductor?.user?.name || 'Sin asignar'}
                        </p>
                      </div>
                      
                      {user?.user_type === 'driver' && pedido.conductor_id === user.conductor?.id && (
                        <div className="mt-3">
                          <select
                            value={pedido.estado}
                            onChange={(e) => handleEstadoChange(pedido.id, e.target.value)}
                            className="text-sm px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={loading}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_progreso">En Progreso</option>
                            <option value="completado">Completado</option>
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PedidoManagement;