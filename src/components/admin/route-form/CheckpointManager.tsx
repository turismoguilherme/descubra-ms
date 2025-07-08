
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, MapPin } from "lucide-react";

interface CheckpointForm {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  order_index: number;
  required_time_minutes: number;
  promotional_text: string;
  validation_radius_meters: number;
}

interface CheckpointManagerProps {
  checkpoints: CheckpointForm[];
  showAddCheckpoint: boolean;
  newCheckpoint: CheckpointForm;
  onSetShowAddCheckpoint: (show: boolean) => void;
  onSetNewCheckpoint: (checkpoint: CheckpointForm) => void;
  onAddCheckpoint: () => void;
  onRemoveCheckpoint: (index: number) => void;
}

const CheckpointManager = ({
  checkpoints,
  showAddCheckpoint,
  newCheckpoint,
  onSetShowAddCheckpoint,
  onSetNewCheckpoint,
  onAddCheckpoint,
  onRemoveCheckpoint
}: CheckpointManagerProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Pontos do Roteiro
          <Button 
            size="sm" 
            onClick={() => onSetShowAddCheckpoint(true)}
            className="flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Adicionar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {checkpoints.map((checkpoint, index) => (
          <div key={index} className="border rounded p-3 space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium">{checkpoint.name}</h4>
                <p className="text-sm text-gray-600">{checkpoint.description}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRemoveCheckpoint(index)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex gap-2 text-xs text-gray-500">
              <Badge variant="outline">
                <MapPin className="w-3 h-3 mr-1" />
                {checkpoint.latitude.toFixed(4)}, {checkpoint.longitude.toFixed(4)}
              </Badge>
              <Badge variant="outline">
                {checkpoint.required_time_minutes}min
              </Badge>
            </div>
          </div>
        ))}

        {showAddCheckpoint && (
          <Card className="border-dashed">
            <CardContent className="p-3 space-y-3">
              <Input
                placeholder="Nome do ponto"
                value={newCheckpoint.name}
                onChange={(e) => onSetNewCheckpoint({ ...newCheckpoint, name: e.target.value })}
              />
              <Textarea
                placeholder="Descrição"
                value={newCheckpoint.description}
                onChange={(e) => onSetNewCheckpoint({ ...newCheckpoint, description: e.target.value })}
                rows={2}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  step="0.000001"
                  placeholder="Latitude"
                  value={newCheckpoint.latitude || ""}
                  onChange={(e) => onSetNewCheckpoint({ ...newCheckpoint, latitude: parseFloat(e.target.value) })}
                />
                <Input
                  type="number"
                  step="0.000001"
                  placeholder="Longitude"
                  value={newCheckpoint.longitude || ""}
                  onChange={(e) => onSetNewCheckpoint({ ...newCheckpoint, longitude: parseFloat(e.target.value) })}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={onAddCheckpoint}>
                  Adicionar
                </Button>
                <Button size="sm" variant="outline" onClick={() => onSetShowAddCheckpoint(false)}>
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
