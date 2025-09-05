import { create } from 'zustand';

// This creates a global store for your authentication state.
export const useAuthStore = create((set) => ({
  // The default state: the user is not authenticated.
  isAuthenticated: false,

  // An "action" to log the user in.
  // It changes isAuthenticated to true.
  login: () => set({ isAuthenticated: true }),

  // An "action" to log the user out.
  // It changes isAuthenticated to false.
  logout: () => set({ isAuthenticated: false }),
}));