/**
 * Utilitários para formatação de telefone
 */

/**
 * Remove todos os caracteres não numéricos do telefone
 * @param phone - Telefone com ou sem formatação
 * @returns Telefone apenas com números
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Formata telefone para envio à API (+5516993491807)
 * @param phone - Telefone com ou sem formatação
 * @returns Telefone no formato +5516993491807
 */
export function formatPhoneForApi(phone: string): string {
  const cleaned = cleanPhone(phone);
  
  // Se já tem código do país, mantém
  if (cleaned.startsWith('55') && cleaned.length >= 12) {
    return `+${cleaned}`;
  }
  
  // Se não tem código do país, adiciona +55
  if (cleaned.length >= 10) {
    return `+55${cleaned}`;
  }
  
  // Se o telefone está incompleto, retorna como está
  return phone;
}

/**
 * Formata telefone para exibição ao usuário (+55 (16) 99349-1807)
 * @param phone - Telefone com ou sem formatação
 * @returns Telefone no formato +55 (16) 99349-1807
 */
export function formatPhoneForDisplay(phone: string): string {
  const cleaned = cleanPhone(phone);
  
  // Se não tem números suficientes, retorna como está
  if (cleaned.length < 10) {
    return phone;
  }
  
  let phoneToFormat = cleaned;
  
  // Remove o código do país se presente para reformatar
  if (phoneToFormat.startsWith('55') && phoneToFormat.length >= 12) {
    phoneToFormat = phoneToFormat.substring(2);
  }
  
  // Formatar telefone brasileiro (11 dígitos com 9 na frente)
  if (phoneToFormat.length === 11) {
    const ddd = phoneToFormat.substring(0, 2);
    const firstPart = phoneToFormat.substring(2, 7);
    const secondPart = phoneToFormat.substring(7, 11);
    return `+55 (${ddd}) ${firstPart}-${secondPart}`;
  }
  
  // Formatar telefone brasileiro (10 dígitos sem 9 na frente)
  if (phoneToFormat.length === 10) {
    const ddd = phoneToFormat.substring(0, 2);
    const firstPart = phoneToFormat.substring(2, 6);
    const secondPart = phoneToFormat.substring(6, 10);
    return `+55 (${ddd}) ${firstPart}-${secondPart}`;
  }
  
  // Se não conseguiu formatar, retorna o original
  return phone;
}

/**
 * Aplica máscara de telefone em tempo real durante digitação
 * @param value - Valor atual do input
 * @returns Valor formatado para exibição
 */
export function applyPhoneMask(value: string): string {
  const cleaned = cleanPhone(value);
  
  // Limita a 13 dígitos (55 + 11 dígitos do telefone)
  const limited = cleaned.substring(0, 13);
  
  if (limited.length === 0) return '';
  
  // Aplica a máscara progressivamente
  if (limited.length <= 2) {
    return `+${limited}`;
  } else if (limited.length <= 4) {
    return `+${limited.substring(0, 2)} (${limited.substring(2)}`;
  } else if (limited.length <= 9) {
    return `+${limited.substring(0, 2)} (${limited.substring(2, 4)}) ${limited.substring(4)}`;
  } else if (limited.length <= 13) {
    const ddd = limited.substring(2, 4);
    const firstPart = limited.substring(4, 9);
    const secondPart = limited.substring(9);
    return `+${limited.substring(0, 2)} (${ddd}) ${firstPart}${secondPart ? '-' + secondPart : ''}`;
  }
  
  return formatPhoneForDisplay(limited);
}

/**
 * Valida se o telefone está no formato correto
 * @param phone - Telefone para validar
 * @returns true se válido, false caso contrário
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = cleanPhone(phone);
  
  // Deve ter pelo menos 10 dígitos (DDD + número)
  if (cleaned.length < 10) return false;
  
  // Se tem código do país, deve ter 12 ou 13 dígitos
  if (cleaned.startsWith('55')) {
    return cleaned.length === 12 || cleaned.length === 13;
  }
  
  // Sem código do país, deve ter 10 ou 11 dígitos
  return cleaned.length === 10 || cleaned.length === 11;
}