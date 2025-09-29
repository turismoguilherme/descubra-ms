
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, MapPin, ArrowUp, ArrowDown, Edit } from "lucide-react";
import { Checkpoint } from "@/services/routes/tourismRouteService"; // Importar a interface Checkpoint

interface CheckpointManagerProps {
  checkpoints: Checkpoint[];
  setCheckpoints: React.Dispatch<React.SetStateAction<Checkpoint[]>>;
  routeId: string; // ID da rota pai
}

const CheckpointManager = ({
  checkpoints,
  setCheckpoints,
  routeId,
}: CheckpointManagerProps) => {
  const [editingCheckpoint, setEditingCheckpoint] = useState<Checkpoint | null>(null);
  const [newCheckpointData, setNewCheckpointData] = useState<Partial<Checkpoint>>({
    name: "",
    description: "",
    latitude: 0,
    longitude: 0,
    stamp_image_url: "",
    reward_id: null,
    order: checkpoints.length > 0 ? Math.max(...checkpoints.map(cp => cp.order)) + 1 : 1,
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    // Atualizar a ordem do novo checkpoint quando a lista de checkpoints muda
    setNewCheckpointData(prev => ({
      ...prev,
      order: checkpoints.length > 0 ? Math.max(...checkpoints.map(cp => cp.order)) + 1 : 1,
    }));
  }, [checkpoints]);

  const handleAddCheckpoint = () => {
    if (!newCheckpointData.name || !newCheckpointData.latitude || !newCheckpointData.longitude) {
      alert("Nome, Latitude e Longitude são obrigatórios para o checkpoint.");
      return;
    }

    const newCheckpoint: Checkpoint = {
      ...newCheckpointData as Checkpoint,
      id: `temp-${Date.now()}`, // ID temporário para novos, será substituído no backend
      route_id: routeId, // Associa ao ID da rota pai
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: "", // Será preenchido no serviço
      updated_by: "", // Será preenchido no serviço
    };
    setCheckpoints((prev) => [...prev, newCheckpoint]);
    setNewCheckpointData({
      name: "",
      description: "",
      latitude: 0,
      longitude: 0,
      stamp_image_url: "",
      reward_id: null,
      order: checkpoints.length + 2, // Próximo na ordem
    });
    setIsAdding(false);
  };

  const handleUpdateCheckpoint = () => {
    if (editingCheckpoint) {
      if (!editingCheckpoint.name || !editingCheckpoint.latitude || !editingCheckpoint.longitude) {
        alert("Nome, Latitude e Longitude são obrigatórios para o checkpoint.");
        return;
      }
      setCheckpoints((prev) =>
        prev.map((cp) => (cp.id === editingCheckpoint.id ? editingCheckpoint : cp))
      );
      setEditingCheckpoint(null);
    }
  };

  const handleRemoveCheckpoint = (idToRemove: string) => {
    setCheckpoints((prev) => prev.filter((cp) => cp.id !== idToRemove));
  };

  const handleMoveCheckpoint = (index: number, direction: 'up' | 'down') => {
    const newCheckpoints = [...checkpoints];
    if (direction === 'up' && index > 0) {
      [newCheckpoints[index - 1], newCheckpoints[index]] = [newCheckpoints[index], newCheckpoints[index - 1]];
    } else if (direction === 'down' && index < newCheckpoints.length - 1) {
      [newCheckpoints[index + 1], newCheckpoints[index]] = [newCheckpoints[index], newCheckpoints[index + 1]];
    }
    // Reordenar o campo 'order' após a movimentação
    const reordered = newCheckpoints.map((cp, i) => ({ ...cp, order: i + 1 }));
    setCheckpoints(reordered);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Checkpoints do Roteiro
          <Button
            size="sm"
            onClick={() => { setIsAdding(true); setEditingCheckpoint(null); }}
            className="flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Adicionar Checkpoint
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {checkpoints.length === 0 && !isAdding && (
          <p className="text-gray-600">Nenhum checkpoint adicionado ainda. Clique em "Adicionar Checkpoint" para começar.</p>
        )}

        {checkpoints.map((checkpoint, index) => (
          <div key={checkpoint.id} className="border rounded p-3 space-y-2 relative">
            <div className="absolute top-2 right-2 flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => setEditingCheckpoint(checkpoint)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleRemoveCheckpoint(checkpoint.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-10">
                <h4 className="font-medium">{`#${checkpoint.order} ${checkpoint.name}`}</h4>
                <p className="text-sm text-gray-600">{checkpoint.description}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Button size="sm" variant="ghost" onClick={() => handleMoveCheckpoint(index, 'up')} disabled={index === 0}>
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleMoveCheckpoint(index, 'down')} disabled={index === checkpoints.length - 1}>
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2 text-xs text-gray-500 mt-2">
              <Badge variant="outline">
                <MapPin className="w-3 h-3 mr-1" />
                Lat: {checkpoint.latitude.toFixed(4)}, Lng: {checkpoint.longitude.toFixed(4)}
              </Badge>
              {checkpoint.stamp_image_url && (
                <Badge variant="outline">
                  Carimbo: {checkpoint.stamp_image_url.substring(checkpoint.stamp_image_url.lastIndexOf('/') + 1)}
                </Badge>
              )}
              {checkpoint.reward_id && (
                <Badge variant="outline">
                  Recompensa: {checkpoint.reward_id.substring(0, 8)}...
                </Badge>
              )}
            </div>
          </div>
        ))}

        {(isAdding || editingCheckpoint) && (
          <Card className="border-dashed">
            <CardContent className="p-3 space-y-3">
              <h4 className="font-medium mb-2">{editingCheckpoint ? "Editar Checkpoint" : "Novo Checkpoint"}</h4>
              <div>
                <Label htmlFor="checkpointName">Nome do Checkpoint</Label>
                <Input
                  id="checkpointName"
                  placeholder="Nome do ponto"
                  value={editingCheckpoint?.name || newCheckpointData.name}
                  onChange={(e) =>
                    editingCheckpoint
                      ? setEditingCheckpoint({ ...editingCheckpoint, name: e.target.value })
                      : setNewCheckpointData({ ...newCheckpointData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="checkpointDescription">Descrição</Label>
                <Textarea
                  id="checkpointDescription"
                  placeholder="Descrição do checkpoint"
                  value={editingCheckpoint?.description || newCheckpointData.description || ""}
                  onChange={(e) =>
                    editingCheckpoint
                      ? setEditingCheckpoint({ ...editingCheckpoint, description: e.target.value })
                      : setNewCheckpointData({ ...newCheckpointData, description: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="checkpointLatitude">Latitude</Label>
                  <Input
                    id="checkpointLatitude"
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={editingCheckpoint?.latitude || newCheckpointData.latitude || ""}
                    onChange={(e) =>
                      editingCheckpoint
                        ? setEditingCheckpoint({ ...editingCheckpoint, latitude: parseFloat(e.target.value) || 0 })
                        : setNewCheckpointData({ ...newCheckpointData, latitude: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="checkpointLongitude">Longitude</Label>
                  <Input
                    id="checkpointLongitude"
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={editingCheckpoint?.longitude || newCheckpointData.longitude || ""}
                    onChange={(e) =>
                      editingCheckpoint
                        ? setEditingCheckpoint({ ...editingCheckpoint, longitude: parseFloat(e.target.value) || 0 })
                        : setNewCheckpointData({ ...newCheckpointData, longitude: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="stampImageUrl">URL da Imagem do Carimbo</Label>
                <Input
                  id="stampImageUrl"
                  placeholder="URL da imagem do carimbo (animal do Pantanal)"
                  value={editingCheckpoint?.stamp_image_url || newCheckpointData.stamp_image_url || ""}
                  onChange={(e) =>
                    editingCheckpoint
                      ? setEditingCheckpoint({ ...editingCheckpoint, stamp_image_url: e.target.value })
                      : setNewCheckpointData({ ...newCheckpointData, stamp_image_url: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="rewardId">ID da Recompensa (opcional)</Label>
                <Input
                  id="rewardId"
                  placeholder="UUID da recompensa (opcional)"
                  value={editingCheckpoint?.reward_id || newCheckpointData.reward_id || ""}
                  onChange={(e) =>
                    editingCheckpoint
                      ? setEditingCheckpoint({ ...editingCheckpoint, reward_id: e.target.value || null })
                      : setNewCheckpointData({ ...newCheckpointData, reward_id: e.target.value || null })
                  }
                />
                <p className="text-sm text-gray-500 mt-1">Seria um dropdown com recompensas existentes, por enquanto use o ID.</p>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={editingCheckpoint ? handleUpdateCheckpoint : handleAddCheckpoint}>
                  {editingCheckpoint ? "Atualizar Checkpoint" : "Adicionar Checkpoint"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setEditingCheckpoint(null); setIsAdding(false); }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default CheckpointManager;
