
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import CollaboratorFilters from "./collaborator/CollaboratorFilters";
import CollaboratorTable from "./collaborator/CollaboratorTable";
import CollaboratorForm from "./collaborator/CollaboratorForm";
import { useCollaborators } from "./collaborator/useCollaborators";

interface CollaboratorManagerProps {
  cityId: string;
}

const CollaboratorManager = ({ cityId }: CollaboratorManagerProps) => {
  const {
    collaborators,
    loading,
    searchTerm,
    setSearchTerm,
    // filterCity e setFilterCity removidos pois não estão no hook
    filterRole,
    setFilterRole,
    isDialogOpen,
    setIsDialogOpen,
    editingCollaborator,
    formData,
    setFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
  } = useCollaborators(cityId); // Passa o cityId para o hook

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestão de Colaboradores</CardTitle>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Colaborador
          </Button>
        </CardHeader>
        <CardContent>
          <CollaboratorFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCity=""
            setFilterCity={() => {}}
            filterRole={filterRole}
            setFilterRole={setFilterRole}
          />
          <CollaboratorTable
            collaborators={collaborators}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <CollaboratorForm
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
        formData={formData}
        setFormData={setFormData}
        editingCollaborator={editingCollaborator}
        onSubmit={handleSubmit}
        onCancel={resetForm}
      />
    </div>
  );
};

export default CollaboratorManager;
