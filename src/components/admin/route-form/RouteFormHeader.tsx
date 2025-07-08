
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TouristRoute } from "@/types/passport";

interface RouteFormHeaderProps {
  route?: TouristRoute | null;
  onCancel: () => void;
}

const RouteFormHeader = ({ route, onCancel }: RouteFormHeaderProps) => {
  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" onClick={onCancel} className="flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Button>
      <h2 className="text-2xl font-bold">
        {route ? "Editar Roteiro" : "Novo Roteiro"}
      </h2>
    </div>
  );
};

export default RouteFormHeader;
