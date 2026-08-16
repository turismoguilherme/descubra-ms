
import { createContext, useContext, useState, ReactNode } from "react";

interface Toast {
  id: string;
  title: string;
  description: string;
  variant: "default" | "destructive";
}

interface SimpleToastContextType {
  showToast: (title: string, description: string, variant?: "default" | "destructive") => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const SimpleToastContext = createContext<SimpleToastContextType | undefined>(undefined);

export const useSimpleToast = () => {
  const context = useContext(SimpleToastContext);
  if (!context) {
    // Fallback para quando não há contexto disponível
    return {
      showToast: (title: string, description: string, variant: "default" | "destructive" = "default") => {
        console.log(`Toast: ${title} - ${description} (${variant})`);
      }
    };
  }
  return context;
};

interface SimpleToastProviderProps {
  children: ReactNode;
}

export const SimpleToastProvider = ({ children }: SimpleToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, title, description, variant };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove após 5 segundos
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <SimpleToastContext.Provider value={{ showToast, toasts, removeToast }}>
      {children}
      <SimpleToastDisplay toasts={toasts} onRemove={removeToast} />
    </SimpleToastContext.Provider>
  );
};

interface SimpleToastDisplayProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const SimpleToastDisplay = ({ toasts, onRemove }: SimpleToastDisplayProps) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg max-w-sm ${
            toast.variant === "destructive" 
              ? "bg-red-50 border border-red-200 text-red-800" 
              : "bg-green-50 border border-green-200 text-green-800"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{toast.title}</h4>
              <p className="text-sm mt-1">{toast.description}</p>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
