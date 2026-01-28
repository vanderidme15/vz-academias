import { parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { DaysConfig, daysConfig } from '../constants/days';

export const formatDate = (date?: string) => {
  if (!date) return '';

  const parsedDate = parseISO(date);

  return format(parsedDate, "dd/MM/yyyy", { locale: es });
}

export const formatDateTime = (date?: string) => {
  if (!date) return '';

  const parsedTime = parseISO(date);

  return format(parsedTime, "dd/MM/yyyy HH:mm", { locale: es });
}

export const formatTime = (time?: string) => {
  if (!time) return '';
  return time.slice(0, 5); // Obtiene solo "08:00"
}


export const getShortDays = (days: string[]) => {
  return days.map((day) => daysConfig[day as DaysConfig].shortName).join(' • ')
}