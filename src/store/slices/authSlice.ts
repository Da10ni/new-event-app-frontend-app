import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, Vendor } from '../../types';
interface AuthState {
  user: User | null; vendor: Vendor | null; accessToken: string | null; refreshToken: string | null;
  isAuthenticated: boolean; role: 'client' | 'vendor' | 'admin' | null; loading: boolean; error: string | null;
}
const loadAuthState = (): Partial<AuthState> => {
  try {
    const user = localStorage.getItem('auth_user');
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const vendor = localStorage.getItem('auth_vendor');
    if (user && accessToken) {
      const parsedUser = JSON.parse(user) as User;
      return { user: parsedUser, vendor: vendor ? JSON.parse(vendor) as Vendor : null, accessToken, refreshToken, isAuthenticated: true, role: parsedUser.role };
    }
  } catch { /* ignore */ }
  return {};
};
const initialState: AuthState = { user: null, vendor: null, accessToken: null, refreshToken: null, isAuthenticated: false, role: null, loading: false, error: null, ...loadAuthState() };
const authSlice = createSlice({
  name: 'auth', initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => { state.loading = action.payload; },
    setCredentials: (state, action: PayloadAction<{ user: User; vendor?: Vendor | null; accessToken: string; refreshToken: string }>) => {
      state.user = action.payload.user; state.vendor = action.payload.vendor || null;
      state.accessToken = action.payload.accessToken; state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true; state.role = action.payload.user.role; state.error = null;
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
      if (action.payload.vendor) localStorage.setItem('auth_vendor', JSON.stringify(action.payload.vendor));
    },
    setUser: (state, action: PayloadAction<User>) => { state.user = action.payload; },
    setVendor: (state, action: PayloadAction<Vendor>) => { state.vendor = action.payload; },
    setError: (state, action: PayloadAction<string>) => { state.error = action.payload; state.loading = false; },
    clearAuth: () => { localStorage.removeItem('auth_user'); localStorage.removeItem('auth_vendor'); localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); return { user: null, vendor: null, accessToken: null, refreshToken: null, isAuthenticated: false, role: null, loading: false, error: null }; },
    switchRole: (state) => { state.role = state.role === 'client' ? 'vendor' : 'client'; },
  },
});
export const { setLoading, setCredentials, setUser, setVendor, setError, clearAuth, switchRole } = authSlice.actions;
export default authSlice.reducer;
