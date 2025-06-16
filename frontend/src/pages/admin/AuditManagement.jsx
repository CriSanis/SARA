import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAudits, getAuditsByModel, getAuditsByUser, getAuditsByAction } from '../../services/audit';
import { FaHistory, FaUser, FaBox, FaRoute, FaCar, FaUsers, FaFilter, FaBoxOpen, FaUserTie, FaBuilding, FaInfoCircle, FaCalendarAlt, FaSearch } from 'react-icons/fa';

const AuditManagement = () => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filters, setFilters] = useState({
    model: '',
    action: '',
    userId: '',
  });
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log('Cambio de filtro:', { name, value }); // Log del cambio

    setFilters(prev => {
      const newFilters = {
        ...prev,
        [name]: value
      };
      console.log('Nuevos filtros:', newFilters); // Log de los nuevos filtros
      return newFilters;
    });
  };

  const resetFilters = () => {
    setFilters({});
  };

  const fetchData = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      console.log('Filtros antes de la petición:', filters); // Log antes de la petición
      const response = await getAudits(token, filters);
      console.log('Respuesta del servidor:', response.data); // Log de la respuesta
      setAudits(response.data);
    } catch (err) {
      console.error('Error completo:', err); // Log del error completo
      showMessage(err.response?.data?.message || 'Error al cargar registros de auditoría', true);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, token, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getModelIcon = (model) => {
    switch (model) {
      case 'pedido':
        return <FaBoxOpen className="text-blue-500" />;
      case 'conductor':
        return <FaUserTie className="text-green-500" />;
      case 'asociacion':
        return <FaBuilding className="text-purple-500" />;
      case 'usuario':
        return <FaUsers className="text-indigo-500" />;
      case 'vehiculo':
        return <FaCar className="text-yellow-500" />;
      default:
        return <FaHistory className="text-gray-500" />;
    }
  };

  const getModelLabel = (model) => {
    switch (model) {
      case 'pedido':
        return 'Pedido';
      case 'conductor':
        return 'Conductor';
      case 'asociacion':
        return 'Asociación';
      case 'usuario':
        return 'Usuario';
      case 'vehiculo':
        return 'Vehículo';
      default:
        return model;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'assign_conductor':
        return 'bg-yellow-100 text-yellow-800';
      case 'verify':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'create':
        return 'Creación';
      case 'update':
        return 'Actualización';
      case 'delete':
        return 'Eliminación';
      case 'assign_conductor':
        return 'Asignación de Conductor';
      case 'verify':
        return 'Verificación';
      default:
        return action;
    }
  };

  if (loading && audits.length === 0) {
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
                  <FaHistory className="text-3xl text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-1">
                    Registro de Auditoría
                  </h1>
                  <p className="text-gray-600">
                    Historial de acciones en el sistema
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500 flex items-center">
                  <FaInfoCircle className="mr-1" />
                  <span>Total Registros: {audits.length}</span>
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

          <Card className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <FaFilter className="text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-800">Filtros de Búsqueda</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Modelo</label>
                <select
                  name="model"
                  value={filters.model}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Todos los modelos</option>
                  <option value="pedido">Pedidos</option>
                  <option value="conductor">Conductores</option>
                  <option value="asociacion">Asociaciones</option>
                  <option value="usuario">Usuarios</option>
                  <option value="vehiculo">Vehículos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Acción</label>
                <select
                  name="action"
                  value={filters.action}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Todas las acciones</option>
                  <option value="create">Creación</option>
                  <option value="update">Actualización</option>
                  <option value="delete">Eliminación</option>
                  <option value="assign_conductor">Asignación de Conductor</option>
                  <option value="verify">Verificación</option>
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <Button
                  onClick={resetFilters}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {audits.map((audit) => (
              <Card key={audit.id} className="relative">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getModelIcon(audit.model_type.toLowerCase().split('\\').pop())}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {getModelLabel(audit.model_type.toLowerCase().split('\\').pop())} #{audit.model_id}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <FaCalendarAlt className="text-gray-400" />
                          <span>{new Date(audit.created_at).toLocaleString()}</span>
                          <FaUser className="text-gray-400 ml-2" />
                          <span>{audit.user?.name || 'Sistema'}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getActionColor(audit.action)}`}>
                        {getActionLabel(audit.action)}
                      </span>
                    </div>
                    {audit.changes && Object.keys(audit.changes).length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Cambios Realizados:</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                            {JSON.stringify(audit.changes, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuditManagement; 