import { useContext } from "react";
import { AuthContext } from "@/hooks/auth/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // More detailed error with debugging info
    console.error("useAuth called outside of AuthProvider. Current context:", context);
    console.error("AuthContext value:", AuthContext);
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return {
    ...context,
    isLoading: context.loading
  };
};