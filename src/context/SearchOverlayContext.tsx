import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface SearchOverlayContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const SearchOverlayContext = createContext<SearchOverlayContextValue | undefined>(undefined);

interface SearchOverlayProviderProps {
  children: ReactNode;
}

export const SearchOverlayProvider: React.FC<SearchOverlayProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <SearchOverlayContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </SearchOverlayContext.Provider>
  );
};

export const useSearchOverlay = (): SearchOverlayContextValue => {
  const ctx = useContext(SearchOverlayContext);
  if (!ctx) {
    throw new Error("useSearchOverlay must be used within a SearchOverlayProvider");
  }
  return ctx;
};

