import { useContext } from "react";
import { ViaJARAuthContext } from "@/hooks/auth/ViaJARAuthContext";

export const useViaJARAuth = () => {
  const context = useContext(ViaJARAuthContext);
  
  if (!context) {
    throw new Error("useViaJARAuth must be used within a ViaJARAuthProvider");
  }
  
  return {
    ...context,
    isLoading: context.loading
  };
};

