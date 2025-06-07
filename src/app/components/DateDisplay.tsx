import { formatDateForDisplay } from '@/utils/dateUtils';

interface DateDisplayProps {
  date: string;
  className?: string;
  showTime?: boolean;
}

/**
 * Componente para exibir datas no formato brasileiro (dd/mm/yyyy)
 * Converte automaticamente datas do formato de armazenamento (yyyy-mm-dd) para exibição
 * Se showTime for true, também exibe horário
 */
export default function DateDisplay({ date, className = '', showTime = false }: DateDisplayProps) {
  const formatDateTime = (dateString: string, includeTime: boolean) => {
    try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) {
        return dateString;
      }

      if (includeTime) {
        return dateObj.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        return formatDateForDisplay(dateString);
      }
    } catch {
      return dateString;
    }
  };

  const formattedDate = formatDateTime(date, showTime);
  
  return (
    <span className={className}>
      {formattedDate}
    </span>
  );
} 