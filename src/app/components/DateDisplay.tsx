import { formatDateForDisplay } from '@/utils/dateUtils';
import { useTimezone } from '../contexts/TimezoneContext';

interface DateDisplayProps {
  date: string;
  className?: string;
  showTime?: boolean;
  showSeconds?: boolean;
  fullTimestamp?: boolean;
}

/**
 * Componente para exibir datas no formato brasileiro (dd/mm/yyyy)
 * Converte automaticamente datas do formato de armazenamento (yyyy-mm-dd) para exibição
 * Se showTime for true, também exibe horário
 * Se showSeconds for true, inclui segundos no horário
 * Se fullTimestamp for true, mostra timestamp completo para comentários
 * Agora suporta timezone configurável
 */
export default function DateDisplay({ 
  date, 
  className = '', 
  showTime = false, 
  showSeconds = false,
  fullTimestamp = false 
}: DateDisplayProps) {
  const { formatDateWithTimezone } = useTimezone();

  const formatDateTime = (dateString: string, includeTime: boolean, includeSeconds: boolean, isFullTimestamp: boolean) => {
    try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) {
        return dateString;
      }

      if (isFullTimestamp) {
        // For comments, show full timestamp with seconds
        return formatDateWithTimezone(dateObj, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
      } else if (includeTime) {
        const timeOptions: Intl.DateTimeFormatOptions = {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        };
        
        if (includeSeconds) {
          timeOptions.second = '2-digit';
        }
        
        return formatDateWithTimezone(dateObj, timeOptions);
      } else {
        return formatDateWithTimezone(dateObj);
      }
    } catch {
      return dateString;
    }
  };

  const formattedDate = formatDateTime(date, showTime, showSeconds, fullTimestamp);
  
  return (
    <span className={className} title={fullTimestamp ? `Created: ${formattedDate}` : formattedDate}>
      {formattedDate}
    </span>
  );
} 