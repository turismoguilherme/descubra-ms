
import React, { useState, useEffect } from "react";
import { TouristRoute, RouteCreateData } from "@/types/passport";
import RouteFormHeader from "./route-form/RouteFormHeader";
import RouteBasicInfo from "./route-form/RouteBasicInfo";
import CheckpointManager from "./route-form/CheckpointManager";
import RouteFormActions from "./route-form/RouteFormActions";

interface RouteFormProps {
  route?: TouristRoute | null;
  userRegion?: string;
  onSave: (route: RouteCreateData) => void;
  onCancel: () => void;
}

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

const RouteForm = ({ route, userRegion, onSave, onCancel }: RouteFormProps) => {
  const [formData, setFormData] = useState({
    name: route?.name || "",
    description: route?.description || "",
    region: route?.region || userRegion || "",
    difficulty_level: route?.difficulty_level || "facil" as "facil" | "medio" | "dificil",
    estimated_duration: route?.estimated_duration || 60,
    promotional_text: route?.promotional_text || "",
    video_url: route?.video_url || "",
    is_active: route?.is_active ?? true,
  });

  const [checkpoints, setCheckpoints] = useState<CheckpointForm[]>([]);
  const [showAddCheckpoint, setShowAddCheckpoint] = useState(false);
  const [newCheckpoint, setNewCheckpoint] = useState<CheckpointForm>({
    name: "",
    description: "",
    latitude: 0,
    longitude: 0,
    order_index: 1,
    required_time_minutes: 15,
    promotional_text: "",
    validation_radius_meters: 100,
  });

  const regions = [
    "Pantanal",
    "Bonito/Serra da Bodoquena", 
    "Campo Grande e Região",
    "Corumbá",
    "Costa Leste",
    "Caminhos da Fronteira",
    "Grande Dourados",
    "Cerrado Pantanal",
    "Cone Sul"
  ];

  // Load existing checkpoints if editing
  useEffect(() => {
    if (route?.checkpoints) {
      const formCheckpoints = route.checkpoints.map(checkpoint => ({
        name: checkpoint.name,
        description: checkpoint.description || "",
        latitude: checkpoint.latitude,
        longitude: checkpoint.longitude,
        order_index: checkpoint.order_index,
        required_time_minutes: checkpoint.required_time_minutes || 15,
        promotional_text: checkpoint.promotional_text || "",
        validation_radius_meters: checkpoint.validation_radius_meters || 100,
      }));
      setCheckpoints(formCheckpoints);
    }
  }, [route]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddCheckpoint = () => {
    if (newCheckpoint.name && newCheckpoint.latitude && newCheckpoint.longitude) {
      setCheckpoints(prev => [...prev, { 
        ...newCheckpoint, 
        order_index: prev.length + 1 
      }]);
      setNewCheckpoint({
        name: "",
        description: "",
        latitude: 0,
        longitude: 0,
        order_index: 1,
        required_time_minutes: 15,
        promotional_text: "",
        validation_radius_meters: 100,
      });
      setShowAddCheckpoint(false);
    }
  };

  const handleRemoveCheckpoint = (index: number) => {
    setCheckpoints(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Transform CheckpointForm[] to CheckpointCreateData[]
    const transformedCheckpoints = checkpoints.map((checkpoint, index) => ({
      name: checkpoint.name,
      description: checkpoint.description,
      latitude: checkpoint.latitude,
      longitude: checkpoint.longitude,
      order_index: index + 1, // Ensure correct ordering
      required_time_minutes: checkpoint.required_time_minutes,
      promotional_text: checkpoint.promotional_text,
      validation_radius_meters: checkpoint.validation_radius_meters
    }));

    const routeData: RouteCreateData = {
      ...formData,
      checkpoints: transformedCheckpoints
    };
    onSave(routeData);
  };

  return (
    <div className="space-y-6">
      <RouteFormHeader route={route} onCancel={onCancel} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RouteBasicInfo 
          formData={formData}
          onInputChange={handleInputChange}
          regions={regions}
        />

        <CheckpointManager
          checkpoints={checkpoints}
          showAddCheckpoint={showAddCheckpoint}
          newCheckpoint={newCheckpoint}
          onSetShowAddCheckpoint={setShowAddCheckpoint}
          onSetNewCheckpoint={setNewCheckpoint}
          onAddCheckpoint={handleAddCheckpoint}
          onRemoveCheckpoint={handleRemoveCheckpoint}
        />
      </div>

      <RouteFormActions 
        route={route}
        onCancel={onCancel}
        onSave={handleSave}
      />
    </div>
  );
};

export default RouteForm;
