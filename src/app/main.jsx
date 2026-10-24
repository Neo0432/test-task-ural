import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PartsSearchPage } from '../pages/parts-search/index.js';
import { createAppStore } from './store.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={createAppStore()}>
      <PartsSearchPage />
    </Provider>
  </StrictMode>,
);
