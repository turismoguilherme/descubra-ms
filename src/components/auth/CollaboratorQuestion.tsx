
import React from "react";

interface CollaboratorQuestionProps {
  isCollaborator: boolean | null;
  setIsCollaborator: (val: boolean) => void;
  error: boolean;
  setError: (val: boolean) => void;
}

const CollaboratorQuestion: React.FC<CollaboratorQuestionProps> = ({
  isCollaborator,
  setIsCollaborator,
  error,
  setError
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">Você é colaborador da Secretaria?</label>
    <div className="flex gap-4 mt-1">
      <button
        type="button"
        className={`px-4 py-2 rounded border transition-colors ${isCollaborator === true ? "bg-ms-pantanal-green text-white border-ms-pantanal-green" : "bg-white text-gray-900 border-gray-300"} ${error && isCollaborator !== true ? "ring-2 ring-red-500" : ""}`}
        onClick={() => { setIsCollaborator(true); setError(false); }}
      >
        Sim
      </button>
      <button
        type="button"
        className={`px-4 py-2 rounded border transition-colors ${isCollaborator === false ? "bg-ms-pantanal-green text-white border-ms-pantanal-green" : "bg-white text-gray-900 border-gray-300"} ${error && isCollaborator !== false ? "ring-2 ring-red-500" : ""}`}
        onClick={() => { setIsCollaborator(false); setError(false); }}
      >
        Não
      </button>
    </div>
    {error && (
      <span className="text-red-600 text-xs">É obrigatório selecionar uma opção.</span>
    )}
  </div>
);

export default CollaboratorQuestion;
