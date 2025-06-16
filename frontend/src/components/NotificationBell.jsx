import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FaBell } from 'react-icons/fa';
import { showSystemNotification } from './NotificationToast';
import axios from 'axios';

const NotificationBell = forwardRef(({ userRole }, ref) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const token = localStorage.getItem('token');

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/notificaciones', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prevNotifications => {
                const newNotifications = response.data.filter(newNotif => 
                    !prevNotifications.some(prevNotif => prevNotif.id === newNotif.id)
                );
                return [...newNotifications, ...prevNotifications];
            });
            setUnreadCount(response.data.filter(n => !n.leida).length);
        } catch (error) {
            console.error('Error al obtener notificaciones:', error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [token]);

    useImperativeHandle(ref, () => ({
        addNotification: (notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            showSystemNotification(notification.message, 'INFO');
        }
    }));

    const handleBellClick = async () => {
        setIsOpen(!isOpen);
        if (unreadCount > 0) {
            try {
                await axios.post('http://localhost:8000/api/notificaciones/marcar-todas-leidas', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUnreadCount(0);
                setNotifications(prev => 
                    prev.map(notif => ({ ...notif, leida: true }))
                );
            } catch (error) {
                console.error('Error al marcar notificaciones como leídas:', error);
            }
        }
    };

    const clearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    const formatNotification = (notification) => {
        return {
            id: notification.id,
            title: notification.titulo || 'Nueva Notificación',
            message: notification.mensaje || 'Tienes una nueva notificación',
            timestamp: notification.created_at,
            read_at: notification.leida
        };
    };

    return (
        <div className="relative">
            <button
                onClick={handleBellClick}
                className="relative p-2 text-gray-600 hover:text-blue-600 focus:outline-none transition-colors"
            >
                <FaBell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Notificaciones</h3>
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearNotifications}
                                    className="text-sm text-red-600 hover:text-red-800"
                                >
                                    Limpiar todo
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No hay notificaciones
                            </div>
                        ) : (
                            notifications.map((notification, index) => {
                                const formattedNotification = formatNotification(notification);
                                return (
                                    <div
                                        key={notification.id || index}
                                        className={`p-4 border-b border-gray-200 hover:bg-gray-50 ${
                                            !notification.read_at ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <div className="flex items-start">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-800">
                                                    {formattedNotification.title}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {formattedNotification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(formattedNotification.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

export default NotificationBell; 