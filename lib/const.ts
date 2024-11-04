import type { ColumnMapping } from '@/lib/types';

// Импортируем JSON с маппингом (предполагается, что он сохранен как response.json)
import columnMappings from '@/lib/response_1730348462163.json';

// Создаем объект для маппинга названий колонок
export const COLUMN_MAPPINGS: ColumnMapping = columnMappings.reduce((acc, item) => {
  acc[item.param] = item.name;
  return acc;
}, {} as ColumnMapping);

// Создаем обратный маппинг для поиска оригинальных названий
export const REVERSE_COLUMN_MAPPINGS: ColumnMapping = columnMappings.reduce((acc, item) => {
  acc[item.name] = item.param;
  return acc;
}, {} as ColumnMapping);

// Функция для получения русского названия колонки
export const getColumnDisplayName = (columnName: string): string => {
  return COLUMN_MAPPINGS[columnName] || columnName;
};

// Функция для получения оригинального названия колонки
export const getColumnOriginalName = (displayName: string): string => {
  return REVERSE_COLUMN_MAPPINGS[displayName] || displayName;
};
