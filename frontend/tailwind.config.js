/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#06b6d4', // Celeste vibrante
        'primary-hover': '#0891b2', // Celeste hover
        secondary: '#3b82f6', // Azul brillante
        'secondary-hover': '#2563eb', // Azul hover
        'background-light': '#f0f9ff', // Fondo claro
        'background-dark': '#0f172a', // Fondo oscuro
        'text-light': '#0f172a', // Texto claro
        'text-dark': '#e0f2fe', // Texto oscuro
        error: '#ef4444', // Rojo vivo
      },
    },
  },
  plugins: [],
}