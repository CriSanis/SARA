import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaTruck, FaUser, FaMapMarkerAlt, FaInfoCircle, FaUserPlus, FaClock, FaLocationArrow, FaImage, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { showPedidoNotification, showSystemNotification, showEstadoNotification, showTiempoNotification } from '../components/NotificationToast';
import NotificationBell from '../components/NotificationBell';
import Echo from 'laravel-echo';

// Fix para los íconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = ({ center, markers, onMarkerClick }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng]);
    }
    
    // Agregar el evento de clic al mapa
    map.on('click', (e) => {
      if (onMarkerClick) {
        onMarkerClick(e);
      }
    });

    // Limpiar el evento cuando el componente se desmonte
    return () => {
      map.off('click');
    };
  }, [center, map, onMarkerClick]);

  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {markers && markers.map((marker, index) => (
        <Marker
          key={index}
          position={[marker.lat, marker.lng]}
        >
          <Popup>
            {marker.title}
          </Popup>
        </Marker>
      ))}
    </>
  );
};

const PedidoMap = ({ pedido }) => {
  const markers = [];
  
  if (pedido?.origen_coordenadas) {
    markers.push({
      lat: pedido.origen_coordenadas.lat,
      lng: pedido.origen_coordenadas.lng,
      title: `Origen: ${pedido.origen}`
    });
  }
  
  if (pedido?.destino_coordenadas) {
    markers.push({
      lat: pedido.destino_coordenadas.lat,
      lng: pedido.destino_coordenadas.lng,
      title: `Destino: ${pedido.destino}`
    });
  }

  const center = markers.length > 0 
    ? [markers[0].lat, markers[0].lng]
    : [-16.5, -68.15];

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <MapComponent markers={markers} center={center} />
      </MapContainer>
    </div>
  );
};

