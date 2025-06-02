import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getUsers } from '../../services/auth';
import { getPedidos } from '../../services/pedido';
import { getRutas } from '../../services/ruta';
import { getReportePedidos, getReporteConductores, getReporteRutas } from '../../services/reporte';

const ReporteManagement = () => {
  const [clientes, setClientes] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [pedidoForm, setPedidoForm] = useState({ estado: '', cliente_id: '', fecha_inicio: '', fecha_fin: '' });
  const [conductorForm, setConductorForm] = useState({ conductor_id: '' });
  const [rutaForm, setRutaForm] = useState({ ruta_id: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchClientes();
    fetchConductores();
    fetchPedidos();
    fetchRutas();
  }, [navigate, token]);

  const fetchClientes = async () => {
    try {
      const response = await getUsers(token);
      setClientes(response.data.filter(user => user.user_type === 'client'));
    } catch (err) {
      setError('Error al cargar clientes');
    }
  };

  const fetchConductores = async () => {
    try {
      const response = await getUsers(token);
      setConductores(response.data.filter(user => user.user_type === 'driver'));
    } catch (err) {
      setError('Error al cargar conductores');
    }
  };

  const fetchPedidos = async () => {
    try {
      const response = await getPedidos(token);
      setPedidos(response.data);
    } catch (err) {
      setError('Error al cargar pedidos');
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

  const handlePedidoSubmit = async (e) => {
    e.preventDefault();
    try {
      await getReportePedidos(token, pedidoForm);
      setError('');
    } catch (err) {
      setError('Error al generar reporte de pedidos');
    }
  };

  const handleConductorSubmit = async (e) => {
    e.preventDefault();
    try {
      await getReporteConductores(token, conductorForm);
      setError('');
    } catch (err) {
      setError('Error al generar reporte de conductores');
    }
  };

  const handleRutaSubmit = async (e) => {
    e.preventDefault();
    try {
      await getReporteRutas(token, rutaForm);
      setError('');
    } catch (err) {
      setError('Error al generar reporte de rutas');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container-center bg-background-light">
        <h1 className="text-3xl font-bold mb-6">Generación de Reportes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          <Card title="Reporte de Pedidos">
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handlePedidoSubmit}>
              <div className="mb-4">
                <label className="block text-text-light mb-1">Estado</label>
                <select
                  name="estado"
                  value={pedidoForm.estado}
                  onChange={(e) => setPedidoForm({ ...pedidoForm, estado: e.target.value })}
                  className="w-full"
                >
                  <option value="">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_progreso">En Progreso</option>
                  <option value="completado">Completado</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-text-light mb-1">Cliente</label>
                <select
                  name="cliente_id"
                  value={pedidoForm.cliente_id}
                  onChange={(e) => setPedidoForm({ ...pedidoForm, cliente_id: e.target.value })}
                  className="w-full"
                >
                  <option value="">Todos</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-text-light mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={pedidoForm.fecha_inicio}
                  onChange={(e) => setPedidoForm({ ...pedidoForm, fecha_inicio: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-text-light mb-1">Fecha Fin</label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={pedidoForm.fecha_fin}
                  onChange={(e) => setPedidoForm({ ...pedidoForm, fecha_fin: e.target.value })}
                  className="w-full"
                />
              </div>
              <Button type="submit">Descargar PDF</Button>
            </form>
          </Card>
          <Card title="Reporte de Conductores">
            <form onSubmit={handleConductorSubmit}>
              <div className="mb-4">
                <label className="block text-text-light mb-1">Conductor</label>
                <select
                  name="conductor_id"
                  value={conductorForm.conductor_id}
                  onChange={(e) => setConductorForm({ ...conductorForm, conductor_id: e.target.value })}
                  className="w-full"
                >
                  <option value="">Todos</option>
                  {conductores.map((conductor) => (
                    <option key={conductor.id} value={conductor.conductor.id}>
                      {conductor.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit">Descargar PDF</Button>
            </form>
          </Card>
          <Card title="Reporte de Rutas">
            <form onSubmit={handleRutaSubmit}>
              <div className="mb-4">
                <label className="block text-text-light mb-1">Ruta</label>
                <select
                  name="ruta_id"
                  value={rutaForm.ruta_id}
                  onChange={(e) => setRutaForm({ ...rutaForm, ruta_id: e.target.value })}
                  className="w-full"
                >
                  <option value="">Todos</option>
                  {rutas.map((ruta) => (
                    <option key={ruta.id} value={ruta.id}>
                      {ruta.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit">Descargar PDF</Button>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReporteManagement;