
import React from "react";
import { Link } from "react-router-dom";
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
import { useAuth } from "@/hooks/auth/AuthContext";
import { useSecureAuth } from "@/hooks/useSecureAuth";

const UserMenu = () => {
  const { user } = useAuth();
  const { userRole, isManager, isAdmin, handleSecureLogout } = useSecureAuth();

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} alt="Avatar" />
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
          <Link to="/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </Link>
        </DropdownMenuItem>

        {isManager && (
          <DropdownMenuItem asChild className="hover:bg-gray-100 dark:hover:bg-gray-700">
            <Link to={getDashboardRoute()} className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}

        {isAdmin && (
          <DropdownMenuItem asChild className="hover:bg-gray-100 dark:hover:bg-gray-700">
            <Link to="/technical-admin" className="flex items-center">
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
