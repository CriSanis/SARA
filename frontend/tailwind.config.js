/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#06b6d4', // Celeste vibrante
          light: '#67e8f9', // Celeste claro
          dark: '#0891b2', // Celeste oscuro
          hover: '#0e7490', // Celeste hover
        },
        secondary: {
          DEFAULT: '#3b82f6', // Azul brillante
          light: '#93c5fd', // Azul claro
          dark: '#2563eb', // Azul oscuro
          hover: '#1d4ed8', // Azul hover
        },
        accent: {
          DEFAULT: '#f59e0b', // Naranja vibrante
          light: '#fcd34d', // Naranja claro
          dark: '#d97706', // Naranja oscuro
          hover: '#b45309', // Naranja hover
        },
        success: {
          DEFAULT: '#10b981', // Verde esmeralda
          light: '#6ee7b7', // Verde claro
          dark: '#059669', // Verde oscuro
        },
        background: {
          light: '#f0f9ff', // Fondo claro
          dark: '#0f172a', // Fondo oscuro
          card: '#ffffff', // Fondo de tarjetas
        },
        text: {
          light: '#0f172a', // Texto claro
          dark: '#e0f2fe', // Texto oscuro
          muted: '#64748b', // Texto suave
        },
        error: '#ef4444', // Rojo vivo
      },
    },
  },
  plugins: [],
}