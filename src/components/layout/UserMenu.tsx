
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { User, LogOut, Settings, Shield, Users, BarChart3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserAvatar } from "@/hooks/useUserAvatar";
import { useSecureAuth } from "@/hooks/useSecureAuth";

const UserMenu = () => {
  // Verificar se o AuthProvider está disponível
  let auth = null;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('UserMenu: AuthProvider não disponível:', error);
    return null; // Não renderizar menu se não há auth
  }
  
  const { user } = auth;
  const { userRole, isManager, isAdmin, handleSecureLogout } = useSecureAuth();
  const location = useLocation();
  const { avatarUrl } = useUserAvatar(); // Buscar avatar do usuário do banco
  
  // Detectar tenant do path atual
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentTenant = pathSegments[0]; // 'ms', 'descubrams', 'descubramatogrossodosul', etc.
  
  // Verificar se é um path do Descubra MS
  // Considera 'descubrams', 'descubramatogrossodosul' e 'ms' como paths do Descubra MS
  const isDescubraMS = currentTenant === 'descubrams' || 
                       currentTenant === 'descubramatogrossodosul' || 
                       currentTenant === 'ms' ||
                       location.pathname.startsWith('/descubrams') ||
                       location.pathname.startsWith('/descubramatogrossodosul') ||
                       location.pathname.startsWith('/ms');
  const isTenantPath = isDescubraMS || (currentTenant && currentTenant.length === 2);
  
  console.log("🏛️ USERMENU: Tenant detectado:", currentTenant, "isTenantPath:", isTenantPath, "isDescubraMS:", isDescubraMS);

  if (!user) return null;

  const getUserInitials = () => {
    const name = user.user_metadata?.full_name || user.email;
    return name.charAt(0).toUpperCase();
  };

  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'admin': return 'Administrador';
      case 'tech': return 'Técnico';
      case 'gestor': return 'Gestor';
      case 'municipal_manager': return 'Gestor Municipal';
      case 'atendente': return 'Atendente';
      default: return 'Usuário';
    }
  };

  const getDashboardRoute = () => {
    switch (userRole) {
      case 'admin':
      case 'tech':
        return '/technical-admin';
      case 'gestor':
      case 'municipal_manager':
        return '/municipal-admin';
      case 'atendente':
        return '/cat-attendant';
      default:
        return '/profile';
    }
  };
  
  const getPathWithTenant = (path: string) => {
    if (isDescubraMS) {
      return `/descubrams${path}`;
    }
    return isTenantPath ? `/${currentTenant}${path}` : path;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl || user.user_metadata?.avatar_url} alt="Avatar" />
            <AvatarFallback className="bg-ms-primary-blue text-white font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg" 
        align="end" 
        forceMount
        sideOffset={5}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
              {user.user_metadata?.full_name || user.email}
            </p>
            <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
            {userRole && (
              <p className="text-xs text-ms-primary-blue font-medium">
                {getRoleDisplayName()}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        
        <DropdownMenuItem asChild className="hover:bg-gray-100 dark:hover:bg-gray-700">
          <Link to={getPathWithTenant("/profile")} className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </Link>
        </DropdownMenuItem>

        {/* Dashboard e Admin Técnico apenas para ViaJAR, não para Descubra MS */}
        {!isDescubraMS && isManager && (
          <DropdownMenuItem asChild className="hover:bg-gray-100 dark:hover:bg-gray-700">
            <Link to={getPathWithTenant(getDashboardRoute())} className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}

        {!isDescubraMS && isAdmin && (
          <DropdownMenuItem asChild className="hover:bg-gray-100 dark:hover:bg-gray-700">
            <Link to={getPathWithTenant("/technical-admin")} className="flex items-center">
              <Shield className="mr-2 h-4 w-4 text-red-500" />
              <span>Admin Técnico</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        
        <DropdownMenuItem 
          onClick={handleSecureLogout}
          className="hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
