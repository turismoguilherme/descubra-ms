import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import GlobalSearch from './GlobalSearch';
import AdminBreadcrumb from './AdminBreadcrumb';

export default function AdminHeader() {
  const { user, userProfile } = useAuth();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/viajar/admin';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="bg-white border-b border-[#E5E5E5] h-16 flex items-center justify-between px-8 shadow-sm">
      {/* Breadcrumb */}
      <div className="flex-1">
        <AdminBreadcrumb />
      </div>

      {/* Right side: Search + User */}
      <div className="flex items-center gap-4">
        <GlobalSearch />
        
        <div className="flex items-center gap-3 pl-4 border-l border-[#E5E5E5]">
          <div className="text-right">
            <p className="text-sm font-medium text-[#0A0A0A]">{userProfile?.full_name || user?.email}</p>
            <p className="text-xs text-[#6B7280]">{userProfile?.role || 'admin'}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-9 px-3 text-sm text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#FAFAFA]"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}

