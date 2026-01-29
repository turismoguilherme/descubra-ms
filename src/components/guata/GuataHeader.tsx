interface GuataHeaderProps {
  onClearConversation: () => void;
  mensagens: unknown[];
}

const GuataHeader: React.FC<GuataHeaderProps> = ({ onClearConversation, mensagens }) => {
  // Botão "Limpar Conversa" removido conforme solicitado
  return null;
};

export default GuataHeader;
