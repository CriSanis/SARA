import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getUsers } from '../../services/auth';
import { verificarConductor } from '../../services/conductor';
import { getVehiculos, createVehiculo, updateVehiculo, deleteVehiculo } from '../../services/vehiculo';

const ConductorManagement = () => {
  const [conductores, setConductores] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculoForm, setVehiculoForm] = useState({
    conductor_id: '',
    marca: '',
    modelo: '',
    placa: '',
    capacidad: '',
  });
  const [editingVehiculoId, setEditingVehiculoId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchConductores();
    fetchVehiculos();
  }, [navigate, token]);

  const fetchConductores = async () => {
    setIsLoading(true);
    try {
      const response = await getUsers(token);
      const drivers = response.data.filter(user => user.user_type === 'driver');
      setConductores(drivers);
      setErrors({});
    } catch (err) {
      setErrors({ general: 'Error al cargar conductores' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVehiculos = async () => {
    setIsLoading(true);
    try {
      const response = await getVehiculos(token);
      setVehiculos(response.data);
      setErrors({});
    } catch (err) {
      setErrors({ general: 'Error al cargar vehículos' });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!vehiculoForm.conductor_id) newErrors.conductor_id = 'Selecciona un conductor';
    if (!vehiculoForm.marca.trim()) newErrors.marca = 'La marca es requerida';
    if (!vehiculoForm.modelo.trim()) newErrors.modelo = 'El modelo es requerido';
    if (!vehiculoForm.placa.trim()) newErrors.placa = 'La placa es requerida';
    else if (!/^[A-Z0-9-]{6,8}$/.test(vehiculoForm.placa)) newErrors.placa = 'Placa inválida (6-8 caracteres)';
    if (!vehiculoForm.capacidad) newErrors.capacidad = 'La capacidad es requerida';
    else if (vehiculoForm.capacidad <= 0) newErrors.capacidad = 'Capacidad debe ser mayor a 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerificar = async (conductorId, estado) => {
    setIsLoading(true);
    try {
      await verificarConductor(token, conductorId, estado);
      fetchConductores();
    } catch (err) {
      setErrors({ general: 'Error al verificar conductor' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVehiculoSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (editingVehiculoId) {
        await updateVehiculo(token, editingVehiculoId, vehiculoForm);
      } else {
        await createVehiculo(token, vehiculoForm);
      }
      resetVehiculoForm();
      fetchVehiculos();
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Error al guardar vehículo' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditVehiculo = (vehiculo) => {
    setEditingVehiculoId(vehiculo.id);
    setVehiculoForm({
      conductor_id: vehiculo.conductor_id,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      placa: vehiculo.placa,
      capacidad: vehiculo.capacidad,
    });
    setErrors({});
  };

  const handleDeleteVehiculo = async (id) => {
    if (window.confirm('¿Confirmar eliminación?')) {
      setIsLoading(true);
      try {
        await deleteVehiculo(token, id);
        fetchVehiculos();
      } catch (err) {
        setErrors({ general: 'Error al eliminar vehículo' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetVehiculoForm = () => {
    setEditingVehiculoId(null);
    setVehiculoForm({
      conductor_id: '',
      marca: '',
      modelo: '',
      placa: '',
      capacidad: '',
    });
    setErrors({});
  };

  const filteredConductores = conductores.filter(
    (conductor) =>
      conductor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conductor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVehiculos = vehiculos.filter(
    (vehiculo) =>
      vehiculo.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehiculo.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehiculo.placa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vehiculo.conductor?.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-background-light">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Gestión de Conductores</h1>
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Buscar por nombre, email, marca o placa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Verificación de Conductores" className="lg:col-span-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredConductores.length === 0 ? (
              <p className="text-text-light text-center py-4">No se encontraron conductores</p>
            ) : (
              <ul className="space-y-2">
                {filteredConductores.map((conductor) => (
                  <li key={conductor.id} className="flex justify-between items-center py-2">
                    <span className="text-sm text-text-light">
                      {conductor.name} - {conductor.conductor ? conductor.conductor.estado_verificacion : 'Pendiente'}
                    </span>
                    {conductor.conductor && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleVerificar(conductor.conductor.id, 'verificado')}
                          variant="small"
                          disabled={isLoading || conductor.conductor.estado_verificacion === 'verificado'}
                        >
                          Verificar
                        </Button>
                        <Button
                          onClick={() => handleVerificar(conductor.conductor.id, 'rechazado')}
                          variant="small"
                          className="bg-error hover:bg-red-600"
                          disabled={isLoading || conductor.conductor.estado_verificacion === 'rechazado'}
                        >
                          Rechazar
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card title={editingVehiculoId ? 'Editar Vehículo' : 'Crear Nuevo Vehículo'}>
              <form onSubmit={handleVehiculoSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Conductor</label>
                  <select
                    name="conductor_id"
                    value={vehiculoForm.conductor_id}
                    onChange={(e) => setVehiculoForm({ ...vehiculoForm, conductor_id: e.target.value })}
                    className={`w-full px-3 py-2 border ${errors.conductor_id ? 'border-error' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors`}
                    disabled={isLoading}
                  >
                    <option value="">Seleccionar</option>
                    {conductores
                      .filter((conductor) => conductor.conductor && conductor.conductor.estado_verificacion === 'verificado')
                      .map((conductor) => (
                        <option key={conductor.id} value={conductor.conductor.id}>
                          {conductor.name}
                        </option>
                      ))}
                  </select>
                  {errors.conductor_id && <p className="error-message">{errors.conductor_id}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Marca</label>
                  <input
                    type="text"
                    name="marca"
                    value={vehiculoForm.marca}
                    onChange={(e) => setVehiculoForm({ ...vehiculoForm, marca: e.target.value })}
                    className={`w-full px-3 py-2 border ${errors.marca ? 'border-error' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors`}
                    placeholder="Toyota"
                    disabled={isLoading}
                  />
                  {errors.marca && <p className="error-message">{errors.marca}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Modelo</label>
                  <input
                    type="text"
                    name="modelo"
                    value={vehiculoForm.modelo}
                    onChange={(e) => setVehiculoForm({ ...vehiculoForm, modelo: e.target.value })}
                    className={`w-full px-3 py-2 border ${errors.modelo ? 'border-error' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors`}
                    placeholder="Hilux"
                    disabled={isLoading}
                  />
                  {errors.modelo && <p className="error-message">{errors.modelo}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Placa</label>
                  <input
                    type="text"
                    name="placa"
                    value={vehiculoForm.placa}
                    onChange={(e) => setVehiculoForm({ ...vehiculoForm, placa: e.target.value })}
                    className={`w-full px-3 py-2 border ${errors.placa ? 'border-error' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors`}
                    placeholder="ABC-123"
                    disabled={isLoading}
                  />
                  {errors.placa && <p className="error-message">{errors.placa}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Capacidad (toneladas)</label>
                  <input
                    type="number"
                    name="capacidad"
                    value={vehiculoForm.capacidad}
                    onChange={(e) => setVehiculoForm({ ...vehiculoForm, capacidad: e.target.value })}
                    className={`w-full px-3 py-2 border ${errors.capacidad ? 'border-error' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors`}
                    placeholder="2.5"
                    step="0.1"
                    disabled={isLoading}
                  />
                  {errors.capacidad && <p className="error-message">{errors.capacidad}</p>}
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Guardando...' : editingVehiculoId ? 'Actualizar' : 'Crear'}
                  </Button>
                  {(editingVehiculoId || Object.values(vehiculoForm).some((val) => val)) && (
                    <Button type="button" variant="secondary" onClick={resetVehiculoForm} disabled={isLoading}>
                      {editingVehiculoId ? 'Cancelar' : 'Limpiar'}
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            <Card title="Lista de Vehículos">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredVehiculos.length === 0 ? (
                <p className="text-text-light text-center py-4">No se encontraron vehículos</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Marca</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Modelo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Placa</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Capacidad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Conductor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredVehiculos.map((vehiculo) => (
                        <tr key={vehiculo.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{vehiculo.marca}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{vehiculo.modelo}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{vehiculo.placa}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{vehiculo.capacidad} t</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{vehiculo.conductor?.user?.name || 'Sin conductor'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleEditVehiculo(vehiculo)}
                              className="text-primary hover:underline mr-4"
                              disabled={isLoading}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteVehiculo(vehiculo.id)}
                              className="text-error hover:underline"
                              disabled={isLoading}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

export default ConductorManagement;