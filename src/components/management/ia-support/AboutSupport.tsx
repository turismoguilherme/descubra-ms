
import React from 'react';

const AboutSupport = () => {
  return (
    <div className="mt-6">
      <h4 className="text-sm font-medium mb-2">Sobre a IA de Suporte</h4>
      <p className="text-sm text-gray-600 mb-3">
        Esta IA analisa dados de múltiplas fontes oficiais para fornecer informações precisas:
      </p>
      <ul className="text-sm text-gray-600 space-y-1">
        <li>• Dados atualizados de fontes oficiais e governamentais</li>
        <li>• Informações recentes sobre pontos turísticos e hospedagem</li>
        <li>• Detalhes sobre eventos e atividades culturais</li>
        <li>• Dicas de transporte e logística para turistas</li>
        <li>• Prioriza sempre os dados mais recentes disponíveis</li>
      </ul>
      <p className="text-xs text-gray-500 mt-3">
        Fontes adicionadas: Ministério do Turismo, Embratur, Visit Brasil, Visit MS, 
        UNWTO, WTTC, plataformas turísticas e sites oficiais das principais cidades de MS.
      </p>
    </div>
  );
};

export default AboutSupport;
