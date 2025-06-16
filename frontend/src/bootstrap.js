import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.baseURL = 'http://localhost:8000';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel) => {
        return {
            authorize: async (socketId, callback) => {
                try {
                    const response = await axios.post('/broadcasting/auth', {
                        socket_id: socketId,
                        channel_name: channel.name
                    });
                    callback(null, response.data);
                } catch (error) {
                    console.error('Error en la autenticación del canal:', error);
                    callback(error, null);
                }
            }
        };
    }
}); 