import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { getUser, logout } from '../../services/auth';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getUser(token)
        .then((response) => setUser(response.data))
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    await logout(token);
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-primary text-white p-4 shadow-md">
      <div className="container-center">
        <div className="flex justify-between items-center w-full max-w-7xl">
          <Link to="/" className="text-2xl font-bold">
            S.A.R.A.
          </Link>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="capitalize">{user.name} ({user.user_type})</span>
                <Button variant="secondary" onClick={handleLogout}>
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary">Iniciar Sesión</Button>
                </Link>
                <Link to="/register">
                  <Button>Registrarse</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;