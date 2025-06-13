/**
 * Utilitários para manipulação de datas no sistema
 * Formato padrão: dd/mm/yyyy para exibição e yyyy-mm-dd para armazenamento
 */

/**
 * Converte uma data do formato yyyy-mm-dd (banco) para dd/mm/yyyy (exibição)
 */
export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return '';
  
  // Se já está no formato dd/mm/yyyy, retorna como está
  if (dateString.includes('/')) {
    return dateString;
  }
  
  // Converte de yyyy-mm-dd para dd/mm/yyyy
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Converte uma data do formato dd/mm/yyyy (exibição) para yyyy-mm-dd (banco)
 */
export function formatDateForStorage(dateString: string): string {
  if (!dateString) return '';
  
  // Se já está no formato yyyy-mm-dd, retorna como está
  if (dateString.includes('-') && dateString.length === 10) {
    return dateString;
  }
  
  // Converte de dd/mm/yyyy para yyyy-mm-dd
  const [day, month, year] = dateString.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Obtém a data atual no formato yyyy-mm-dd (para inputs type="date")
 * Agora considera o timezone configurado
 */
export function getCurrentDateForInput(timezoneOffset?: number): string {
  const now = new Date();
  
  // Se um offset de timezone foi fornecido, ajusta a data
  if (timezoneOffset !== undefined) {
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const adjustedDate = new Date(utc + (timezoneOffset * 3600000));
    const year = adjustedDate.getFullYear();
    const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
    const day = String(adjustedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Comportamento padrão (mantém compatibilidade)
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtém a data atual no formato dd/mm/yyyy (para exibição)
 */
export function getCurrentDateForDisplay(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
}

/**
 * Obtém a data atual de conclusão no timezone do usuário (formato yyyy-mm-dd)
 * Para ser usado quando uma tarefa é marcada como concluída
 */
export function getCurrentCompletionDate(timezoneOffset?: number): string {
  return getCurrentDateForInput(timezoneOffset);
}

/**
 * Converte uma data do input HTML (yyyy-mm-dd) para o formato de exibição (dd/mm/yyyy)
 */
export function convertInputDateToDisplay(inputDate: string): string {
  if (!inputDate) return '';
  return formatDateForDisplay(inputDate);
}

/**
 * Converte uma data de exibição (dd/mm/yyyy) para o formato do input HTML (yyyy-mm-dd)
 */
export function convertDisplayDateToInput(displayDate: string): string {
  if (!displayDate) return '';
  return formatDateForStorage(displayDate);
}

/**
 * Valida se uma string é uma data válida no formato dd/mm/yyyy
 */
export function isValidDisplayDate(dateString: string): boolean {
  if (!dateString) return false;
  
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(regex);
  
  if (!match) return false;
  
  const [, day, month, year] = match;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  return date.getFullYear() === parseInt(year) &&
         date.getMonth() === parseInt(month) - 1 &&
         date.getDate() === parseInt(day);
}

/**
 * Valida se uma string é uma data válida no formato yyyy-mm-dd
 */
export function isValidStorageDate(dateString: string): boolean {
  if (!dateString) return false;
  
  const regex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = dateString.match(regex);
  
  if (!match) return false;
  
  const [, year, month, day] = match;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  return date.getFullYear() === parseInt(year) &&
         date.getMonth() === parseInt(month) - 1 &&
         date.getDate() === parseInt(day);
}

/**
 * Converte uma data JavaScript para o formato yyyy-mm-dd sem problemas de timezone
 */
export function dateToInputFormat(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converte uma data JavaScript para o formato dd/mm/yyyy
 */
export function dateToDisplayFormat(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
}

/**
 * Obtém a data SLA padrão (24 horas a partir de agora) no formato yyyy-mm-dd
 * Agora considera o timezone configurado
 */
export function getDefaultSLADate(timezoneOffset?: number): string {
  const now = new Date();
  
  // Se um offset de timezone foi fornecido, ajusta a data
  if (timezoneOffset !== undefined) {
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const adjustedNow = new Date(utc + (timezoneOffset * 3600000));
    const slaDate = new Date(adjustedNow.getTime() + (24 * 60 * 60 * 1000)); // Adiciona 24 horas
    return dateToInputFormat(slaDate);
  }
  
  // Comportamento padrão (mantém compatibilidade)
  const slaDate = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // Adiciona 24 horas
  return dateToInputFormat(slaDate);
} 