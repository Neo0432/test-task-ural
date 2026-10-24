import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchGoods } from '../../../shared/api/fetch-goods.js';

const EMPTY_CELL = '—';

const toBrands = (goods) => {
  const brands = new Map();
  goods.forEach(({ brand, name }) => {
    if (!brands.has(brand)) {
      brands.set(brand, { brand, name });
    }
  });
  return [...brands.values()];
};

const toOfferRows = (goods) =>
  goods
    .flatMap((item) => [item, ...(item.analogues ?? [])])
    .flatMap(({ brand, number, name, warehouses }) =>
      warehouses?.length
        ? warehouses.map(({ code, price, stock }) => ({
            brand,
            number,
            name,
            warehouse: code || EMPTY_CELL,
            price: Number(price).toFixed(2),
            stock,
          }))
        : [{ brand, number, name, warehouse: EMPTY_CELL, price: EMPTY_CELL, stock: 0 }],
    );

const initialBrands = { number: '', status: 'idle', items: [], error: null };
const initialOffers = { brand: null, status: 'idle', rows: [], error: null, requestId: null };
const initialState = { brands: initialBrands, offers: initialOffers };

export const fetchBrands = createAsyncThunk('partSearch/fetchBrands', (number, { signal }) =>
  fetchGoods({ number }, signal),
);

export const fetchOffers = createAsyncThunk('partSearch/fetchOffers', ({ number, brand }, { signal }) =>
  fetchGoods({ number, brand, analogues: 'on' }, signal),
);

const partSearchSlice = createSlice({
  name: 'partSearch',
  initialState,
  reducers: {
    searchCleared: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state, action) => {
        state.brands = { ...initialBrands, number: action.meta.arg, status: 'loading' };
        state.offers = initialOffers;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brands.status = 'succeeded';
        state.brands.items = toBrands(action.payload);
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        if (action.meta.aborted) {
          return;
        }
        state.brands.status = 'failed';
        state.brands.error = action.error.message;
      })
      .addCase(fetchOffers.pending, (state, action) => {
        state.offers = {
          ...initialOffers,
          brand: action.meta.arg.brand,
          status: 'loading',
          requestId: action.meta.requestId,
        };
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.offers.requestId) {
          return;
        }
        state.offers.status = 'succeeded';
        state.offers.rows = toOfferRows(action.payload);
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        if (action.meta.requestId !== state.offers.requestId) {
          return;
        }
        state.offers.status = 'failed';
        state.offers.error = action.error.message;
      });
  },
});

export const { searchCleared } = partSearchSlice.actions;

export const selectBrands = (state) => state.partSearch.brands;
export const selectOffers = (state) => state.partSearch.offers;
export const selectSelectedBrand = (state) => state.partSearch.offers.brand;

export default partSearchSlice.reducer;
