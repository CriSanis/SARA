import React from 'react';
import Navbar from '../components/layout/Navbar';

const Servicios = () => {
  const servicios = [
    {
      id: 1,
      titulo: 'Mudanzas Completas',
      descripcion: 'Servicio integral de mudanzas para hogares y oficinas, incluyendo embalaje, transporte y desembalaje.',
      icono: '🚚',
      caracteristicas: [
        'Embalaje profesional',
        'Transporte seguro',
        'Montaje de muebles',
        'Seguro incluido'
      ]
    },
    {
      id: 2,
      titulo: 'Envíos Express',
      descripcion: 'Entrega rápida y segura de paquetes y documentos en toda la ciudad de El Alto.',
      icono: '📦',
      caracteristicas: [
        'Entrega el mismo día',
        'Seguimiento en tiempo real',
        'Cobertura completa',
        'Atención personalizada'
      ]
    },
    {
      id: 3,
      titulo: 'Logística Empresarial',
      descripcion: 'Soluciones logísticas personalizadas para empresas de todos los tamaños.',
      icono: '🏢',
      caracteristicas: [
        'Rutas optimizadas',
        'Gestión de flota',
        'Reportes detallados',
        'Soporte 24/7'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background-light">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary-dark text-white py-20">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in text-white">
              Nuestros Servicios
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto animate-slide-up">
              Soluciones de transporte y logística diseñadas para satisfacer todas tus necesidades
            </p>
          </div>
        </div>
      </section>

      {/* Servicios Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicios.map((servicio) => (
              <div
                key={servicio.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300"
              >
                <div className="p-8">
                  <div className="text-4xl mb-4">{servicio.icono}</div>
                  <h3 className="text-2xl font-bold text-primary mb-4">{servicio.titulo}</h3>
                  <p className="text-gray-600 mb-6">{servicio.descripcion}</p>
                  <ul className="space-y-3">
                    {servicio.caracteristicas.map((caracteristica, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {caracteristica}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">¿Listo para comenzar?</h2>
          <p className="text-xl mb-8 text-white/90">
            Contáctanos hoy mismo y descubre cómo podemos ayudarte
          </p>
          <a
            href="/contacto"
            className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300"
          >
            Contáctanos
          </a>
        </div>
      </section>
    </div>
  );
};

export default Servicios; 