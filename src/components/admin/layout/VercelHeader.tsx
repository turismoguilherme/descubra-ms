import { useState, useEffect } from 'react';
import { Search, Bell, HelpCircle, Moon, Sun, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import GlobalSearch from './GlobalSearch';

export default function VercelHeader() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('admin-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Aplicar tema
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/viajar/admin';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="h-16 bg-[#0A0A0A] dark:bg-[#0A0A0A] border-b border-[#1F1F1F] flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
      {/* Left: Logo + Project Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* ViajARTur Logo */}
          <div className="w-6 h-6 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">V</span>
          </div>
          <span className="text-[#A1A1AA] text-sm">/</span>
          {/* Descubra MS Logo */}
          <div className="w-6 h-6 bg-gradient-to-br from-[#16A34A] to-[#3B82F6] rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">D</span>
          </div>
          <span className="text-[#A1A1AA] text-sm">/</span>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium">
              {userProfile?.full_name || user?.email?.split('@')[0] || 'Admin'}
            </span>
            <span className="px-2 py-0.5 bg-[#3B82F6] text-white text-xs font-medium rounded">
              Admin
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <GlobalSearch />
        
        {/* Feedback */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-3 text-[#A1A1AA] hover:text-white hover:bg-[#1F1F1F] hidden md:flex"
        >
          Feedback
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-[#A1A1AA] hover:text-white hover:bg-[#1F1F1F]"
        >
          <Bell className="h-4 w-4" />
        </Button>

        {/* Help */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-[#A1A1AA] hover:text-white hover:bg-[#1F1F1F]"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="h-9 w-9 p-0 text-[#A1A1AA] hover:text-white hover:bg-[#1F1F1F]"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Profile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="h-9 w-9 p-0 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] hover:opacity-80"
        >
          <span className="text-white text-xs font-medium">
            {(userProfile?.full_name || user?.email || 'A')[0].toUpperCase()}
          </span>
        </Button>
      </div>
    </header>
  );
}

