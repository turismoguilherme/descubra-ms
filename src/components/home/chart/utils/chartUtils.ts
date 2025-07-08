
// Função para obter cor baseada na densidade usando cores mais vibrantes
export const getDensityColor = (density: number) => {
  if (density > 0.7) return '#228B22'; // Verde vibrante - Alta densidade
  if (density > 0.4) return '#FF6347'; // Laranja/vermelho coral - Média densidade
  return '#DC143C'; // Vermelho intenso - Baixa densidade
};

// Função para obter emoji baseado na densidade
export const getDensityEmoji = (density: number) => {
  if (density > 0.7) return '🟢';
  if (density > 0.4) return '🟡';
  return '🔴';
};
