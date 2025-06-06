import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Navbar from '../components/layout/Navbar';
import { login } from '../services/auth';
import { FaUser, FaLock, FaEnvelope, FaArrowRight } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const navigate = useNavigate();

  // Efecto para animar la entrada de elementos
  useEffect(() => {
    const elements = document.querySelectorAll('.animate-on-mount');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('opacity-100', 'translate-y-0');
      }, 100 * index);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await login({ email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary-dark text-white py-20">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="hero-title text-4xl md:text-5xl mb-6 animate-fade-in text-white">
              <span className="block mb-2 text-3xl md:text-4xl font-light">Bienvenido de nuevo</span>
              <span className="block text-5xl md:text-7xl text-white/90 font-extrabold tracking-tight">Inicia Sesión</span>
              <span className="block mt-2 text-2xl md:text-3xl text-white/80 font-medium">Accede a tu cuenta S.A.R.A.</span>
            </h1>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
            <div className="md:flex">
              {/* Lado izquierdo - Imagen decorativa */}
              <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-primary to-primary-dark p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                  backgroundSize: '20px 20px'
                }}></div>
                <div className="h-full flex flex-col justify-center text-white relative z-10">
                  <h2 className="text-4xl font-bold mb-6 animate-on-mount opacity-0 translate-y-4 transition-all duration-500">
                    ¡Bienvenido de nuevo!
                  </h2>
                  <p className="text-lg mb-8 animate-on-mount opacity-0 translate-y-4 transition-all duration-500 delay-100">
                    Accede a tu cuenta para gestionar tus traslados y mudanzas.
                  </p>
                  <div className="space-y-4">
                    {[
                      { text: 'Gestiona tus pedidos', icon: '📦' },
                      { text: 'Sigue tus traslados en tiempo real', icon: '🚚' },
                      { text: 'Comunícate con conductores', icon: '👥' }
                    ].map((feature, index) => (
                      <div 
                        key={feature.text}
                        className="flex items-center animate-on-mount opacity-0 translate-y-4 transition-all duration-500"
                        style={{ transitionDelay: `${(index + 2) * 100}ms` }}
                      >
                        <span className="text-2xl mr-3">{feature.icon}</span>
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Lado derecho - Formulario */}
              <div className="md:w-1/2 p-8 md:p-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 animate-on-mount opacity-0 translate-y-4 transition-all duration-500">
                  Iniciar Sesión
                </h2>
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 animate-shake">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="animate-on-mount opacity-0 translate-y-4 transition-all duration-500">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setActiveField('email')}
                        onBlur={() => setActiveField(null)}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 ${
                          activeField === 'email'
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-gray-300 hover:border-primary'
                        }`}
                        placeholder="tuemail@ejemplo.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="animate-on-mount opacity-0 translate-y-4 transition-all duration-500" style={{ transitionDelay: '100ms' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setActiveField('password')}
                        onBlur={() => setActiveField(null)}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 ${
                          activeField === 'password'
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-gray-300 hover:border-primary'
                        }`}
                        placeholder="********"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between animate-on-mount opacity-0 translate-y-4 transition-all duration-500" style={{ transitionDelay: '200ms' }}>
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Recordarme
                      </label>
                    </div>
                    <a href="/forgot-password" className="text-sm text-primary hover:text-primary-dark transition-colors duration-200">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>

                  <Button 
                    type="submit"
                    className={`w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-lg font-medium 
                      transform transition-all duration-300 hover:from-primary-dark hover:to-primary-darker hover:scale-[1.02] 
                      active:scale-[0.98] ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Iniciando sesión...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span>Iniciar Sesión</span>
                        <FaArrowRight className="ml-2" />
                      </div>
                    )}
                  </Button>
                </form>
                <p className="mt-6 text-center text-gray-600 animate-on-mount opacity-0 translate-y-4 transition-all duration-500" style={{ transitionDelay: '300ms' }}>
                  ¿No tienes una cuenta?{' '}
                  <a 
                    href="/register" 
                    className="text-primary hover:text-primary-dark font-medium transition-colors duration-200 hover:underline"
                  >
                    Regístrate aquí
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;