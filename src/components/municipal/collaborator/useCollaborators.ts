
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Collaborator, CollaboratorFormData } from "@/types/collaborator";

export const useCollaborators = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<CollaboratorFormData>({
    name: "",
    email: "",
    position: "",
    role: "",
    municipality: "",
  });

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const fetchCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('municipal_collaborators')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar colaboradores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.position || !formData.role || !formData.municipality) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const collaboratorData = {
        ...formData,
        manager_id: user.id,
      };

      if (editingCollaborator) {
        const { error } = await supabase
          .from('municipal_collaborators')
          .update(collaboratorData)
          .eq('id', editingCollaborator.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Colaborador atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('municipal_collaborators')
          .insert([collaboratorData]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Colaborador adicionado com sucesso",
        });
      }

      resetForm();
      fetchCollaborators();
    } catch (error) {
      console.error('Error saving collaborator:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar colaborador",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (collaborator: Collaborator) => {
    setEditingCollaborator(collaborator);
    setFormData({
      name: collaborator.name,
      email: collaborator.email,
      position: collaborator.position,
      role: collaborator.role,
      municipality: collaborator.municipality,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este colaborador?')) return;

    try {
      const { error } = await supabase
        .from('municipal_collaborators')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Colaborador excluído com sucesso",
      });
      fetchCollaborators();
    } catch (error) {
      console.error('Error deleting collaborator:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir colaborador",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", position: "", role: "", municipality: "" });
    setEditingCollaborator(null);
    setIsDialogOpen(false);
  };

  const filteredCollaborators = collaborators.filter(collaborator => {
    const matchesSearch = collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collaborator.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !filterCity || collaborator.municipality === filterCity;
    const matchesRole = !filterRole || collaborator.role === filterRole;
    
    return matchesSearch && matchesCity && matchesRole;
  });

  return {
    collaborators: filteredCollaborators,
    loading,
    searchTerm,
    setSearchTerm,
    filterCity,
    setFilterCity,
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
  };
};
