import React from 'react';
import ReactDOM from 'react-dom/client';
import './Css/index.css';
import App from './App';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ErrorlogcontextProvider from './contexts/errorlogcontext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorlogcontextProvider>
      <App />
    </ErrorlogcontextProvider>
  </React.StrictMode>
);
