import { parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';

export const formatDate = (date?: string) => {
  if (!date) return '';

  const parsedDate = parseISO(date);

  return format(parsedDate, "dd/MM/yyyy", { locale: es });
}