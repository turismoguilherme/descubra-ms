
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TourismData } from "@/types/tourism";
import { fetchTourismData, refreshTourismData } from "@/services/tourism";
import { toast } from "sonner";

export function useTourismData() {
  const queryClient = useQueryClient();
  
  // Main query to fetch tourism data
  const query = useQuery({
    queryKey: ["tourismData"],
    queryFn: () => fetchTourismData(),
    staleTime: 1000 * 60 * 15, // 15 minutes cache
    refetchOnWindowFocus: false,
  });
  
  // Mutation to trigger a data refresh
  const refreshMutation = useMutation({
    mutationFn: refreshTourismData,
    onMutate: () => {
      toast.loading("Atualizando dados do turismo...", {
        id: "refresh-tourism-data"
      });
    },
    onSuccess: async (success) => {
      if (success) {
        toast.success("Dados atualizados com sucesso!", {
          id: "refresh-tourism-data"
        });
        // Refetch data with the forceRefresh parameter
        await queryClient.invalidateQueries({ queryKey: ["tourismData"] });
      } else {
        toast.error("Não foi possível atualizar os dados.", {
          id: "refresh-tourism-data"
        });
      }
    },
    onError: (error) => {
      console.error("Error refreshing tourism data:", error);
      toast.error("Erro ao atualizar os dados do turismo.", {
        id: "refresh-tourism-data"
      });
    }
  });

  return {
    ...query,
    loading: query.isLoading,
    source: query.data?.source || 'mock',
    lastUpdate: query.data?.lastUpdate || new Date().toISOString(),
    refreshData: refreshMutation.mutate,
    isRefreshing: refreshMutation.isPending
  };
}
