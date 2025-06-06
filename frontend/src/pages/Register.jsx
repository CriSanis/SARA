import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Navbar from '../components/layout/Navbar';
import { register } from '../services/auth';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaUserPlus, FaArrowRight } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    user_type: 'client',
  });
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
      const response = await register(formData);
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Error al registrarse. Verifica los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
              <span className="block mb-2 text-3xl md:text-4xl font-light">Únete a</span>
              <span className="block text-5xl md:text-7xl text-white/90 font-extrabold tracking-tight">S.A.R.A.</span>
              <span className="block mt-2 text-2xl md:text-3xl text-white/80 font-medium">Tu Transporte, Tu Control</span>
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
                  <h2 className="text-4xl font-bold mb-6 animate-on-mount opacity-0 translate-y-4 transition-all duration-500">¡Únete a S.A.R.A!</h2>
                  <p className="text-lg mb-8 animate-on-mount opacity-0 translate-y-4 transition-all duration-500 delay-100">
                    Optimiza tus traslados y mudanzas en El Alto con nuestra plataforma inteligente.
                  </p>
                  <div className="space-y-4">
                    {[
                      { text: 'Rutas optimizadas', icon: '🗺️' },
                      { text: 'Conductores verificados', icon: '✅' },
                      { text: 'Seguimiento en tiempo real', icon: '📱' }
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
                  Crear cuenta
                </h2>
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 animate-shake">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {[
                    { name: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Tu nombre', icon: <FaUser /> },
                    { name: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'tuemail@ejemplo.com', icon: <FaEnvelope /> },
                    { name: 'password', label: 'Contraseña', type: 'password', placeholder: '********', icon: <FaLock /> },
                    { name: 'password_confirmation', label: 'Confirmar contraseña', type: 'password', placeholder: '********', icon: <FaLock /> },
                    { name: 'phone', label: 'Teléfono', type: 'tel', placeholder: '123456789', icon: <FaPhone /> }
                  ].map((field, index) => (
                    <div 
                      key={field.name}
                      className="animate-on-mount opacity-0 translate-y-4 transition-all duration-500"
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {field.icon}
                        </div>
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          onFocus={() => setActiveField(field.name)}
                          onBlur={() => setActiveField(null)}
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 ${
                            activeField === field.name
                              ? 'border-primary ring-2 ring-primary/20'
                              : 'border-gray-300 hover:border-primary'
                          }`}
                          placeholder={field.placeholder}
                          required={field.type !== 'tel'}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <div className="animate-on-mount opacity-0 translate-y-4 transition-all duration-500" style={{ transitionDelay: '500ms' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de usuario
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUserPlus />
                      </div>
                      <select
                        name="user_type"
                        value={formData.user_type}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 hover:border-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      >
                        <option value="client">Cliente</option>
                        <option value="driver">Conductor</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
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
                        Creando cuenta...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span>Crear cuenta</span>
                        <FaArrowRight className="ml-2" />
                      </div>
                    )}
                  </Button>
                </form>
                <p className="mt-6 text-center text-gray-600 animate-on-mount opacity-0 translate-y-4 transition-all duration-500" style={{ transitionDelay: '600ms' }}>
                  ¿Ya tienes una cuenta?{' '}
                  <a 
                    href="/login" 
                    className="text-primary hover:text-primary-dark font-medium transition-colors duration-200 hover:underline"
                  >
                    Inicia sesión
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

export default Register;