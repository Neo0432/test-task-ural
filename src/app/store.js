import { configureStore } from '@reduxjs/toolkit';
import { partSearchReducer } from '../features/part-search/index.js';

export const createAppStore = () => configureStore({ reducer: { partSearch: partSearchReducer } });
