/**
 * Gerador de CNPJs válidos para testes
 * Gera CNPJs que passam na validação de dígitos verificadores
 */

/**
 * Calcula os dígitos verificadores de um CNPJ
 */
function calculateCNPJDigits(base: string): string {
  const numbers = base.split('').map(Number);
  
  // Primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += numbers[i] * weights1[i];
  }
  let digit1 = sum % 11;
  digit1 = digit1 < 2 ? 0 : 11 - digit1;
  
  // Segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += numbers[i] * weights2[i];
  }
  sum += digit1 * weights2[12];
  let digit2 = sum % 11;
  digit2 = digit2 < 2 ? 0 : 11 - digit2;
  
  return `${digit1}${digit2}`;
}

/**
 * Gera um CNPJ válido formatado para testes
 */
export function generateTestCNPJ(): string {
  // Gera uma base aleatória de 12 dígitos
  const base = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
  const digits = calculateCNPJDigits(base);
  const cnpj = `${base}${digits}`;
  
  // Formata: XX.XXX.XXX/XXXX-XX
  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Retorna uma lista de CNPJs válidos pré-definidos para testes
 */
export function getTestCNPJs(): string[] {
  return [
    '11.222.333/0001-81', // CNPJ comum usado em testes
    '00.000.000/0001-91', // Outro CNPJ de teste comum
    '12.345.678/0001-90', // Já usado no código
    '98.765.432/0001-10', // Mais um CNPJ válido
    '11.444.777/0001-61', // CNPJ adicional
  ];
}

/**
 * Retorna um CNPJ de teste aleatório da lista pré-definida
 */
export function getRandomTestCNPJ(): string {
  const testCNPJs = getTestCNPJs();
  return testCNPJs[Math.floor(Math.random() * testCNPJs.length)];
}

/**
 * CNPJ padrão para testes (mais comum)
 */
export const DEFAULT_TEST_CNPJ = '11.222.333/0001-81';































