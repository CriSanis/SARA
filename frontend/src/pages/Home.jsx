import React from 'react';
import Button from '../components/common/Button';

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          S.A.R.A. - Inicio
        </h1>
        <Button>Explorar</Button>
      </div>
    </div>
  );
};

export default Home;