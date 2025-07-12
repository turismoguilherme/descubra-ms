import { useContext } from "react";
import { AuthContext } from "@/hooks/auth/AuthContext";

console.log("🔧 DEBUG: useAuth hook module loaded at:", new Date().toISOString());
console.log("🔧 DEBUG: AuthContext imported:", AuthContext);

export const useAuth = () => {
  console.log("🔧 DEBUG: useAuth function called at:", new Date().toISOString());
  const context = useContext(AuthContext);
  console.log("🔧 DEBUG: useAuth context retrieved:", context);
  
  if (!context) {
    console.error("❌ ERROR: useAuth called outside of AuthProvider");
    console.error("❌ Context value:", context);
    console.error("❌ AuthContext:", AuthContext);
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  console.log("✅ SUCCESS: useAuth returning context");
  return {
    ...context,
    isLoading: context.loading
  };
};