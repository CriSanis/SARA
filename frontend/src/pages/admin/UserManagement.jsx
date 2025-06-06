import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/auth';
import { FaUsers, FaSearch, FaUserPlus, FaEdit, FaTrash } from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    user_type: 'client',
    licencia: '',
  });
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
    fetchUsers();
  }, [navigate, token]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getUsers(token);
      setUsers(response.data);
      setErrors({});
    } catch (err) {
      setErrors({ general: 'Error al cargar usuarios' });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!editingId && !formData.password) newErrors.password = 'La contraseña es requerida';
    else if (!editingId && formData.password.length < 8) newErrors.password = 'Mínimo 8 caracteres';
    if (formData.user_type === 'driver' && !formData.licencia.trim()) {
      newErrors.licencia = 'La licencia es requerida';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password; // Evitar enviar contraseña vacía al editar
      if (editingId) {
        await updateUser(token, editingId, payload);
      } else {
        await createUser(token, payload);
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Error al guardar usuario' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      user_type: user.user_type,
      licencia: user.conductor?.licencia || '',
    });
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Confirmar eliminación?')) {
      setIsLoading(true);
      try {
        await deleteUser(token, id);
        fetchUsers();
      } catch (err) {
        setErrors({ general: 'Error al eliminar usuario' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      user_type: 'client',
      licencia: '',
    });
    setErrors({});
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="h-16 bg-gradient-to-r from-blue-500 to-blue-600"></div>
      <main className="flex-grow container mx-auto px-4 py-8 -mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaUsers className="text-3xl text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-1">
                    Gestión de Usuarios
                  </h1>
                  <p className="text-gray-600">
                    Administra los usuarios del sistema
                  </p>
                </div>
              </div>
              <div className="relative w-full max-w-xs">
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center border border-red-200">
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
            <Card title={editingId ? 'Editar Usuario' : 'Crear Nuevo Usuario'} className="lg:col-span-1 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                    placeholder="Nombre completo"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                    placeholder="tuemail@ejemplo.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                    placeholder={editingId ? 'Dejar en blanco para no cambiar' : '********'}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Usuario</label>
                  <select
                    name="user_type"
                    value={formData.user_type}
                    onChange={(e) => setFormData({ ...formData, user_type: e.target.value, licencia: e.target.value !== 'driver' ? '' : formData.licencia })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="client">Cliente</option>
                    <option value="driver">Conductor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                {formData.user_type === 'driver' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Licencia</label>
                    <input
                      type="text"
                      name="licencia"
                      value={formData.licencia}
                      onChange={(e) => setFormData({ ...formData, licencia: e.target.value })}
                      className={`w-full px-3 py-2 border ${errors.licencia ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                      placeholder="ABC12345"
                    />
                    {errors.licencia && <p className="text-red-500 text-sm mt-1">{errors.licencia}</p>}
                  </div>
                )}
                <div className="flex space-x-2">
                  <Button type="submit" disabled={isLoading} className="flex items-center space-x-2">
                    <FaUserPlus className="h-4 w-4" />
                    <span>{isLoading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}</span>
                  </Button>
                  {(editingId || Object.values(formData).some((val) => val)) && (
                    <Button type="button" variant="secondary" onClick={resetForm} disabled={isLoading}>
                      {editingId ? 'Cancelar' : 'Limpiar'}
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            <Card title="Lista de Usuarios" className="lg:col-span-2 border border-gray-100">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No se encontraron usuarios</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{user.user_type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-blue-600 hover:text-blue-800 mr-4 flex items-center space-x-1"
                              disabled={isLoading}
                            >
                              <FaEdit className="h-4 w-4" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                              disabled={isLoading}
                            >
                              <FaTrash className="h-4 w-4" />
                              <span>Eliminar</span>
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
    </div>
  );
};

export default UserManagement;