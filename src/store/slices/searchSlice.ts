import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Listing, ListingFilter } from '../../types';
interface SearchState { query: string; filters: ListingFilter; results: Listing[]; loading: boolean; }
const initialState: SearchState = { query: '', filters: {}, results: [], loading: false };
const searchSlice = createSlice({
  name: 'search', initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => { state.query = action.payload; },
    setFilters: (state, action: PayloadAction<ListingFilter>) => { state.filters = action.payload; },
    setResults: (state, action: PayloadAction<Listing[]>) => { state.results = action.payload; state.loading = false; },
    setLoading: (state, action: PayloadAction<boolean>) => { state.loading = action.payload; },
    clearSearch: (state) => { state.query = ''; state.filters = {}; state.results = []; },
  },
});
export const { setQuery, setFilters, setResults, setLoading, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
