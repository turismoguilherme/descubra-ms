
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Collaborator, roles } from "@/types/collaborator";

interface CollaboratorTableProps {
  collaborators: Collaborator[];
  loading: boolean;
  onEdit: (collaborator: Collaborator) => void;
  onDelete: (id: string) => void;
}

const CollaboratorTable: React.FC<CollaboratorTableProps> = ({
  collaborators,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return <div className="text-center py-4">Carregando colaboradores...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Cargo</TableHead>
          <TableHead>Função</TableHead>
          <TableHead>Cidade</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {collaborators.map((collaborator) => (
          <TableRow key={collaborator.id}>
            <TableCell className="font-medium">{collaborator.name}</TableCell>
            <TableCell>{collaborator.email}</TableCell>
            <TableCell>{collaborator.position}</TableCell>
            <TableCell>
              <Badge variant="outline">
                {roles.find(r => r.value === collaborator.role)?.label}
              </Badge>
            </TableCell>
            <TableCell>{collaborator.municipality}</TableCell>
            <TableCell>
            <Badge variant={collaborator.status === 'active' ? "default" : "secondary"}>
              {collaborator.status === 'active' ? "Ativo" : "Inativo"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(collaborator)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(collaborator.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CollaboratorTable;
