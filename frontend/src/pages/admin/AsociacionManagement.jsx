import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getUsers } from '../../services/auth';
import { getAsociaciones, createAsociacion, updateAsociacion, deleteAsociacion, asignarConductor, desasignarConductor } from '../../services/asociacion';

const AsociacionManagement = () => {
  const [asociaciones, setAsociaciones] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [asignacionForm, setAsignacionForm] = useState({ conductor_id: '', asociacion_id: '' });
  const [editingId, setEditingId] = useState(null);
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
    fetchAsociaciones();
    fetchConductores();
  }, [navigate, token]);

  const fetchAsociaciones = async () => {
    setIsLoading(true);
    try {
      const response = await getAsociaciones(token);
      setAsociaciones(response.data);
      setErrors({});
    } catch (err) {
      setErrors({ general: 'Error al cargar asociaciones' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConductores = async () => {
    setIsLoading(true);
    try {
      const response = await getUsers(token);
      const drivers = response.data.filter(user => user.user_type === 'driver' && user.conductor);
      setConductores(drivers);
      setErrors({});
    } catch (err) {
      setErrors({ general: 'Error al cargar conductores' });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (formData.descripcion && formData.descripcion.length > 500) {
      newErrors.descripcion = 'Máximo 500 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAsignacion = () => {
    const newErrors = {};
    if (!asignacionForm.asociacion_id) newErrors.asociacion_id = 'Seleccione una asociación';
    if (!asignacionForm.conductor_id) newErrors.conductor_id = 'Seleccione un conductor';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (editingId) {
        await updateAsociacion(token, editingId, formData);
      } else {
        await createAsociacion(token, formData);
      }
      resetForm();
      fetchAsociaciones();
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Error al guardar asociación' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (asociacion) => {
    setEditingId(asociacion.id);
    setFormData({
      nombre: asociacion.nombre,
      descripcion: asociacion.descripcion || '',
    });
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Confirmar eliminación?')) {
      setIsLoading(true);
      try {
        await deleteAsociacion(token, id);
        fetchAsociaciones();
      } catch (err) {
        setErrors({ general: 'Error al eliminar asociación' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAsignar = async (e) => {
    e.preventDefault();
    if (!validateAsignacion()) return;

    setIsLoading(true);
    try {
      await asignarConductor(token, asignacionForm);
      fetchAsociaciones();
      setAsignacionForm({ conductor_id: '', asociacion_id: '' });
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Error al asignar conductor' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDesasignar = async (asignacionId) => {
    if (window.confirm('¿Confirmar desasignación?')) {
      setIsLoading(true);
      try {
        await desasignarConductor(token, asignacionId);
        fetchAsociaciones();
      } catch (err) {
        setErrors({ general: 'Error al desasignar conductor' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ nombre: '', descripcion: '' });
    setErrors({});
  };

  const filteredAsociaciones = asociaciones.filter(
    (asociacion) =>
      asociacion.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asociacion.descripcion && asociacion.descripcion.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col min-h-screen bg-background-light">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Gestión de Asociaciones</h1>
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
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
          <div className="lg:col-span-1 space-y-6">
            <Card title={editingId ? 'Editar Asociación' : 'Crear Nueva Asociación'}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className={`w-full px-3 py-2 border ${errors.nombre ? 'border-error' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors`}
                    placeholder="Asociación Norte"
                  />
                  {errors.nombre && <p className="error-message">{errors.nombre}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className={`w-full px-3 py-2 border ${errors.descripcion ? 'border-error' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors`}
                    placeholder="Descripción de la asociación"
                    rows="4"
                  />
                  {errors.descripcion && <p className="error-message">{errors.descripcion}</p>}
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                  </Button>
                  {(editingId || Object.values(formData).some((val) => val)) && (
                    <Button type="button" variant="secondary" onClick={resetForm} disabled={isLoading}>
                      {editingId ? 'Cancelar' : 'Limpiar'}
                    </Button>
                  )}
                </div>
              </form>
            </Card>
            <Card title="Asignar Conductor">
              <form onSubmit={handleAsignar} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Asociación</label>
                  <select
                    name="asociacion_id"
                    value={asignacionForm.asociacion_id}
                    onChange={(e) => setAsignacionForm({ ...asignacionForm, asociacion_id: e.target.value })}
                    className={`w-full px-3 py-2 border ${errors.asociacion_id ? 'border-error' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors`}
                  >
                    <option value="">Seleccionar</option>
                    {asociaciones.map((asociacion) => (
                      <option key={asociacion.id} value={asociacion.id}>
                        {asociacion.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.asociacion_id && <p className="error-message">{errors.asociacion_id}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Conductor</label>
                  <select
                    name="conductor_id"
                    value={asignacionForm.conductor_id}
                    onChange={(e) => setAsignacionForm({ ...asignacionForm, conductor_id: e.target.value })}
                    className={`w-full px-3 py-2 border ${errors.conductor_id ? 'border-error' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors`}
                  >
                    <option value="">Seleccionar</option>
                    {conductores.map((conductor) => (
                      <option key={conductor.conductor.id} value={conductor.conductor.id}>
                        {conductor.name}
                      </option>
                    ))}
                  </select>
                  {errors.conductor_id && <p className="error-message">{errors.conductor_id}</p>}
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Asignando...' : 'Asignar'}
                </Button>
              </form>
            </Card>
          </div>
          <Card title="Lista de Asociaciones" className="lg:col-span-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredAsociaciones.length === 0 ? (
              <p className="text-text-light text-center py-4">No se encontraron asociaciones</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Descripción</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Conductores</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAsociaciones.map((asociacion) => (
                      <tr key={asociacion.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{asociacion.nombre}</td>
                        <td className="px-6 py-4 text-sm text-text-light">{asociacion.descripcion || '-'}</td>
                        <td className="px-6 py-4 text-sm text-text-light">
                          {asociacion.conductores.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {asociacion.conductores.map((conductor, index) => (
                                <li
                                  key={conductor.pivot?.id || `conductor-${asociacion.id}-${index}`}
                                  className="flex justify-between items-center"
                                >
                                  <span>{conductor.user?.name || 'Conductor desconocido'}</span>
                                  {conductor.pivot?.id && (
                                    <button
                                      onClick={() => handleDesasignar(conductor.pivot.id)}
                                      className="text-error hover:underline ml-2"
                                      disabled={isLoading}
                                    >
                                      Desasignar
                                    </button>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            'Sin conductores'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleEdit(asociacion)}
                            className="text-primary mr-4 hover:underline"
                            disabled={isLoading}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(asociacion.id)}
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
      </main>
      <Footer />
    </div>
  );
};

export default AsociacionManagement;