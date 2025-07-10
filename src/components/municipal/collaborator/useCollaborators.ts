
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Collaborator, CollaboratorFormData } from "@/types/collaborator";

// O hook agora aceita cityId como um argumento obrigatório
export const useCollaborators = (cityId: string) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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

  const fetchCollaborators = useCallback(async () => {
    if (!cityId) return; // Não faz nada se não houver cityId

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('municipal_collaborators')
        .select('*')
        .eq('city_id', cityId) // Filtro principal pelo cityId
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
  }, [cityId, toast]); // Adiciona cityId e toast às dependências

  useEffect(() => {
    fetchCollaborators();
  }, [fetchCollaborators]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.position || !formData.role) {
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
        city_id: cityId, // Associa o novo colaborador ao cityId do gestor
      };
      delete collaboratorData.municipality;

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

  // A filtragem por cidade no cliente é removida
  const filteredCollaborators = collaborators.filter(collaborator => {
    const matchesSearch = collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collaborator.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || collaborator.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  return {
    collaborators: filteredCollaborators,
    loading,
    searchTerm,
    setSearchTerm,
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
