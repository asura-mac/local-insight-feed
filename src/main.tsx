
import React from 'react' // Explicitly import React
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create root with strict mode to help catch potential issues
const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
