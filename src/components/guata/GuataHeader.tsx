interface GuataHeaderProps {
  onClearConversation: () => void;
  mensagens: any[];
}

const GuataHeader: React.FC<GuataHeaderProps> = ({ onClearConversation, mensagens }) => {
  // Botão "Limpar Conversa" removido conforme solicitado
  return null;
};

export default GuataHeader;
