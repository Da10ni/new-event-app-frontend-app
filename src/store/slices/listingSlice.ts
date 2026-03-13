import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Listing } from '../../types';
interface ListingState { listings: Listing[]; featuredListings: Listing[]; selectedListing: Listing | null; loading: boolean; error: string | null; }
const initialState: ListingState = { listings: [], featuredListings: [], selectedListing: null, loading: false, error: null };
const listingSlice = createSlice({
  name: 'listing', initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => { state.loading = action.payload; },
    setListings: (state, action: PayloadAction<Listing[]>) => { state.listings = action.payload; state.loading = false; },
    setFeaturedListings: (state, action: PayloadAction<Listing[]>) => { state.featuredListings = action.payload; },
    setSelectedListing: (state, action: PayloadAction<Listing | null>) => { state.selectedListing = action.payload; },
    setError: (state, action: PayloadAction<string>) => { state.error = action.payload; state.loading = false; },
  },
});
export const { setLoading, setListings, setFeaturedListings, setSelectedListing, setError } = listingSlice.actions;
export default listingSlice.reducer;