const PedidoManagement = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    cliente_id: '',
    conductor_id: '',
    estado: 'pendiente',
    fecha_entrega: '',
    direccion_origen: '',
    direccion_destino: '',
    descripcion: '',
    peso: '',
    imagenes: [],
    valor_asegurado: '',
    origen_lat: null,
    origen_lng: null,
    destino_lat: null,
    destino_lng: null
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [asignacionForm, setAsignacionForm] = useState({
    pedido_id: '',
    conductor_id: ''
  });
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [mapCenter, setMapCenter] = useState([-16.5, -68.15]); // Coordenadas por defecto (La Paz)
  const notificationBellRef = useRef(null);
  const [seguimientos, setSeguimientos] = useState({});
  const [currentLocation, setCurrentLocation] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const echoRef = useRef(null);

  useEffect(() => {
    if (token) {
      fetchUserRole();
    }
  }, [token]);

  useEffect(() => {
    if (userRole) {
      fetchPedidos();
      if (userRole === 'admin') {
        fetchConductores();
        fetchClientes();
      }
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole === 'driver') {
      // Inicializar Echo para WebSockets
      echoRef.current = new Echo({
        broadcaster: 'pusher',
        key: '8515eed3c0351405b011',
        cluster: 'mt1',
        forceTLS: true
      });

      // Suscribirse a los canales de seguimiento
      pedidos.forEach(pedido => {
        if (pedido.conductor_id) {
          echoRef.current.private(`pedido.${pedido.id}`)
            .listen('SeguimientoActualizado', (e) => {
              setSeguimientos(prev => ({
                ...prev,
                [pedido.id]: e.seguimiento
              }));
            });
        }
      });

      // Obtener y monitorear ubicación actual
      if ("geolocation" in navigator) {
        // Obtener ubicación inicial
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setCurrentLocation(location);
            showSystemNotification('Ubicación obtenida exitosamente', 'SUCCESS');
          },
          (error) => {
            console.error("Error obteniendo ubicación:", error);
            let mensaje = 'Error al obtener ubicación';
            switch(error.code) {
              case error.PERMISSION_DENIED:
                mensaje = 'Se requiere permiso para acceder a la ubicación';
                break;
              case error.POSITION_UNAVAILABLE:
                mensaje = 'La información de ubicación no está disponible';
                break;
              case error.TIMEOUT:
                mensaje = 'Se agotó el tiempo de espera para obtener la ubicación';
                break;
            }
            showSystemNotification(mensaje, 'ERROR');
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );

        // Configurar monitoreo continuo de ubicación
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setCurrentLocation(location);
          },
          (error) => {
            console.error("Error monitoreando ubicación:", error);
            let mensaje = 'Error al monitorear ubicación';
            switch(error.code) {
              case error.PERMISSION_DENIED:
                mensaje = 'Se requiere permiso para acceder a la ubicación';
                break;
              case error.POSITION_UNAVAILABLE:
                mensaje = 'La información de ubicación no está disponible';
                break;
              case error.TIMEOUT:
                mensaje = 'Se agotó el tiempo de espera para obtener la ubicación';
                break;
            }
            showSystemNotification(mensaje, 'ERROR');
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
        setWatchId(id);
      } else {
        showSystemNotification('Tu navegador no soporta geolocalización', 'ERROR');
      }

      return () => {
        // Limpiar suscripciones y monitoreo
        if (echoRef.current) {
          pedidos.forEach(pedido => {
            echoRef.current.leave(`pedido.${pedido.id}`);
          });
        }
        if (watchId) {
          navigator.geolocation.clearWatch(watchId);
        }
      };
    }
  }, [userRole, pedidos]);

  const fetchUserRole = async () => {
    try {
      const response = await axios.get('/api/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserRole(response.data.roles[0].name);
      // Si es cliente, establecer el cliente_id automáticamente
      if (response.data.roles[0].name === 'client') {
        setFormData(prev => ({
          ...prev,
          cliente_id: response.data.id
        }));
      }
    } catch (err) {
      console.error('Error al obtener el rol del usuario:', err);
      setError('Error al cargar la información del usuario');
    }
  };

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/pedidos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filtrar pedidos según el rol del usuario
      let pedidosFiltrados = response.data;
      if (userRole === 'driver') {
        const userId = parseInt(localStorage.getItem('userId'));
        pedidosFiltrados = response.data.filter(pedido => pedido.conductor_id === userId);
      } else if (userRole === 'client') {
        const userId = parseInt(localStorage.getItem('userId'));
        pedidosFiltrados = response.data.filter(pedido => pedido.cliente_id === userId);
      }
      
      setPedidos(pedidosFiltrados);
      setError(null);
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      setError('Error al cargar la lista de pedidos');
      showSystemNotification('Error al cargar la lista de pedidos', 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  const fetchConductores = async () => {
    try {
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filtrar solo los usuarios que son conductores
      const conductoresFiltrados = response.data.filter(user => 
        user.roles && user.roles.some(role => role.name === 'driver')
      );
      setConductores(conductoresFiltrados);
    } catch (error) {
      console.error('Error al cargar conductores:', error);
      showSystemNotification('Error al cargar la lista de conductores', 'ERROR');
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filtrar solo los usuarios que son clientes
      const clientesFiltrados = response.data.filter(user => 
        user.roles && user.roles.some(role => role.name === 'client')
      );
      setClientes(clientesFiltrados);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      showSystemNotification('Error al cargar la lista de clientes', 'ERROR');
    }
  };

  const handleCreate = async (data) => {
    try {
      const response = await axios.post('http://localhost:8000/api/pedidos', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos([...pedidos, response.data]);
      showSystemNotification('Pedido creado exitosamente', 'SUCCESS');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al crear el pedido';
      setError(errorMessage);
      showSystemNotification(errorMessage, 'ERROR');
      console.error('Error detallado:', err.response?.data);
      throw err;
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const response = await axios.put(`http://localhost:8000/api/pedidos/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(pedidos.map(pedido => 
        pedido.id === id ? response.data : pedido
      ));

      // Mostrar notificación de cambio de estado
      if (data.estado) {
        showEstadoNotification(
          `El estado del pedido ha cambiado a: ${data.estado}`,
          data.estado
        );
      }

      // Mostrar notificación de cambio de tiempo
      if (data.tiempo_estimado) {
        showTiempoNotification(
          `El tiempo estimado ha sido actualizado a: ${data.tiempo_estimado}`,
          data.tiempo_estimado,
          data.fecha_estimada
        );
      }

      return response.data;
    } catch (err) {
      setError('Error al actualizar el pedido');
      showSystemNotification('No se pudo actualizar el pedido. Por favor, intente nuevamente.', 'ERROR');
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/pedidos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(pedidos.filter(pedido => pedido.id !== id));
    } catch (err) {
      setError('Error al eliminar el pedido');
    }
  };

  if (!token) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const formDataToSend = new FormData();
    
      // Agregar campos básicos
      if (editingId) {
        // Si estamos editando, usar el cliente_id del pedido original
        const pedidoOriginal = pedidos.find(p => p.id === editingId);
        formDataToSend.append('cliente_id', pedidoOriginal.cliente_id);
      } else {
        // Si es un nuevo pedido, usar el cliente_id del formulario
    formDataToSend.append('cliente_id', formData.cliente_id);
      }

      // Solo agregar campos que han cambiado o son requeridos
      if (formData.conductor_id) formDataToSend.append('conductor_id', formData.conductor_id);
      if (formData.estado) formDataToSend.append('estado', formData.estado);
      if (formData.fecha_entrega) formDataToSend.append('fecha_entrega', formData.fecha_entrega);
      if (formData.direccion_origen) formDataToSend.append('direccion_origen', formData.direccion_origen);
      if (formData.direccion_destino) formDataToSend.append('direccion_destino', formData.direccion_destino);
      if (formData.descripcion) formDataToSend.append('descripcion', formData.descripcion);
      if (formData.peso) formDataToSend.append('peso', formData.peso);
      if (formData.valor_asegurado) formDataToSend.append('valor_asegurado', formData.valor_asegurado);
    
      // Agregar coordenadas solo si están presentes
      if (formData.origen_lat) formDataToSend.append('origen_lat', formData.origen_lat);
      if (formData.origen_lng) formDataToSend.append('origen_lng', formData.origen_lng);
      if (formData.destino_lat) formDataToSend.append('destino_lat', formData.destino_lat);
      if (formData.destino_lng) formDataToSend.append('destino_lng', formData.destino_lng);

      // Agregar imágenes solo si hay nuevas
      if (formData.imagenes && formData.imagenes.length > 0) {
    formData.imagenes.forEach((imagen, index) => {
      formDataToSend.append(`imagenes[${index}]`, imagen);
    });
      }

      let response;
    if (editingId) {
        // Actualización
        console.log('Enviando datos de actualización:', Object.fromEntries(formDataToSend));
        
        // Convertir FormData a objeto para la actualización
        const updateData = {};
        formDataToSend.forEach((value, key) => {
          updateData[key] = value;
        });
        
        response = await axios.put(`/api/pedidos/${editingId}`, updateData, {
        headers: { 
          Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
      });
        
        console.log('Respuesta del servidor:', response.data);
        
        // Actualizar el estado local inmediatamente
        setPedidos(prevPedidos => 
          prevPedidos.map(pedido => 
            pedido.id === editingId ? response.data : pedido
          )
        );
        
        // Mostrar notificaciones específicas de actualización
        if (response.data.estado) {
          showEstadoNotification(
            `El estado del pedido ha cambiado a: ${response.data.estado}`,
            response.data.estado
          );
        }
        
      showPedidoNotification('Pedido actualizado exitosamente', 'SUCCESS');
    } else {
        // Creación
        response = await axios.post('/api/pedidos', formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
        
        setPedidos(prevPedidos => [...prevPedidos, response.data]);
      showPedidoNotification('Pedido creado exitosamente', 'SUCCESS');
    }

      // Limpiar el formulario
    resetForm();
      
      // Actualizar la lista de pedidos
      const updatedPedidos = await axios.get('/api/pedidos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(updatedPedidos.data);
      
  } catch (error) {
    console.error('Error al guardar el pedido:', error);
      if (error.response?.data?.errors) {
        // Mostrar cada error de validación
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          showSystemNotification(`${field}: ${messages.join(', ')}`, 'ERROR');
        });
      } else {
    const mensaje = error.response?.data?.message || 'Error al guardar el pedido';
    showSystemNotification(mensaje, 'ERROR');
      }
  }
};

  const handleEdit = (pedido) => {
    setEditingId(pedido.id);
    setFormData({
      cliente_id: pedido.cliente_id,
      conductor_id: pedido.conductor_id || '',
      origen_lat: parseFloat(pedido.origen_lat) || null,
      origen_lng: parseFloat(pedido.origen_lng) || null,
      destino_lat: parseFloat(pedido.destino_lat) || null,
      destino_lng: parseFloat(pedido.destino_lng) || null,
      descripcion: pedido.descripcion || '',
      peso: pedido.peso || '',
      valor_asegurado: pedido.valor_asegurado || '',
      direccion_origen: pedido.direccion_origen || '',
      direccion_destino: pedido.direccion_destino || '',
      estado: pedido.estado || 'pendiente',
      fecha_entrega: pedido.fecha_entrega ? new Date(pedido.fecha_entrega).toISOString().slice(0, 16) : '',
      imagenes: pedido.imagenes || []
    });
    // Scroll al formulario de edición
    document.querySelector('.form-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      cliente_id: '',
      conductor_id: '',
      estado: 'pendiente',
      fecha_entrega: '',
      direccion_origen: '',
      direccion_destino: '',
      descripcion: '',
      peso: '',
      imagenes: [],
      valor_asegurado: '',
      origen_lat: null,
      origen_lng: null,
      destino_lat: null,
      destino_lng: null
    });
    setEditingId(null);
  };

  const canCreatePedido = userRole === 'client' || userRole === 'admin';
  const canEditPedido = (pedido) => {
    if (userRole === 'admin') return true;
    if (userRole === 'client') return pedido.cliente_id === parseInt(localStorage.getItem('userId'));
    if (userRole === 'driver') return pedido.conductor_id === parseInt(localStorage.getItem('conductorId'));
    return false;
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800';
      case 'completado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAsignarConductor = async (e) => {
    e.preventDefault();
    try {
      console.log('Intentando asignar conductor:', {
        pedido_id: asignacionForm.pedido_id,
        conductor_id: asignacionForm.conductor_id
      });

      const response = await axios.post('http://localhost:8000/api/pedido-conductor', {
        pedido_id: parseInt(asignacionForm.pedido_id),
        conductor_id: parseInt(asignacionForm.conductor_id)
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Respuesta del servidor:', response.data);
      
      // Actualizar la lista de pedidos
      await fetchPedidos();
      
      // Limpiar el formulario
      setAsignacionForm({
        pedido_id: '',
        conductor_id: ''
      });
      
      showPedidoNotification('El conductor ha sido asignado exitosamente al pedido', 'ASSIGNED');
      
      // Notificar al cliente
      const pedido = pedidos.find(p => p.id === parseInt(asignacionForm.pedido_id));
      const conductor = conductores.find(c => c.id === parseInt(asignacionForm.conductor_id));
      
      if (pedido && conductor) {
        const notification = {
          title: 'Conductor Asignado',
          message: `Se ha asignado a ${conductor.name} - ${conductor.conductor?.licencia || 'Sin licencia'} como conductor de tu pedido de ${pedido.direccion_origen} a ${pedido.direccion_destino}`,
          timestamp: new Date().toISOString(),
          read: false
        };
        notificationBellRef.current?.addNotification(notification);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al asignar conductor:', err.response?.data || err);
      const errorMessage = err.response?.data?.message || 'Error al asignar el conductor';
      setError(errorMessage);
      showSystemNotification(errorMessage, 'ERROR');
    }
  };

  const getLocationName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name;
    } catch (error) {
      console.error('Error al obtener el nombre de la ubicación:', error);
      return null;
    }
  };

  const handleMapClick = async (type, lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      const direccion = data.display_name || '';

      if (type === 'origen') {
        setFormData(prev => ({
          ...prev,
          origen_lat: lat,
          origen_lng: lng,
          direccion_origen: direccion
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          destino_lat: lat,
          destino_lng: lng,
          direccion_destino: direccion
        }));
      }
    } catch (error) {
      console.error('Error al obtener la dirección:', error);
      showSystemNotification('Error al obtener la dirección', 'ERROR');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      imagenes: files
    }));
  };

  const actualizarUbicacion = async (pedidoId) => {
    if (!currentLocation) {
      showSystemNotification('No se pudo obtener tu ubicación actual', 'ERROR');
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/seguimientos', {
        pedido_id: pedidoId,
        latitud: currentLocation.lat,
        longitud: currentLocation.lng
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSystemNotification('Ubicación actualizada exitosamente', 'SUCCESS');
    } catch (err) {
      console.error('Error al actualizar ubicación:', err.response?.data);
      showSystemNotification(
        err.response?.data?.message || 'Error al actualizar ubicación', 
        'ERROR'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-16 shadow-lg flex items-center justify-between px-6">
        <div className="flex items-center space-x-3">
          <FaTruck className="text-3xl text-white" />
          <span className="text-2xl font-bold text-white">S.A.R.A.</span>
        </div>
        <div className="flex items-center space-x-4">
          <NotificationBell ref={notificationBellRef} userRole={userRole} />
        </div>
      </div>
      <main className="container mx-auto px-4 py-8 -mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 mb-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaBox className="text-2xl sm:text-3xl text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                    {userRole === 'client' && 'Mis Pedidos'}
                    {userRole === 'driver' && 'Pedidos Asignados'}
                    {userRole === 'admin' && 'Gestión de Pedidos'}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    {userRole === 'client' && 'Administra tus pedidos de transporte'}
                    {userRole === 'driver' && 'Gestiona los pedidos asignados a ti'}
                    {userRole === 'admin' && 'Administra todos los pedidos del sistema'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
              <div className="flex items-center">
                <FaInfoCircle className="mr-2" />
                {error}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8">
            {canCreatePedido && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 form-container">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800 flex items-center">
                  <FaBox className="mr-2 text-blue-600" />
                  {editingId ? 'Editar Pedido' : 'Nuevo Pedido'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userRole === 'admin' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FaUser className="inline mr-2 text-blue-600" />
                          Cliente
                        </label>
                        <select
                          name="cliente_id"
                          value={formData.cliente_id}
                          onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          required
                        >
                          <option value="">Seleccione un cliente</option>
                          {clientes.map(cliente => (
                            <option key={cliente.id} value={cliente.id}>
                              {cliente.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {userRole === 'admin' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Conductor</label>
                      <select
                        name="conductor_id"
                        value={formData.conductor_id}
                        onChange={(e) => setFormData({ ...formData, conductor_id: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Seleccione un conductor</option>
                        {conductores.map(conductor => (
                          <option key={conductor.id} value={conductor.id}>
                            {conductor.name} - {conductor.conductor?.licencia || 'Sin licencia'}
                          </option>
                        ))}
                      </select>
                    </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Entrega</label>
                      <input
                        type="datetime-local"
                        name="fecha_entrega"
                        value={formData.fecha_entrega}
                        onChange={(e) => setFormData({ ...formData, fecha_entrega: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaMapMarkerAlt className="inline mr-2 text-blue-600" />
                        Origen
                      </label>
                      <input
                        type="text"
                        value={formData.direccion_origen}
                        onChange={(e) => setFormData({...formData, direccion_origen: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                        placeholder="Selecciona una ubicación en el mapa"
                        readOnly
                      />
                      {formData.origen_lat && (
                        <div className="mt-2 text-sm text-gray-600">
                          Lat: {Number(formData.origen_lat).toFixed(6)}, 
                          Lng: {Number(formData.origen_lng).toFixed(6)}
                        </div>
                      )}
                      <div className="mt-2 h-64 w-full rounded-lg overflow-hidden">
                        <MapContainer 
                          center={formData.origen_lat && formData.origen_lng ? [formData.origen_lat, formData.origen_lng] : mapCenter} 
                          zoom={13} 
                          style={{ height: '100%', width: '100%' }}
                        >
                          <MapComponent 
                            markers={formData.origen_lat && formData.origen_lng ? [{
                              lat: formData.origen_lat,
                              lng: formData.origen_lng,
                              title: formData.direccion_origen || 'Origen seleccionado'
                            }] : []}
                            center={formData.origen_lat && formData.origen_lng ? [formData.origen_lat, formData.origen_lng] : mapCenter}
                            onMarkerClick={(e) => handleMapClick('origen', e.latlng.lat, e.latlng.lng)}
                          />
                        </MapContainer>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaMapMarkerAlt className="inline mr-2 text-blue-600" />
                        Destino
                      </label>
                      <input
                        type="text"
                        value={formData.direccion_destino}
                        onChange={(e) => setFormData({...formData, direccion_destino: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                        placeholder="Selecciona una ubicación en el mapa"
                        readOnly
                      />
                      {formData.destino_lat && (
                        <div className="mt-2 text-sm text-gray-600">
                          Lat: {Number(formData.destino_lat).toFixed(6)}, 
                          Lng: {Number(formData.destino_lng).toFixed(6)}
                        </div>
                      )}
                      <div className="mt-2 h-64 w-full rounded-lg overflow-hidden">
                        <MapContainer 
                          center={formData.destino_lat && formData.destino_lng ? [formData.destino_lat, formData.destino_lng] : mapCenter} 
                          zoom={13} 
                          style={{ height: '100%', width: '100%' }}
                        >
                          <MapComponent 
                            markers={formData.destino_lat && formData.destino_lng ? [{
                              lat: formData.destino_lat,
                              lng: formData.destino_lng,
                              title: formData.direccion_destino || 'Destino seleccionado'
                            }] : []}
                            center={formData.destino_lat && formData.destino_lng ? [formData.destino_lat, formData.destino_lng] : mapCenter}
                            onMarkerClick={(e) => handleMapClick('destino', e.latlng.lat, e.latlng.lng)}
                          />
                        </MapContainer>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Descripción</label>
                      <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                      <input
                        type="number"
                        name="peso"
                        value={formData.peso}
                        onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Valor Asegurado</label>
                      <input
                        type="number"
                        name="valor_asegurado"
                        value={formData.valor_asegurado}
                        onChange={(e) => setFormData({ ...formData, valor_asegurado: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaImage className="inline mr-2 text-blue-600" />
                        Imágenes
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                      {/* Mostrar imágenes existentes */}
                      {formData.imagenes && formData.imagenes.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {formData.imagenes.map((imagen, index) => (
                            <div key={index} className="relative">
                              <img
                                src={typeof imagen === 'string' 
                                  ? `http://localhost:8000/storage/${imagen}`
                                  : URL.createObjectURL(imagen)}
                                alt={`Imagen ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const nuevasImagenes = [...formData.imagenes];
                                  nuevasImagenes.splice(index, 1);
                                  setFormData(prev => ({ ...prev, imagenes: nuevasImagenes }));
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      disabled={!formData.origen_lat || !formData.destino_lat}
                    >
                      {editingId ? 'Actualizar' : 'Crear'} Pedido
                    </button>
                  </div>
                </form>
              </div>
            )}

            {userRole === 'admin' && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800 flex items-center">
                  <FaUserPlus className="mr-2 text-blue-600" />
                  Asignar Conductor
                </h2>
                <form onSubmit={handleAsignarConductor} className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaBox className="inline mr-2 text-blue-600" />
                      Pedido
                    </label>
                   <select
                     value={asignacionForm.pedido_id}
                      onChange={(e) => setAsignacionForm({...asignacionForm, pedido_id: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                     required
                   >
                      <option value="">Seleccionar pedido</option>
                     {pedidos
                        .filter(pedido => {
                          // Mostrar solo pedidos que:
                          // 1. No tienen conductor asignado
                          // 2. Están en estado pendiente
                          // 3. Tienen todas las direcciones necesarias
                          return !pedido.conductor_id && 
                                 pedido.estado === 'pendiente' && 
                                 pedido.direccion_origen && 
                                 pedido.direccion_destino;
                        })
                        .map(pedido => (
                         <option key={pedido.id} value={pedido.id}>
                            Pedido #{pedido.id} - {pedido.direccion_origen} → {pedido.direccion_destino}
                         </option>
                       ))}
                   </select>
                 </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaUser className="inline mr-2 text-blue-600" />
                      Conductor
                    </label>
                   <select
                     value={asignacionForm.conductor_id}
                      onChange={(e) => setAsignacionForm({...asignacionForm, conductor_id: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                     required
                      disabled={loading}
                    >
                      <option value="">Seleccionar conductor</option>
                      {conductores.map(conductor => (
                        <option key={conductor.id} value={conductor.id}>
                          {conductor.name} - {conductor.conductor?.licencia || 'Sin licencia'}
                       </option>
                     ))}
                   </select>
                    {loading && (
                      <p className="mt-2 text-sm text-gray-500">
                        Cargando conductores...
                      </p>
                    )}
                 </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      Asignar Conductor
                    </button>
                 </div>
                </form>
                   </div>
                 )}

            {userRole === 'driver' && (
              <div className="grid grid-cols-1 gap-6">
                {/* Panel de Pedidos Asignados */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FaTruck className="mr-2 text-green-600" />
                    Mis Pedidos Asignados
                  </h2>
                  <div className="space-y-6">
                    {pedidos.filter(p => p.conductor_id === parseInt(localStorage.getItem('userId'))).map(pedido => (
                      <div key={pedido.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Información del Pedido */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-800">
                                  Pedido #{pedido.id}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(pedido.estado)}`}>
                                    {pedido.estado}
                                  </span>
                                  {pedido.fecha_entrega && (
                                    <span className="flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                                      <FaClock className="mr-1" />
                                      Entrega: {new Date(pedido.fecha_entrega).toLocaleString()}
                            </span>
                          )}
                                </div>
                        </div>
                      </div>
                      
                            {/* Detalles del Pedido */}
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Descripción</h4>
                                <p className="mt-1 text-gray-800">{pedido.descripcion}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Peso</h4>
                                  <p className="mt-1 text-gray-800">{pedido.peso} kg</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Valor Asegurado</h4>
                                  <p className="mt-1 text-gray-800">${pedido.valor_asegurado}</p>
                                </div>
                              </div>
                            </div>

                            {/* Ubicaciones */}
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Origen</h4>
                                <p className="mt-1 text-gray-800">{pedido.direccion_origen}</p>
                                {pedido.origen_lat && pedido.origen_lng && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Coordenadas: {Number(pedido.origen_lat).toFixed(6)}, {Number(pedido.origen_lng).toFixed(6)}
                                  </p>
                                )}
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Destino</h4>
                                <p className="mt-1 text-gray-800">{pedido.direccion_destino}</p>
                                {pedido.destino_lat && pedido.destino_lng && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Coordenadas: {Number(pedido.destino_lat).toFixed(6)}, {Number(pedido.destino_lng).toFixed(6)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Mapa y Seguimiento */}
                          <div className="space-y-4">
                            <div className="h-64 w-full rounded-lg overflow-hidden">
                        <MapContainer 
                                center={currentLocation || [pedido.origen_lat, pedido.origen_lng]} 
                          zoom={13} 
                          style={{ height: '100%', width: '100%' }}
                        >
                          <MapComponent 
                            markers={[
                                    {
                                      lat: pedido.origen_lat,
                                      lng: pedido.origen_lng,
                                      title: `Origen: ${pedido.direccion_origen}`
                                    },
                                    {
                                      lat: pedido.destino_lat,
                                      lng: pedido.destino_lng,
                                      title: `Destino: ${pedido.direccion_destino}`
                                    },
                              ...(currentLocation ? [{
                                lat: currentLocation.lat,
                                lng: currentLocation.lng,
                                title: 'Mi Ubicación Actual'
                              }] : []),
                              ...(seguimientos[pedido.id]?.ubicacion_actual ? [{
                                lat: seguimientos[pedido.id].ubicacion_actual.lat,
                                lng: seguimientos[pedido.id].ubicacion_actual.lng,
                                title: 'Última Ubicación Registrada'
                              }] : [])
                            ]} 
                          />
                        </MapContainer>
                      </div>

                            {/* Botón de Actualización de Ubicación */}
                            <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <p>Última actualización: {seguimientos[pedido.id]?.updated_at || 'No disponible'}</p>
                      </div>
                              <button
                                onClick={() => actualizarUbicacion(pedido.id)}
                                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                                disabled={!currentLocation}
                              >
                                <FaLocationArrow />
                                <span>Actualizar Ubicación</span>
                              </button>
                    </div>

                            {/* Estado del Pedido */}
                            {pedido.estado === 'pendiente' && (
                              <button
                                onClick={() => handleUpdate(pedido.id, { estado: 'en_progreso' })}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                              >
                                Iniciar Entrega
                              </button>
                            )}
                            {pedido.estado === 'en_progreso' && (
                              <button
                                onClick={() => handleUpdate(pedido.id, { estado: 'completado' })}
                                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                              >
                                Marcar como Entregado
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {pedidos.filter(p => p.conductor_id === parseInt(localStorage.getItem('userId'))).length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No tienes pedidos asignados</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Eliminar la sección duplicada de Lista de Pedidos para el conductor */}
            {userRole !== 'driver' && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 xl:col-span-2">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800 flex items-center">
                <FaTruck className="mr-2 text-blue-600" />
                {userRole === 'client' && 'Mis Pedidos'}
                {userRole === 'admin' && 'Lista de Pedidos'}
              </h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Cargando pedidos...</p>
                </div>
                ) : pedidos.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No hay pedidos disponibles</p>
                  </div>
              ) : (
                  <div className="space-y-6">
                  {pedidos.map(pedido => (
                      <div key={pedido.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Información Principal */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                        <div>
                                <h3 className="text-xl font-semibold text-gray-800">
                                  Pedido #{pedido.id}
                          </h3>
                                <div className="flex items-center gap-2 mt-2">
                            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(pedido.estado)}`}>
                              {pedido.estado}
                            </span>
                                  {pedido.fecha_entrega && (
                                    <span className="flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                                      <FaClock className="mr-1" />
                                      Entrega: {new Date(pedido.fecha_entrega).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        {canEditPedido(pedido) && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(pedido)}
                              className="px-3 py-1 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(pedido.id)}
                              className="px-3 py-1 text-red-600 hover:text-red-800 transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>

                            {/* Detalles del Pedido */}
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Descripción</h4>
                                <p className="mt-1 text-gray-800">{pedido.descripcion}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Peso</h4>
                                  <p className="mt-1 text-gray-800">{pedido.peso} kg</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Valor Asegurado</h4>
                                  <p className="mt-1 text-gray-800">${pedido.valor_asegurado}</p>
                                </div>
                              </div>
                            </div>

                            {/* Ubicaciones */}
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Origen</h4>
                                <p className="mt-1 text-gray-800">{pedido.direccion_origen}</p>
                                {pedido.origen_lat && pedido.origen_lng && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Coordenadas: {Number(pedido.origen_lat).toFixed(6)}, {Number(pedido.origen_lng).toFixed(6)}
                                  </p>
                                )}
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Destino</h4>
                                <p className="mt-1 text-gray-800">{pedido.direccion_destino}</p>
                                {pedido.destino_lat && pedido.destino_lng && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Coordenadas: {Number(pedido.destino_lat).toFixed(6)}, {Number(pedido.destino_lng).toFixed(6)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Información de Usuarios e Imágenes */}
                          <div className="space-y-4">
                            {/* Información de Usuarios */}
                            <div className="space-y-3">
                              {userRole === 'admin' && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Cliente</h4>
                                  <div className="mt-1 flex items-center text-gray-800">
                                    <FaUser className="mr-2 text-blue-600" />
                                    {pedido.cliente?.name || 'No asignado'}
                                  </div>
                                </div>
                              )}
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Conductor</h4>
                                <div className="mt-1 flex items-center text-gray-800">
                                  <FaTruck className="mr-2 text-green-600" />
                                  {pedido.conductor_id ? (
                                    <>
                                      {conductores.find(c => c.id === pedido.conductor_id)?.name || 'Conductor no encontrado'}
                                      {conductores.find(c => c.id === pedido.conductor_id)?.conductor?.licencia && (
                                        <span className="ml-2 text-sm text-gray-500">
                                          (Licencia: {conductores.find(c => c.id === pedido.conductor_id)?.conductor?.licencia})
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    'No asignado'
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Imágenes */}
                            {pedido.imagenes && pedido.imagenes.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Imágenes del Pedido</h4>
                                <div className="grid grid-cols-3 gap-2">
                                  {pedido.imagenes.map((imagen, index) => (
                                    <div key={index} className="relative aspect-square">
                                      <img
                                        src={`http://localhost:8000/storage/${imagen}`}
                                        alt={`Imagen ${index + 1} del pedido`}
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                    </div>
                  ))}
                                </div>
                </div>
              )}
            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PedidoManagement;