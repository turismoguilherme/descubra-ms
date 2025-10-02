// Stub temporário
import { createContext, ReactNode } from "react";

export const OverflowOneAuthContext = createContext<any>(undefined);

export const OverflowOneAuthProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};
