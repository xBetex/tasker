import { formatDateForDisplay } from '@/utils/dateUtils';

interface DateDisplayProps {
  date: string;
  className?: string;
}

/**
 * Componente para exibir datas no formato brasileiro (dd/mm/yyyy)
 * Converte automaticamente datas do formato de armazenamento (yyyy-mm-dd) para exibição
 */
export default function DateDisplay({ date, className = '' }: DateDisplayProps) {
  const formattedDate = formatDateForDisplay(date);
  
  return (
    <span className={className}>
      {formattedDate}
    </span>
  );
} 