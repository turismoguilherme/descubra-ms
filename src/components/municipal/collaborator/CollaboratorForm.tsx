
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CollaboratorFormData, Collaborator, roles, cities } from "@/types/collaborator";

interface CollaboratorFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CollaboratorFormData;
  setFormData: (data: CollaboratorFormData) => void;
  editingCollaborator: Collaborator | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const CollaboratorForm: React.FC<CollaboratorFormProps> = ({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  editingCollaborator,
  onSubmit,
  onCancel,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingCollaborator ? 'Editar Colaborador' : 'Adicionar Colaborador'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="position">Cargo</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="role">Função</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma função" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="municipality">Município</Label>
            <Select value={formData.municipality} onValueChange={(value) => setFormData({ ...formData, municipality: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um município" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {editingCollaborator ? 'Atualizar' : 'Adicionar'} Colaborador
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CollaboratorForm;
