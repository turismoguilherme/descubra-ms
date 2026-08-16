
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Edit2, UserX, CheckCircle, Shield, MapPin, XCircle } from "lucide-react";
import { UserData } from "./types";

interface UserTableProps {
  loading: boolean;
  users: UserData[];
  openEditUserDialog: (user: UserData) => void;
  toggleUserStatus: (userId: string) => void;
}

const UserTable = ({ loading, users, openEditUserDialog, toggleUserStatus }: UserTableProps) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Região</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">
                <div className="flex justify-center items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando usuários...
                </div>
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                Nenhum usuário encontrado
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {user.role === "admin" ? (
                      <Shield className="h-4 w-4 mr-1 text-red-500" />
                    ) : user.role === "tech" ? (
                      <Shield className="h-4 w-4 mr-1 text-purple-500" />
                    ) : user.role === "gestor" ? (
                      <svg className="h-4 w-4 mr-1 text-blue-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="5" />
                        <path d="M20 21a8 8 0 0 0-16 0" />
                      </svg>
                    ) : user.role === "municipal_manager" || user.role === "municipal" ? (
                      <svg className="h-4 w-4 mr-1 text-green-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    ) : user.role === "atendente" ? (
                      <svg className="h-4 w-4 mr-1 text-orange-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 12l2 2 4-4" />
                        <path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z" />
                        <path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z" />
                        <path d="M12 21c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z" />
                        <path d="M12 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 mr-1 text-gray-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                    <span className="capitalize">
                      {user.role === "admin" ? "Administrador" :
                       user.role === "tech" ? "Técnico" :
                       user.role === "gestor" ? "Gestor Regional" : 
                       user.role === "municipal_manager" ? "Gerente Municipal" :
                       user.role === "municipal" ? "Gestor Municipal" :
                       user.role === "atendente" ? "Atendente CAT" : "Usuário Comum"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {user.region === "all" ? (
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-1 text-blue-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                          <path d="M2 12h20" />
                        </svg>
                        <span className="text-blue-600 font-medium">Todas as Regiões</span>
                      </div>
                    ) : user.region ? (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-ms-primary-blue" />
                        <span>{user.region}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {user.status === "active" ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" /> Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <XCircle className="mr-1 h-3 w-3" /> Inativo
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditUserDialog(user)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleUserStatus(user.id)}
                    >
                      {user.status === "active" ? (
                        <UserX className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
