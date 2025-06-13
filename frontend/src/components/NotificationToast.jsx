import React from 'react';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const notificationTypes = {
    PEDIDO: {
        CREATED: {
            title: 'Nuevo Pedido',
            icon: FaCheckCircle,
            color: '#10B981',
            bgColor: '#ECFDF5',
            borderColor: '#D1FAE5'
        },
        UPDATED: {
            title: 'Pedido Actualizado',
            icon: FaInfoCircle,
            color: '#3B82F6',
            bgColor: '#EFF6FF',
            borderColor: '#DBEAFE'
        },
        DELETED: {
            title: 'Pedido Eliminado',
            icon: FaExclamationCircle,
            color: '#EF4444',
            bgColor: '#FEF2F2',
            borderColor: '#FEE2E2'
        },
        ASSIGNED: {
            title: 'Conductor Asignado',
            icon: FaCheckCircle,
            color: '#8B5CF6',
            bgColor: '#F5F3FF',
            borderColor: '#EDE9FE'
        }
    },
    AUTH: {
        LOGIN: {
            title: 'Bienvenido',
            icon: FaCheckCircle,
            color: '#059669',
            bgColor: '#ECFDF5',
            borderColor: '#D1FAE5'
        },
        LOGOUT: {
            title: 'Sesión Cerrada',
            icon: FaInfoCircle,
            color: '#6B7280',
            bgColor: '#F9FAFB',
            borderColor: '#F3F4F6'
        },
        ERROR: {
            title: 'Error de Autenticación',
            icon: FaExclamationCircle,
            color: '#DC2626',
            bgColor: '#FEF2F2',
            borderColor: '#FEE2E2'
        }
    },
    SYSTEM: {
        ERROR: {
            title: 'Error del Sistema',
            icon: FaExclamationCircle,
            color: '#DC2626',
            bgColor: '#FEF2F2',
            borderColor: '#FEE2E2'
        },
        WARNING: {
            title: 'Advertencia',
            icon: FaExclamationTriangle,
            color: '#D97706',
            bgColor: '#FFFBEB',
            borderColor: '#FEF3C7'
        },
        INFO: {
            title: 'Información',
            icon: FaInfoCircle,
            color: '#3B82F6',
            bgColor: '#EFF6FF',
            borderColor: '#DBEAFE'
        }
    }
};

export const showNotification = (message, type, category = 'SYSTEM', options = {}) => {
    const notificationConfig = notificationTypes[category]?.[type] || notificationTypes.SYSTEM.INFO;
    const Icon = notificationConfig.icon;

    const defaultOptions = {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
            background: notificationConfig.bgColor,
            color: '#1F2937',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
            border: `1px solid ${notificationConfig.borderColor}`,
            minWidth: '300px'
        },
        progressStyle: {
            background: notificationConfig.color
        }
    };

    const content = (
        <div className="flex items-start space-x-3">
            <Icon className="flex-shrink-0 mt-1" style={{ color: notificationConfig.color }} size={20} />
            <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1" style={{ color: notificationConfig.color }}>
                    {notificationConfig.title}
                </h4>
                <p className="text-sm text-gray-600">{message}</p>
            </div>
        </div>
    );

    const toastOptions = { ...defaultOptions, ...options };

    switch (type) {
        case 'ERROR':
            toast.error(content, toastOptions);
            break;
        case 'WARNING':
            toast.warning(content, toastOptions);
            break;
        case 'INFO':
            toast.info(content, toastOptions);
            break;
        default:
            toast.success(content, toastOptions);
    }
};

// Funciones helper para tipos específicos de notificaciones
export const showPedidoNotification = (message, type) => {
    showNotification(message, type, 'PEDIDO');
};

export const showAuthNotification = (message, type) => {
    showNotification(message, type, 'AUTH');
};

export const showSystemNotification = (message, type) => {
    showNotification(message, type, 'SYSTEM');
};

export const showEstadoNotification = (message, estado) => {
    let icon = '🔄';
    let color = 'blue';
    
    switch (estado) {
        case 'pendiente':
            icon = '⏳';
            color = 'yellow';
            break;
        case 'en_progreso':
            icon = '🚚';
            color = 'blue';
            break;
        case 'completado':
            icon = '✅';
            color = 'green';
            break;
        case 'cancelado':
            icon = '❌';
            color = 'red';
            break;
        default:
            icon = '🔄';
            color = 'blue';
    }

    toast(
        <div className="flex items-start">
            <div className="flex-shrink-0">
                <span className="text-2xl">{icon}</span>
            </div>
            <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                    Estado Actualizado
                </p>
                <p className="mt-1 text-sm text-gray-500">
                    {message}
                </p>
            </div>
        </div>,
        {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            style: {
                background: `linear-gradient(to right, ${color}50, white)`,
                borderLeft: `4px solid ${color}`,
            },
        }
    );
};

export const showTiempoNotification = (message, tiempoEstimado, fechaEstimada) => {
    toast(
        <div className="flex items-start">
            <div className="flex-shrink-0">
                <span className="text-2xl">⏰</span>
            </div>
            <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                    Tiempo Estimado Actualizado
                </p>
                <p className="mt-1 text-sm text-gray-500">
                    {message}
                </p>
                {fechaEstimada && (
                    <p className="mt-1 text-sm text-gray-500">
                        Llegada estimada: {new Date(fechaEstimada).toLocaleString()}
                    </p>
                )}
            </div>
        </div>,
        {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            style: {
                background: 'linear-gradient(to right, #60A5FA50, white)',
                borderLeft: '4px solid #60A5FA',
            },
        }
    );
};

export const NotificationContainer = () => {
    return (
        <div className="notification-container">
            {/* El contenedor de notificaciones se renderiza automáticamente */}
        </div>
    );
}; 