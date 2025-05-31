import React from 'react';
import ReactDOM from 'react-dom/client';
import './variables.css';
import './main.css';
import App from './App';
import { DataLayer } from './DataLayer';
import reducer,{ initialState } from './reducer';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DataLayer initialState={initialState} reducer={reducer}>
      <App />
    </DataLayer> 
  </React.StrictMode>,
  document.getElementById("root")
);


