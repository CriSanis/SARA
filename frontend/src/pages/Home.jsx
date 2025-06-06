import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

const Home = () => {
  return (
    <div className="min-h-screen bg-background-light">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary-dark text-white py-20">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="hero-title text-4xl md:text-5xl mb-6 animate-fade-in text-white">
              <span className="block mb-2 text-3xl md:text-4xl font-light">Descubre</span>
              <span className="block text-5xl md:text-7xl text-white/90 font-extrabold tracking-tight">S.A.R.A.</span>
              <span className="block mt-2 text-2xl md:text-3xl text-white/80 font-medium">Tu Transporte, Tu Control</span>
        </h1>
            <p className="hero-subtitle text-xl md:text-2xl text-white/90 max-w-3xl mx-auto animate-slide-up">
              Más de 1000+ usuarios ya confían en nosotros. ¿Te unes a la revolución del transporte en El Alto?
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300 btn-glow text-lg transform hover:scale-105"
              >
                Comienza Ahora - Es Gratis
              </Link>
              <Link
                to="/login"
                className="inline-block bg-primary-dark text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-darker transition-colors duration-300 text-lg border border-white/20"
              >
                Ya soy parte de S.A.R.A.
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="hero-subtitle text-xl text-gray-600">
              Únete a la comunidad más grande de transporte en El Alto
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-all duration-300 border border-primary/10">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="feature-title text-xl font-bold text-primary mb-4">Crecimiento Garantizado</h3>
              <p className="body-text text-gray-600">
                Aumenta tus ingresos con nuestra plataforma optimizada y comunidad activa
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-all duration-300 border border-primary/10">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="feature-title text-xl font-bold text-primary mb-4">Beneficios Exclusivos</h3>
              <p className="body-text text-gray-600">
                Accede a descuentos especiales y oportunidades únicas al registrarte hoy
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-all duration-300 border border-primary/10">
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="feature-title text-xl font-bold text-primary mb-4">Soporte Premium</h3>
              <p className="body-text text-gray-600">
                Atención personalizada y asistencia 24/7 para todos nuestros miembros
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nosotros Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              El Equipo detrás de S.A.R.A.
            </h2>
            <p className="hero-subtitle text-xl text-gray-600">
              Jóvenes innovadores de El Alto transformando el futuro del transporte
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Cristian Sanis */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-primary/10">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-4xl">👨‍💻</span>
              </div>
              <h3 className="text-xl font-bold text-primary text-center mb-2">Cristian Sanis</h3>
              <p className="text-gray-600 text-center mb-2">Líder del Proyecto</p>
              <p className="text-sm text-gray-500 text-center">
                Estudiante del Instituto Técnico Boliviano Francés, apasionado por la innovación y el desarrollo tecnológico.
              </p>
            </div>

            {/* Jhonatan Mamani */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-primary/10">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-4xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-primary text-center mb-2">Jhonatan Mamani</h3>
              <p className="text-gray-600 text-center mb-2">Desarrollador</p>
              <p className="text-sm text-gray-500 text-center">
                Comprometido con la excelencia técnica y la mejora continua de la plataforma.
              </p>
            </div>

            {/* Limber Sumi */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-primary/10">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-4xl">💡</span>
              </div>
              <h3 className="text-xl font-bold text-primary text-center mb-2">Limber Sumi</h3>
              <p className="text-gray-600 text-center mb-2">Innovador</p>
              <p className="text-sm text-gray-500 text-center">
                Siempre buscando nuevas soluciones para mejorar la experiencia del usuario.
              </p>
            </div>

            {/* Elvis */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-primary/10">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-primary text-center mb-2">Elvis</h3>
              <p className="text-gray-600 text-center mb-2">Estratega</p>
              <p className="text-sm text-gray-500 text-center">
                Enfocado en crear soluciones que marquen la diferencia en nuestra comunidad.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-gray-600 italic">
              "Unidos por una visión común: transformar el transporte en El Alto a través de la innovación y la tecnología"
            </p>
            <div className="mt-6">
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Instituto Técnico Boliviano Francés
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-gray-600">Usuarios Activos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">5000+</div>
              <div className="text-gray-600">Envíos Completados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">98%</div>
              <div className="text-gray-600">Satisfacción</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-gray-600">Soporte</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title text-3xl md:text-4xl font-bold mb-6">Tu éxito comienza aquí</h2>
          <p className="hero-subtitle text-xl mb-8 text-white/90">
            Únete a miles de usuarios que ya están transformando su negocio
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300 btn-glow text-lg transform hover:scale-105"
            >
              Crear mi Cuenta Gratis
          </Link>
            <Link
              to="/login"
              className="inline-block bg-primary-dark text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-darker transition-colors duration-300 text-lg border border-white/20"
            >
              Acceder a mi Cuenta
          </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;