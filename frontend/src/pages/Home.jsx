import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container-center bg-background-light">
        <h1 className="text-5xl font-bold mb-6">
          Bienvenido a S.A.R.A.
        </h1>
        <p className="text-xl text-text-light mb-8 max-w-2xl">
          Sistema Ágil de Rutas y Asignaciones para transporte y mudanzas en El Alto, Bolivia.
        </p>
        <div className="space-x-4">
          <Link to="/register">
            <Button>Comenzar Ahora</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary">Iniciar Sesión</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;