import { create } from 'zustand';
import { type Product, type CartItem, type WishlistItem } from '@shared/schema';

interface SearchState {
  query: string;
  isOpen: boolean;
  setQuery: (query: string) => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  isOpen: false,
  setQuery: (query) => set({ query }),
  setIsOpen: (isOpen) => set({ isOpen }),
}));

interface UIState {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  toggleCart: () => void;
  toggleMobileMenu: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  setIsCartOpen: (isCartOpen) => set({ isCartOpen }),
  setIsMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
  toggleCart: () => set({ isCartOpen: !get().isCartOpen }),
  toggleMobileMenu: () => set({ isMobileMenuOpen: !get().isMobileMenuOpen }),
}));
