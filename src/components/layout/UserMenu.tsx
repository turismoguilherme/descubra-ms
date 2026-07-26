import React from "react";
import { Link, useLocation } from "react-router-dom";
import { User, LogOut, Shield, BarChart3, ChevronRight } from "lucide-react";
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
import { useBrand } from "@/context/BrandContext";

const UserMenu = () => {
  const { isMS: isMsBrand } = useBrand();

  let auth = null;
  try {
    auth = useAuth();
  } catch (error) {
    console.error("UserMenu: AuthProvider não disponível:", error);
    return null;
  }

  const { user } = auth;
  const { userRole, isManager, isAdmin, handleSecureLogout } = useSecureAuth();
  const location = useLocation();
  const { avatarUrl } = useUserAvatar();

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const currentTenant = pathSegments[0];

  const isDescubraMS =
    currentTenant === "descubrams" ||
    currentTenant === "descubramatogrossodosul" ||
    currentTenant === "ms" ||
    location.pathname.startsWith("/descubrams") ||
    location.pathname.startsWith("/descubramatogrossodosul") ||
    location.pathname.startsWith("/ms");
  const isTenantPath = isDescubraMS || (currentTenant && currentTenant.length === 2);

  /** URL /partner/... não começa com /descubrams; isMsBrand garante prefixo MS no deploy Descubra MS. */
  const useDescubramsPrefix = isDescubraMS || isMsBrand;

  if (!user) return null;

  const getUserInitials = () => {
    const name = user.user_metadata?.full_name || user.email || "?";
    return name.charAt(0).toUpperCase();
  };

  const getRoleDisplayName = () => {
    switch (userRole) {
      case "admin":
        return "Administrador";
      case "tech":
        return "Técnico";
      case "gestor":
        return "Gestor";
      case "municipal_manager":
        return "Gestor Municipal";
      case "atendente":
        return "Atendente";
      default:
        return "Usuário";
    }
  };

  const getDashboardRoute = () => {
    switch (userRole) {
      case "admin":
      case "tech":
        return "/technical-admin";
      case "gestor":
      case "municipal_manager":
        return "/municipal-admin";
      case "atendente":
        return "/cat-attendant";
      default:
        return "/profile";
    }
  };

  const getPathWithTenant = (path: string) => {
    if (useDescubramsPrefix) {
      return `/descubrams${path}`;
    }
    return isTenantPath ? `/${currentTenant}${path}` : path;
  };

  const profilePath = getPathWithTenant("/profile");
  const displayName = user.user_metadata?.full_name || user.email || "Perfil";

  const avatar = (
    <Avatar className="h-8 w-8 shrink-0">
      <AvatarImage src={avatarUrl || user.user_metadata?.avatar_url} alt="Avatar" />
      <AvatarFallback className="bg-ms-primary-blue text-white font-medium">
        {getUserInitials()}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <>
      {/* Mobile / app: atalho claro para a tela Perfil (sem dropdown minúsculo) */}
      <Link
        to={profilePath}
        className="md:hidden inline-flex items-center gap-2.5 w-full rounded-xl border border-gray-200 bg-white px-2 py-2 text-gray-900 shadow-sm hover:bg-gray-50 transition-colors"
        aria-label="Abrir perfil"
      >
        {avatar}
        <span className="flex-1 min-w-0 text-left">
          <span className="block text-sm font-semibold truncate">Perfil</span>
          <span className="block text-[11px] text-gray-500 truncate">{displayName}</span>
        </span>
        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
      </Link>

      {/* Desktop: menu completo */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-8 w-8 rounded-full hidden md:inline-flex"
          >
            {avatar}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
          align="end"
          forceMount
          sideOffset={5}
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100 truncate">
                {displayName}
              </p>
              <p className="text-xs leading-none text-gray-500 dark:text-gray-400 truncate">
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
            <Link to={profilePath} className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </Link>
          </DropdownMenuItem>

          {!useDescubramsPrefix && isManager && (
            <DropdownMenuItem asChild className="hover:bg-gray-100 dark:hover:bg-gray-700">
              <Link to={getPathWithTenant(getDashboardRoute())} className="flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
          )}

          {!useDescubramsPrefix && isAdmin && (
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
    </>
  );
};

export default UserMenu;
