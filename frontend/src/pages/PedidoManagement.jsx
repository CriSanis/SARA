import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { getUser } from '../services/auth';
import { getPedidos, createPedido, updatePedido, deletePedido, asignarConductor } from '../services/pedido';
import { getUsers } from '../services/auth';
import { getRutas } from '../services/ruta';

const PedidoManagement = () => {
  const [pedidos, setPedidos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [formData, setFormData] = useState({ origen: '', destino: '', descripcion: '' });
  const [asignacionForm, setAsignacionForm] = useState({ pedido_id: '', conductor_id: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    getUser(token).then((response) => {
      setUser(response.data);
      fetchPedidos();
      if (response.data.user_type === 'admin') {
        fetchConductores();
      }
      if (['driver', 'admin'].includes(response.data.user_type)) {
        fetchRutas();
      }
    }).catch(() => {
      localStorage.removeItem('token');
      navigate('/login');
    });
  }, [navigate, token]);

  const fetchPedidos = async () => {
    try {
      const response = await getPedidos(token);
      setPedidos(response.data);
    } catch (err) {
      setError('Error al cargar pedidos');
    }
  };

  const fetchConductores = async () => {
    try {
      const response = await getUsers(token);
      const drivers = response.data.filter(user => user.user_type === 'driver');
      setConductores(drivers);
    } catch (err) {
      setError('Error al cargar conductores');
    }
  };

  const fetchRutas = async () => {
    try {
      const response = await getRutas(token);
      setRutas(response.data);
    } catch (err) {
      setError('Error al cargar rutas');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updatePedido(token, editingId, formData);
      } else {
        await createPedido(token, formData);
      }
      resetForm();
      fetchPedidos();
    } catch (err) {
      setError('Error al guardar pedido');
    }
  };

  const handleEdit = (pedido) => {
    setEditingId(pedido.id);
    setFormData({
      origen: pedido.origen,
      destino: pedido.destino,
      descripcion: pedido.descripcion || '',
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Confirmar eliminación?')) {
      try {
        await deletePedido(token, id);
        fetchPedidos();
      } catch (err) {
        setError('Error al eliminar pedido');
      }
    }
  };

  const handleEstadoChange = async (id, estado) => {
    try {
      await updatePedido(token, id, { estado });
      fetchPedidos();
    } catch (err) {
      setError('Error al actualizar estado');
    }
  };

  const handleAsignar = async (e) => {
    e.preventDefault();
    try {
      await asignarConductor(token, asignacionForm);
      fetchPedidos();
      setAsignacionForm({ pedido_id: '', conductor_id: '' });
    } catch (err) {
      setError('Error al asignar conductor');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ origen: '', destino: '', descripcion: '' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container-center bg-background-light">
        <h1 className="text-3xl font-bold mb-6">Gestión de Pedidos</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          {['client', 'admin'].includes(user?.user_type) && (
            <Card title={editingId ? 'Editar Pedido' : 'Nuevo Pedido'}>
              {error && <p className="error-message">{error}</p>}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-text-light mb-1">Origen</label>
                  <input
                    type="text"
                    name="origen"
                    value={formData.origen}
                    onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                    className="w-full"
                    placeholder="Ciudad A"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-text-light mb-1">Destino</label>
                  <input
                    type="text"
                    name="destino"
                    value={formData.destino}
                    onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                    className="w-full"
                    placeholder="Ciudad B"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-text-light mb-1">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full"
                    placeholder="Carga de 2 toneladas"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">{editingId ? 'Actualizar' : 'Crear'}</Button>
                  {editingId && (
                    <Button type="button" variant="secondary" onClick={resetForm}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          )}
          {user?.user_type === 'admin' && (
            <Card title="Asignar Conductor">
              <form onSubmit={handleAsignar}>
                <div className="mb-4">
                  <label className="block text-text-light mb-1">Pedido</label>
                  <select
                    name="pedido_id"
                    value={asignacionForm.pedido_id}
                    onChange={(e) => setAsignacionForm({ ...asignacionForm, pedido_id: e.target.value })}
                    className="w-full"
                    required
                  >
                    <option value="">Seleccionar</option>
                    {pedidos.map((pedido) => (
                      <option key={pedido.id} value={pedido.id}>
                        {pedido.origen} a {pedido.destino}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-text-light mb-1">Conductor</label>
                  <select
                    name="conductor_id"
                    value={asignacionForm.conductor_id}
                    onChange={(e) => setAsignacionForm({ ...asignacionForm, conductor_id: e.target.value })}
                    className="w-full"
                    required
                  >
                    <option value="">Seleccionar</option>
                    {conductores.map((conductor) => (
                      <option key={conductor.id} value={conductor.conductor.id}>
                        {conductor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit">Asignar</Button>
              </form>
            </Card>
          )}
          <Card title="Lista de Pedidos">
            {pedidos.length === 0 ? (
              <p className="text-text-light">No hay pedidos</p>
            ) : (
              <ul className="space-y-4">
                {pedidos.map((pedido) => (
                  <li key={pedido.id} className="flex flex-col">
                    <div className="flex justify-between items-center">
                      <span>
                        {pedido.origen} a {pedido.destino} ({pedido.estado})
                      </span>
                      <div>
                        {(user?.user_type === 'client' && pedido.cliente_id === user.id) || user?.user_type === 'admin' ? (
                          <>
                            <button
                              onClick={() => handleEdit(pedido)}
                              className="text-primary mr-2 hover:underline"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(pedido.id)}
                              className="text-error hover:underline"
                            >
                              Eliminar
                            </button>
                          </>
                        ) : null}
                        {user?.user_type === 'driver' && pedido.conductor_id === user.conductor?.id ? (
                          <select
                            value={pedido.estado}
                            onChange={(e) => handleEstadoChange(pedido.id, e.target.value)}
                            className="ml-2"
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_progreso">En Progreso</option>
                            <option value="completado">Completado</option>
                          </select>
                        ) : null}
                      </div>
                    </div>
                    <p className="text-text-light mt-1">
                      Cliente: {pedido.cliente.name} | Conductor: {pedido.conductor?.user.name || 'Sin asignar'}
                    </p>
                    {['driver', 'admin'].includes(user?.user_type) && pedido.rutas?.length > 0 && (
                      <div className="ml-4 mt-2">
                        <p className="text-text-light font-semibold">Rutas asignadas:</p>
                        <ul className="list-disc ml-4">
                          {pedido.rutas.map((ruta) => (
                            <li key={ruta.id}>
                              {ruta.nombre}: {ruta.origen} a {ruta.destino} ({ruta.distancia_km} km, {ruta.duracion_estimada_min} min)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PedidoManagement;