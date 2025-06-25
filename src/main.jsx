// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Garanta que está importando SEU App.jsx
// Importe seus estilos globais. O Vite pode ter criado um index.css.
// Se você for usar Tailwind CSS, este é um bom lugar para importar o CSS gerado pelo Tailwind.
import './index.css'; // Ou './styles/global.css', etc.

// Importa filtros de console para suprimir avisos de extensões externas
import './utils/consoleFilters.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);