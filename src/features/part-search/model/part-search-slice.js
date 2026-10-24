import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchGoods } from '../../../shared/api/fetch-goods.js';
import { toBrands, toOfferRows } from '../lib/goods-mappers.js';

const initialBrands = { status: 'idle', items: [], error: null, requestId: null };
const initialOffers = { status: 'idle', rows: [], error: null, requestId: null };
const initialState = { number: '', selectedBrand: null, brands: initialBrands, offers: initialOffers };

export const fetchBrands = createAsyncThunk('partSearch/fetchBrands', (number, { signal }) =>
  fetchGoods({ number }, signal),
);

export const fetchOffers = createAsyncThunk('partSearch/fetchOffers', ({ number, brand }, { signal }) =>
  fetchGoods({ number, brand, analogues: 'on' }, signal),
);

const isStale = (request, { meta }) => meta.aborted || meta.requestId !== request.requestId;

const partSearchSlice = createSlice({
  name: 'partSearch',
  initialState,
  reducers: {
    searchCleared: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state, { meta }) => {
        state.number = meta.arg;
        state.selectedBrand = null;
        state.brands = { ...initialBrands, status: 'loading', requestId: meta.requestId };
        state.offers = initialOffers;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        if (isStale(state.brands, action)) {
          return;
        }
        state.brands.status = 'succeeded';
        state.brands.items = toBrands(action.payload);
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        if (isStale(state.brands, action)) {
          return;
        }
        state.brands.status = 'failed';
        state.brands.error = action.error.message;
      })
      .addCase(fetchOffers.pending, (state, { meta }) => {
        state.selectedBrand = meta.arg.brand;
        state.offers = { ...initialOffers, status: 'loading', requestId: meta.requestId };
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        if (isStale(state.offers, action)) {
          return;
        }
        state.offers.status = 'succeeded';
        state.offers.rows = toOfferRows(action.payload);
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        if (isStale(state.offers, action)) {
          return;
        }
        state.offers.status = 'failed';
        state.offers.error = action.error.message;
      });
  },
});

export const { searchCleared } = partSearchSlice.actions;

export const selectNumber = (state) => state.partSearch.number;
export const selectSelectedBrand = (state) => state.partSearch.selectedBrand;
export const selectBrands = (state) => state.partSearch.brands;
export const selectOffers = (state) => state.partSearch.offers;

export default partSearchSlice.reducer;
