import { useContext } from "react";
import { AuthContext } from "@/hooks/auth/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return {
    ...context,
    isLoading: context.loading
  };
};