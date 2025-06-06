import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getUsers } from '../../services/auth';
import { getPedidos } from '../../services/pedido';
import { getRutas } from '../../services/ruta';
import { getReportePedidos, getReporteConductores, getReporteRutas } from '../../services/reporte';
import { FaChartBar, FaBox, FaUser, FaRoute, FaCalendarAlt, FaDownload, FaExclamationTriangle, FaFileAlt, FaSearch } from 'react-icons/fa';

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="h-16 bg-gradient-to-r from-blue-500 to-blue-600"></div>
      <main className="flex-grow container mx-auto px-4 py-8 -mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaChartBar className="text-3xl text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-1">
                    Generación de Reportes
                  </h1>
                  <p className="text-gray-600">
                    Genera reportes detallados de pedidos, conductores y rutas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center border border-red-200">
              <FaExclamationTriangle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card title="Reporte de Pedidos" className="border border-gray-100">
              <form onSubmit={handlePedidoSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <div className="relative">
                    <select
                      name="estado"
                      value={pedidoForm.estado}
                      onChange={(e) => setPedidoForm({ ...pedidoForm, estado: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todos</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="en_progreso">En Progreso</option>
                      <option value="completado">Completado</option>
                    </select>
                    <FaBox className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <div className="relative">
                    <select
                      name="cliente_id"
                      value={pedidoForm.cliente_id}
                      onChange={(e) => setPedidoForm({ ...pedidoForm, cliente_id: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todos</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.name}
                        </option>
                      ))}
                    </select>
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="fecha_inicio"
                      value={pedidoForm.fecha_inicio}
                      onChange={(e) => setPedidoForm({ ...pedidoForm, fecha_inicio: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="fecha_fin"
                      value={pedidoForm.fecha_fin}
                      onChange={(e) => setPedidoForm({ ...pedidoForm, fecha_fin: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <Button type="submit" className="w-full flex items-center justify-center space-x-2">
                  <FaDownload className="h-4 w-4" />
                  <span>Descargar PDF</span>
                </Button>
              </form>
            </Card>

            <Card title="Reporte de Conductores" className="border border-gray-100">
              <form onSubmit={handleConductorSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conductor</label>
                  <div className="relative">
                    <select
                      name="conductor_id"
                      value={conductorForm.conductor_id}
                      onChange={(e) => setConductorForm({ ...conductorForm, conductor_id: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todos</option>
                      {conductores.map((conductor) => (
                        <option key={conductor.id} value={conductor.conductor.id}>
                          {conductor.name}
                        </option>
                      ))}
                    </select>
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <Button type="submit" className="w-full flex items-center justify-center space-x-2">
                  <FaDownload className="h-4 w-4" />
                  <span>Descargar PDF</span>
                </Button>
              </form>
            </Card>

            <Card title="Reporte de Rutas" className="border border-gray-100">
              <form onSubmit={handleRutaSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ruta</label>
                  <div className="relative">
                    <select
                      name="ruta_id"
                      value={rutaForm.ruta_id}
                      onChange={(e) => setRutaForm({ ...rutaForm, ruta_id: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todos</option>
                      {rutas.map((ruta) => (
                        <option key={ruta.id} value={ruta.id}>
                          {ruta.nombre}
                        </option>
                      ))}
                    </select>
                    <FaRoute className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <Button type="submit" className="w-full flex items-center justify-center space-x-2">
                  <FaDownload className="h-4 w-4" />
                  <span>Descargar PDF</span>
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReporteManagement;