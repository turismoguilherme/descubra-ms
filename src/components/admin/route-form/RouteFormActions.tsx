
import React from "react";
import { Button } from "@/components/ui/button";
import { TouristRoute } from "@/types/passport";

interface RouteFormActionsProps {
  route?: TouristRoute | null;
  onCancel: () => void;
  onSave: () => void;
}

const RouteFormActions = ({ route, onCancel, onSave }: RouteFormActionsProps) => {
  return (
    <div className="flex justify-end gap-4">
      <Button variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button onClick={onSave}>
        {route ? "Atualizar Roteiro" : "Criar Roteiro"}
      </Button>
    </div>
  );
};

export default RouteFormActions;
