import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ProductsProvider } from './context/ProductsContext';
import { DialogProvider } from './context/DialogContext';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DialogProvider>
      <ProductsProvider>
        <App />
      </ProductsProvider>
    </DialogProvider>
  </React.StrictMode>
);