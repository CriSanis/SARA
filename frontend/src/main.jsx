import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './bootstrap';
import { AuthProvider } from './contexts/AuthContext';
import { SeguimientoProvider } from './contexts/SeguimientoContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SeguimientoProvider>
        <App />
      </SeguimientoProvider>
    </AuthProvider>
  </React.StrictMode>
);
