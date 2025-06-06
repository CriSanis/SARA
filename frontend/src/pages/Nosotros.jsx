import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DefaultImage from '../components/common/DefaultImage';

const Nosotros = () => {
  const [imageError, setImageError] = useState({
    team: false,
    panorama: false
  });

  const handleImageError = (type) => {
    console.log(`Error loading ${type} image`);
    setImageError(prev => ({
      ...prev,
      [type]: true
    }));
  };

  // URLs de ejemplo para las imágenes
  const imageUrls = {
    panorama: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1000&auto=format&fit=crop",
    team: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop"
  };

  return (
    <div className="min-h-screen bg-background-light">
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-gradient-to-r from-primary to-primary-dark">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold mb-4"
            >
              Nuestra Historia
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl"
            >
              Jóvenes innovadores de El Alto transformando el transporte
            </motion.p>
          </div>
        </div>
      </section>

      {/* Historia Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">El Origen de S.A.R.A.</h2>
              <p className="text-gray-600 mb-4">
                Todo comenzó en el Instituto Técnico Boliviano Francés, donde un grupo de jóvenes 
                estudiantes de entre 20 y 21 años, todos alteños, identificaron una oportunidad 
                única para transformar el transporte en su ciudad.
              </p>
              <p className="text-gray-600 mb-4">
                Como residentes de El Alto, experimentamos de primera mano los desafíos de la 
                movilidad urbana: rutas desorganizadas, tiempos de espera prolongados y falta 
                de información en tiempo real para los usuarios.
              </p>
              <p className="text-gray-600">
                Motivados por la necesidad de mejorar la calidad de vida de los alteños, 
                desarrollamos S.A.R.A. como un proyecto académico que pronto se convirtió en 
                una solución real para la comunidad.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative h-[400px] rounded-lg overflow-hidden shadow-xl"
            >
              {!imageError.panorama ? (
                <img
                  src={imageUrls.panorama}
                  alt="Panorama de El Alto"
                  className="w-full h-full object-cover"
                  onError={() => handleImageError('panorama')}
                />
              ) : (
                <DefaultImage type="panorama" className="rounded-lg" />
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-background-light p-8 rounded-lg shadow-lg"
            >
              <h3 className="text-2xl font-bold text-primary mb-4">Nuestra Misión</h3>
              <p className="text-gray-600">
                Optimizar el sistema de transporte en El Alto mediante tecnología innovadora, 
                mejorando la eficiencia de las rutas y la experiencia de los usuarios, mientras 
                contribuimos al desarrollo sostenible de la ciudad.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-background-light p-8 rounded-lg shadow-lg"
            >
              <h3 className="text-2xl font-bold text-primary mb-4">Nuestra Visión</h3>
              <p className="text-gray-600">
                Ser el sistema de transporte más eficiente y confiable de Bolivia, 
                transformando la movilidad urbana y sirviendo como modelo para otras 
                ciudades del país.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-gray-900 mb-12"
          >
            Nuestro Equipo
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Cristian Sanis */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="relative h-64">
                {!imageError.team ? (
                  <img
                    src={imageUrls.team}
                    alt="Cristian Sanis"
                    className="w-full h-full object-cover"
                    onError={() => handleImageError('team')}
                  />
                ) : (
                  <DefaultImage type="team" />
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cristian Sanis</h3>
                <p className="text-primary mb-2">Líder del Proyecto</p>
                <p className="text-gray-600">
                  Estudiante del Instituto Técnico Boliviano Francés, apasionado por la innovación 
                  y el desarrollo tecnológico.
                </p>
              </div>
            </motion.div>

            {/* Jhonatan Mamani */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="relative h-64">
                {!imageError.team ? (
                  <img
                    src={imageUrls.team}
                    alt="Jhonatan Mamani"
                    className="w-full h-full object-cover"
                    onError={() => handleImageError('team')}
                  />
                ) : (
                  <DefaultImage type="team" />
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Jhonatan Mamani</h3>
                <p className="text-primary mb-2">Desarrollador</p>
                <p className="text-gray-600">
                  Comprometido con la excelencia técnica y la mejora continua de la plataforma.
                </p>
              </div>
            </motion.div>

            {/* Limber Sumi */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="relative h-64">
                {!imageError.team ? (
                  <img
                    src={imageUrls.team}
                    alt="Limber Sumi"
                    className="w-full h-full object-cover"
                    onError={() => handleImageError('team')}
                  />
                ) : (
                  <DefaultImage type="team" />
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Limber Sumi</h3>
                <p className="text-primary mb-2">Innovador</p>
                <p className="text-gray-600">
                  Siempre buscando nuevas soluciones para mejorar la experiencia del usuario.
                </p>
              </div>
            </motion.div>

            {/* Elvis */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="relative h-64">
                {!imageError.team ? (
                  <img
                    src={imageUrls.team}
                    alt="Elvis"
                    className="w-full h-full object-cover"
                    onError={() => handleImageError('team')}
                  />
                ) : (
                  <DefaultImage type="team" />
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Elvis</h3>
                <p className="text-primary mb-2">Estratega</p>
                <p className="text-gray-600">
                  Enfocado en crear soluciones que marquen la diferencia en nuestra comunidad.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white mb-8"
          >
            ¿Quieres ser parte de nuestra historia?
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <a
              href="/register"
              className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300"
            >
              Únete a Nosotros
            </a>
            <a
              href="/contacto"
              className="inline-block bg-primary-dark text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-darker transition-colors duration-300 border border-white/20"
            >
              Contáctanos
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Nosotros; 