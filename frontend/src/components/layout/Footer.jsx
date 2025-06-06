import React from 'react';
import { Link } from 'react-router-dom';
import { FaTruck } from 'react-icons/fa';
import SocialIcons from '../common/SocialIcons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    servicios: [
      { label: 'Mudanzas', path: '/servicios/mudanzas' },
      { label: 'Envíos Express', path: '/servicios/express' },
      { label: 'Logística Empresarial', path: '/servicios/empresarial' },
      { label: 'Rutas Optimizadas', path: '/servicios/rutas' },
    ],
    empresa: [
      { label: 'Nosotros', path: '/nosotros' },
      { label: 'Blog', path: '/blog' },
      { label: 'Carreras', path: '/carreras' },
      { label: 'Contacto', path: '/contacto' },
    ],
    legal: [
      { label: 'Términos y Condiciones', path: '/legal/terminos' },
      { label: 'Política de Privacidad', path: '/legal/privacidad' },
      { label: 'Cookies', path: '/legal/cookies' },
    ],
  };

  return (
    <footer className="bg-gradient-to-b from-background-light to-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo y Descripción */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FaTruck className="text-2xl text-white" />
              </div>
              <span className="text-2xl font-bold text-primary">S.A.R.A.</span>
            </Link>
            <p className="text-gray-600 mb-4">
              Transformando el transporte en El Alto con soluciones inteligentes y eficientes.
              Conectamos personas y negocios a través de un servicio de calidad.
            </p>
            <SocialIcons className="mb-4" />
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+591 123 456 789</span>
            </div>
          </div>

          {/* Enlaces de Servicios */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Servicios</h3>
            <ul className="space-y-2">
              {footerLinks.servicios.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-600 hover:text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Enlaces de Empresa */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Empresa</h3>
            <ul className="space-y-2">
              {footerLinks.empresa.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-600 hover:text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Enlaces Legales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-600 hover:text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Copyright y Enlaces Adicionales */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © {currentYear} S.A.R.A. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="/contacto"
              className="text-gray-600 hover:text-primary text-sm transition-colors duration-300"
            >
              Contacto
            </Link>
            <Link
              to="/faq"
              className="text-gray-600 hover:text-primary text-sm transition-colors duration-300"
            >
              Preguntas Frecuentes
            </Link>
            <Link
              to="/soporte"
              className="text-gray-600 hover:text-primary text-sm transition-colors duration-300"
            >
              Soporte
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;