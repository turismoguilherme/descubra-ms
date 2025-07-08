
import React, { createContext, useContext } from "react";
import { useTourismData } from "@/hooks/useTourismData";
import { TourismData } from "@/types/tourism";
import { getSourceName } from "@/services/tourismApi";

interface TourismDataContextType {
  data: TourismData | undefined;
  isLoading: boolean;
  isError: boolean;
  lastUpdated: string | null;
  source: string | null;
  refetch: () => void;
  refreshData: () => void;
  isRefreshing: boolean;
}

// Create the context with a null default value
const TourismDataContext = createContext<TourismDataContextType | null>(null);

export const TourismDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    data, 
    isLoading, 
    isError, 
    refetch, 
    dataUpdatedAt,
    refreshData,
    isRefreshing
  } = useTourismData();
  
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleString() : null;
  const source = data?.source ? getSourceName(data.source) : null;
  
  // Provide the context value to all children
  return (
    <TourismDataContext.Provider value={{ 
      data, 
      isLoading, 
      isError,
      lastUpdated,
      source,
      refetch,
      refreshData,
      isRefreshing
    }}>
      {children}
    </TourismDataContext.Provider>
  );
};

// Hook to use the tourism data context
export const useTourismDataContext = () => {
  const context = useContext(TourismDataContext);
  
  if (!context) {
    // Changing the error message to English for consistency
    throw new Error("useTourismDataContext must be used within a TourismDataProvider");
  }
  
  return context;
};
