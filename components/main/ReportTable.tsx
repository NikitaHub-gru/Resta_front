"use client";
import { collectAndProcessGrcData } from "@/hooks/calcul-grc";
const ALL_COMPANIES = "all_companies";

import Calculleit from "@/components/ui/calculleit";
import { useState, useEffect, useCallback } from "react";
import {
  Download,
  Search,
  SortAsc,
  SortDesc,
  Filter,
  X,
  Frown,
  CalendarIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import * as XLSX from "xlsx";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

import { getColumnDisplayName, getColumnOriginalName } from "@/lib/const";
import {
  addDays,
  subDays,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  addMonths,
} from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import GrcPage from "../ui/grc-page";
import Loading_page from "../loadingP/Loading_comp";
import Zagruzka from "../loadingP/zagruzka";

type DeliveryOrder = {
  [key: string]: string | number | null;
};

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
} | null;

type FilterConfig = {
  [key: string]: Set<string>;
};

// Helper function to parse delivery zone with color
const parseDeliveryZone = (value: string) => {
  const match = value.match(/\[(#[0-9A-Fa-f]{6})\](.*)/);
  if (match) {
    return {
      color: match[1],
      text: match[2].trim(),
    };
  }
  return null;
};

interface Report {
  id: number;
  tb_name: string;
  descript: string;
  data: string;
  corporation: string;
}

interface TableData {
  id: string;
  // добавьте другие поля
}

interface ExportData {
  [key: string]:
    | string
    | number
    | Date
    | null
    | {
        v: string | number;
        s: {
          fill: {
            fgColor: { rgb: string };
          };
        };
      };
}

export default function DeliveryOrders() {
  const [data, setData] = useState<DeliveryOrder[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [filters, setFilters] = useState<FilterConfig>({});
  const [activeFilters, setActiveFilters] = useState<{
    [key: string]: string[];
  }>({});
  const [filterSearchTerms, setFilterSearchTerms] = useState<{
    [key: string]: string;
  }>({});
  const [isDataTooLarge, setIsDataTooLarge] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  // Add new states for company handling
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [isDataFetched, setIsDataFetched] = useState(false);

  // Добавим функцию для разбиения периода на месяцы
  const getMonthPeriods = (
    startDate: Date,
    endDate: Date
  ): { start: Date; end: Date }[] => {
    const periods: { start: Date; end: Date }[] = [];
    let currentStart = startOfMonth(startDate);

    while (currentStart <= endDate) {
      const currentEnd = endOfMonth(currentStart);
      periods.push({
        start: currentStart > startDate ? currentStart : startDate,
        end: currentEnd < endDate ? currentEnd : endDate,
      });
      currentStart = addMonths(currentStart, 1);
    }

    return periods;
  };

  // Обновленная функция проверки длительности периода
  const isMoreThanOneMonth = (start: Date, end: Date): boolean => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 90;
  };

  // Оборачиваем fetchData в useCallback
  const fetchData = useCallback(async () => {
    if (!startDate || !endDate || !selectedReport) {
      return;
    }

    try {
      setIsLoading(true);
      setIsDataFetched(false); // Reset when starting new fetch
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");

      const processedData =
        typeof selectedReport.data === "string"
          ? selectedReport.data
              .replace(/False/g, "false")
              .replace(/True/g, "true")
          : "";

      // Ипользуем корпорацию из выбранного отчета
      const reportCorporation = selectedReport.corporation;

      if (!isMoreThanOneMonth(startDate, endDate)) {
        const response = await fetch(
          // `http://192.168.77.47:8000/olap/get_olap_sec?start_date=${formattedStartDate}&end_date=${formattedEndDate}&report_id=${selectedReport.id}&corporation=${reportCorporation}`,
          `https://nikitahub-gru-resta-back-f1fb.twc1.net/olap/get_olap_sec?start_date=${formattedStartDate}&end_date=${formattedEndDate}&report_id=${selectedReport.id}&corporation=${reportCorporation}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: processedData,
          }
        );

        if (!response.ok) {
          throw new Error("Ошибка при загрузке данных");
        }

        const jsonData = await response.json();
        if (jsonData && jsonData.data && Array.isArray(jsonData.data)) {
          setIsDataTooLarge(false);
          processReceivedData(jsonData.data);
          setIsDataFetched(true); // Set to true after successful fetch
        }
      } else {
        setIsDataTooLarge(true);
        const periods = getMonthPeriods(startDate, endDate);
        let allData: DeliveryOrder[] = [];

        for (const period of periods) {
          const periodStartDate = format(period.start, "yyyy-MM-dd");
          const periodEndDate = format(period.end, "yyyy-MM-dd");

          const response = await fetch(
            // `http://192.168.77.47:8000/olap/get_olap_sec?start_date=${periodStartDate}&end_date=${periodEndDate}&report_id=${selectedReport.id}&corporation=${reportCorporation}`,
            `https://nikitahub-gru-resta-back-f1fb.twc1.net/olap/get_olap_sec?start_date=${periodStartDate}&end_date=${periodEndDate}&report_id=${selectedReport.id}&corporation=${reportCorporation}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: processedData,
            }
          );

          if (!response.ok) {
            throw new Error("Ошибка при загрузке данных");
          }

          const jsonData = await response.json();
          if (jsonData && jsonData.data && Array.isArray(jsonData.data)) {
            allData = [...allData, ...jsonData.data];
          }
        }

        setData(allData);
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
      setData([]);
      setIsDataFetched(false);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, selectedReport]);

  // Вспомогательная функция для обработки полученных данных
  const processReceivedData = (receivedData: DeliveryOrder[]) => {
    setData(receivedData);

    // Получаем все уникальные ключи из данных
    const allColumns = Array.from(
      new Set(receivedData.flatMap((item) => Object.keys(item)))
    );
    setColumns(allColumns);

    // Инициализируем фильтры для каждого столбца
    const initialFilters: FilterConfig = {};
    allColumns.forEach((column) => {
      const uniqueValues = new Set(
        receivedData
          .map((item) => String(item[column] ?? "Пусто"))
          .filter(Boolean)
      );
      initialFilters[column] = uniqueValues;
    });
    setFilters(initialFilters);
  };

  const handleSort = (
    key: string,
    sortType: "asc" | "desc" | "alpha-asc" | "alpha-desc"
  ) => {
    const sorted = [...data].sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];

      if (valueA === null || valueA === undefined) return 1;
      if (valueB === null || valueB === undefined) return -1;

      // Сортировка по алфавиту
      if (sortType === "alpha-asc" || sortType === "alpha-desc") {
        const direction = sortType === "alpha-asc" ? 1 : -1;
        return direction * String(valueA).localeCompare(String(valueB), "ru");
      }

      // Числовая сортировка
      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortType === "asc" ? valueA - valueB : valueB - valueA;
      }

      // Сортировка дат
      if (
        key.toLowerCase().includes("time") ||
        key.toLowerCase().includes("date")
      ) {
        return sortType === "asc"
          ? new Date(String(valueA)).getTime() -
              new Date(String(valueB)).getTime()
          : new Date(String(valueB)).getTime() -
              new Date(String(valueA)).getTime();
      }

      // Обычная сортировка строк
      return sortType === "asc"
        ? String(valueA).localeCompare(String(valueB), "ru")
        : String(valueB).localeCompare(String(valueA), "ru");
    });

    setData(sorted);
    setSortConfig({ key, direction: sortType as "asc" | "desc" });
  };

  const handleFilter = (column: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [column]: [...(prev[column] || []), value],
    }));
  };

  const removeFilter = (column: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [column]: prev[column].filter((v) => v !== value),
    }));
  };

  const clearFilters = (column: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [column]: [],
    }));
  };

  const filteredData = data.filter((item) => {
    // Применяем активные фильтры
    const passesFilters = Object.entries(activeFilters).every(
      ([column, selectedValues]) => {
        if (!selectedValues || selectedValues.length === 0) return true;
        const itemValue = String(item[column] ?? "Пусто");
        return selectedValues.includes(itemValue);
      }
    );

    // Применяем поиск по всем полям
    const passesSearch = Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return passesFilters && passesSearch;
  });

  // Обновленная функция formatDate
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "—";

    // Проверяем, содержит ли строка реальное время (не 00:00 или 07:00)
    const hasActualTime = (str: string): boolean => {
      const timeMatch = str.match(/\d{2}:\d{2}(:\d{2})?$/);
      if (!timeMatch) return false;

      const time = timeMatch[0];
      return (
        time !== "00:00:00" &&
        time !== "00:00" &&
        time !== "07:00:00" &&
        time !== "07:00"
      );
    };

    try {
      const date = new Date(dateString);

      if (hasActualTime(dateString)) {
        // Если есть реальное время, возвращаем дату со временем
        return format(date, "d MMMM yyyy HH:mm", { locale: ru });
      } else {
        // Если времени нет или оно дефолтное, возвращаем только дату
        return format(date, "d MMMM yyyy", { locale: ru });
      }
    } catch {
      return dateString;
    }
  };

  // Используйте эту функцию в formatCellValue
  const formatCellValue = (
    value: string | number | null,
    column: string
  ): string | JSX.Element => {
    if (value === null || value === undefined || value === "") return "—";

    if (column === "OrderTime.OrderLength") {
      return `${value}`;
    }

    if (
      column.toLowerCase().includes("time") ||
      (column.toLowerCase().includes("date") &&
        column !== "OrderTime.OrderLength")
    ) {
      if (column === "cookingTosend_time") {
        const numericValue = parseFloat(String(value));
        const color = numericValue > 40 ? "#ff0000" : "#00ff00";
        return (
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span>{`${value}`}</span>
          </div>
        );
      }
      return formatDate(String(value));
    }

    // Handle delivery zone with color
    if (column === "delivery_zone" && typeof value === "string") {
      const zoneInfo = parseDeliveryZone(value);
      if (zoneInfo) {
        return (
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: zoneInfo.color }}
            />
            <span>{zoneInfo.text}</span>
          </div>
        );
      }
    }

    // Default case: convert value to string
    return String(value);
  };
  // Добавим функцию для расчета ширины колонки
  const calculateColumnWidth = (columnName: string): number => {
    const displayName = getColumnDisplayName(columnName);
    // Базовая ширина для короткого текста
    const baseWidth = 120;
    // Примерная ширина одного символа (в пикселях)
    const charWidth = 8;
    // Минимальная ширина колонки
    const minWidth = 120;
    // Максимальная ширина колонки
    const maxWidth = 400;

    // Расчет ширины на основе длины текста
    const calculatedWidth = baseWidth + displayName.length * charWidth;

    // Возвращаем значение в пределах min и max
    return Math.min(Math.max(calculatedWidth, minWidth), maxWidth);
  };

  // Добавим функцию для проверки и форматирования даты
  const formatDateValue = (value: string | number | null): string => {
    if (!value) return "—";

    try {
      const date = new Date(String(value));
      // Проверяем, что дата валидная
      if (isNaN(date.getTime())) {
        return String(value);
      }
      return format(date, "d MMMM yyyy HH:mm", { locale: ru });
    } catch {
      return String(value);
    }
  };

  // Обновим функцию для преобразования данных перед экспортом
  const prepareDataForExport = (data: DeliveryOrder[]): ExportData[] => {
    return data.map((row) => {
      const transformedRow: ExportData = {};
      Object.entries(row).forEach(([key, value]) => {
        const russianKey = getColumnDisplayName(key);

        if (key === "OrderTime.OrderLength") {
          transformedRow[russianKey] = value ? `${value}` : "—";
        } else if (key === "delivery_zone" && typeof value === "string") {
          const zoneInfo = parseDeliveryZone(value);
          if (zoneInfo) {
            transformedRow[russianKey] = {
              v: zoneInfo.text,
              s: {
                fill: {
                  fgColor: { rgb: zoneInfo.color.replace("#", "") },
                },
              },
            };
          } else {
            transformedRow[russianKey] = value;
          }
        } else if (key === "cookingTosend_time") {
          const numericValue = parseFloat(String(value));
          const color = numericValue > 40 ? "#ff0000" : "#00ff00";
          transformedRow[russianKey] = {
            v: `${value}`,
            s: {
              fill: {
                fgColor: { rgb: color.replace("#", "") },
              },
            },
          };
        } else if (
          key.toLowerCase().includes("time") ||
          (key.toLowerCase().includes("date") &&
            key !== "OrderTime.OrderLength")
        ) {
          transformedRow[russianKey] = formatDateValue(value);
        } else {
          transformedRow[russianKey] = value ?? "—";
        }
      });
      return transformedRow;
    });
  };

  // Добавляем функцию для подсчета количества значений
  const getValueCount = (column: string, value: string): number => {
    return data.filter((item) => String(item[column] ?? "Пусто") === value)
      .length;
  };

  // Добавим функцию для форматирования значения в фильтре
  const formatFilterValue = (column: string, value: string): string => {
    if (value === "Пуо") return value;

    if (column === "OrderTime.OrderLength") {
      return `${value}`;
    }

    if (
      column.toLowerCase().includes("time") ||
      (column.toLowerCase().includes("date") &&
        column !== "OrderTime.OrderLength")
    ) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return format(date, "d MMMM yyyy HH:mm", { locale: ru });
        }
      } catch {
        // Если не удалось отформатировать дату, возвращаем исходное значение
      }
    }

    return value;
  };

  // Добавлем фнкции для быстрого выбора периода
  const handleToday = () => {
    const today = new Date();
    setStartDate(today);
    setEndDate(today);
  };

  const handleYesterday = () => {
    const yesterday = subDays(new Date(), 1);
    setStartDate(yesterday);
    setEndDate(yesterday);
  };

  const handleWeek = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Начало с понедельника
    setStartDate(weekStart);
    setEndDate(today);
  };

  // Загрузка доступных отчетов
  useEffect(() => {
    fetchAvailableReports();
  }, []);

  // Add function to extract unique companies from reports
  const extractCompanies = (reports: Report[]) => {
    const uniqueCompanies = Array.from(
      new Set(reports.map((report) => report.corporation))
    );
    setCompanies(uniqueCompanies);
  };

  const fetchAvailableReports = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Необходима авторизация");

      const userCorporation = session.user.user_metadata.corporation;

      let query = supabase.from("Reports").select("*").eq("is_active", true);

      if (userCorporation !== "RestaLabs") {
        query = query.eq("corporation", userCorporation);
      }

      const { data, error } = await query;
      if (error) throw error;

      setReports(data);
      extractCompanies(data);
    } catch (error) {
      console.error("Ошибка загрузки отчетов:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add company selection handler
  const handleCompanySelect = (company: string) => {
    setSelectedCompany(company === ALL_COMPANIES ? "" : company);
    setSelectedReport(null); // Reset selected report when company changes
  };

  // Обработчик выбора отчета
  const handleReportSelect = (report: Report) => {
    setSelectedReport(report);
  };

  return (
    <ScrollArea className="h-[calc(100vh-2rem)] w-full">
      <div className="container mx-auto py-10">
        <div className="rounded-lg border bg-[#171717] text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold leading-none tracking-tight mb-5">
                  {selectedReport?.tb_name || "Выберите отчет"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedReport?.descript || "Описание отчета будет здесь"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* Company select */}
                <Select
                  value={selectedCompany || ALL_COMPANIES}
                  onValueChange={handleCompanySelect}
                >
                  <SelectTrigger className="w-[200px] bg-[#171717]">
                    <SelectValue placeholder="Все компании" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_COMPANIES}>Все компании</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Report select */}
                <Select
                  value={selectedReport?.id?.toString() || ""}
                  onValueChange={(value) => {
                    const report = reports
                      .filter(
                        (r) =>
                          !selectedCompany || r.corporation === selectedCompany
                      )
                      .find((r) => r.id === Number(value));
                    if (report) handleReportSelect(report);
                  }}
                >
                  <SelectTrigger className="w-[300px] bg-[#171717]">
                    <SelectValue placeholder="Выберите отчет" />
                  </SelectTrigger>
                  <SelectContent>
                    {reports
                      .filter(
                        (report) =>
                          !selectedCompany ||
                          report.corporation === selectedCompany
                      )
                      .map((report) => (
                        <SelectItem
                          key={report.id}
                          value={report.id.toString()}
                        >
                          {report.tb_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0">
            {/* Добавляем выбор периода */}
            <div className="mb-6">
              <div className="rounded-md border p-4 ">
                <div className="flex items-center gap-4 ">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="min-w-[155px] max-w-[300px] items-center justify-start text-left font-normal bg-[#171717]"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 " />
                        {startDate && endDate
                          ? format(startDate, "d MMMM yyyy", { locale: ru }) +
                            " - " +
                            format(endDate, "d MMMM yyyy", { locale: ru })
                          : "Выберите период"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 z-50"
                      align="start"
                      sideOffset={5}
                      side="bottom"
                    >
                      <div
                        className="border rounded-md bg-[#171717] shadow-md p-3"
                        style={{ minWidth: "600px" }}
                      >
                        <Calendar
                          mode="range"
                          selected={{
                            from: startDate,
                            to: endDate,
                          }}
                          onSelect={(range) => {
                            setStartDate(range?.from);
                            setEndDate(range?.to);
                          }}
                          numberOfMonths={2}
                          locale={ru}
                          className="w-full bg-[#171717]"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>

                  <div className="flex gap-2">
                    <Button
                      variant="link"
                      onClick={() => {
                        handleToday();
                        // Убираем автоматический вызов fetchData
                      }}
                      className="text-sm"
                    >
                      Сегодня
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => {
                        handleYesterday();
                        // Убираем автоматический вызов fetchData
                      }}
                      className="text-sm"
                    >
                      Вчера
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => {
                        handleWeek();
                        // Убираем автоматический вызов fetchData
                      }}
                      className="text-sm"
                    >
                      Неделя
                    </Button>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button onClick={fetchData}>Получить данные</Button>
                    {selectedReport?.id === 17 && isDataFetched && (
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button>Рассчитать</Button>
                        </SheetTrigger>
                        <SheetContent className="h-full">
                          <SheetHeader>
                            <SheetTitle>Ввод данных</SheetTitle>
                            <SheetDescription>
                              Введите информацию о курьерах
                            </SheetDescription>
                          </SheetHeader>
                          <div>
                            <GrcPage
                              data={filteredData}
                              onCalculate={(formData) => {
                                try {
                                  console.log(
                                    "Received form data in ReportTable:",
                                    formData
                                  );

                                  // Если есть данные от сервера, обновляем таблицу
                                  if (formData.serverResponse) {
                                    setData(formData.serverResponse);
                                    processReceivedData(
                                      formData.serverResponse
                                    );
                                  }
                                } catch (error) {
                                  console.error(
                                    "Error during calculation:",
                                    error
                                  );
                                }
                              }}
                            />
                          </div>
                        </SheetContent>
                      </Sheet>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col justify-center items-center pt-20">
                <div className="h-[200px]">
                  <Loading_page />
                </div>
                <div className="flex items-center justify-center w-full h-2">
                  <Zagruzka />
                </div>
              </div>
            ) : isDataTooLarge ? (
              <div className="flex flex-col items-center justify-center space-y-4 p-8">
                <Frown className="h-16 w-16 text-muted-foreground" />
                <p className="text-lg text-center text-muted-foreground">
                  Объем анных слишком большой для отбражения в таблице.
                  <br />
                  Пожалуйста, воспользуйтесь экспортом в Excel.
                </p>
                <Button
                  onClick={() => {
                    const exportData = prepareDataForExport(data);
                    const worksheet = XLSX.utils.json_to_sheet(exportData);

                    const columns = Object.keys(exportData[0] || {});
                    const columnWidths: { [key: string]: number } = {};

                    columns.forEach((col) => {
                      let maxLength = col.length;
                      exportData.forEach((row) => {
                        const cellLength = String(row[col] || "").length;
                        maxLength = Math.max(maxLength, cellLength);
                      });
                      columnWidths[col] = maxLength + 2;
                    });

                    worksheet["!cols"] = columns.map((col) => ({
                      wch: columnWidths[col],
                    }));

                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(
                      workbook,
                      worksheet,
                      `Кастомный отчет ${selectedReport?.tb_name}`
                    );
                    XLSX.writeFile(
                      workbook,
                      `${selectedReport?.tb_name}${format(
                        new Date(),
                        "yyyy-MM-dd"
                      )}.xlsx`
                    );
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Экспорт в Excel
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="relative w-[300px]">
                    <Input
                      placeholder="Поиск по всем полям..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#171717] h-10 pl-10"
                    />
                    <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                  <Button
                    onClick={() => {
                      const exportData = prepareDataForExport(filteredData);
                      const worksheet = XLSX.utils.json_to_sheet(exportData, {
                        cellStyles: true,
                      });

                      // Get all columns
                      const columns = Object.keys(exportData[0] || {});
                      const columnWidths: { [key: string]: number } = {};

                      // Calculate column widths
                      columns.forEach((col) => {
                        let maxLength = col.length;

                        interface CellValue {
                          v?: string | number;
                          s?: {
                            fill?: {
                              fgColor?: {
                                rgb?: string;
                              };
                            };
                          };
                        }

                        exportData.forEach((row) => {
                          const cellValue = row[col] as Date | CellValue;
                          const cellLength =
                            cellValue instanceof Date
                              ? String(cellValue).length
                              : String(
                                  (cellValue as CellValue).v || cellValue || ""
                                ).length;

                          maxLength = Math.max(maxLength, cellLength);
                          columnWidths[col] = maxLength;
                        });
                      });

                      worksheet["!cols"] = columns.map((col) => ({
                        wch: columnWidths[col],
                      }));

                      const workbook = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(
                        workbook,
                        worksheet,
                        "Заказы на доставку"
                      );
                      XLSX.writeFile(
                        workbook,
                        `${selectedReport?.tb_name}_${format(
                          new Date(),
                          "yyyy-MM-dd"
                        )}.xlsx`
                      );
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Экспорт в Excel
                  </Button>
                </div>

                <div className="rounded-md border">
                  <ScrollArea className="h-[500px] w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {columns.map((column) => (
                            <TableHead
                              key={column}
                              className="sticky top-0 bg-[#171717]"
                              style={{
                                width: `${calculateColumnWidth(column)}px`,
                                minWidth: `${calculateColumnWidth(column)}px`,
                              }}
                            >
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">
                                    {getColumnDisplayName(column)}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                        >
                                          <Filter className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align="end"
                                        className="w-[400px] bg-[#171717] border"
                                      >
                                        <div className="px-2 py-2">
                                          <Input
                                            placeholder="Поиск..."
                                            value={
                                              filterSearchTerms[column] || ""
                                            }
                                            onChange={(e) =>
                                              setFilterSearchTerms((prev) => ({
                                                ...prev,
                                                [column]: e.target.value,
                                              }))
                                            }
                                            className="h-8"
                                          />
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto bg-[#171717]">
                                          {Array.from(filters[column] || [])
                                            .filter((value) =>
                                              formatFilterValue(column, value)
                                                .toLowerCase()
                                                .includes(
                                                  (
                                                    filterSearchTerms[column] ||
                                                    ""
                                                  ).toLowerCase()
                                                )
                                            )
                                            .map((value) => (
                                              <DropdownMenuCheckboxItem
                                                key={value}
                                                checked={activeFilters[
                                                  column
                                                ]?.includes(value)}
                                                onCheckedChange={(checked) => {
                                                  if (checked) {
                                                    handleFilter(column, value);
                                                  } else {
                                                    removeFilter(column, value);
                                                  }
                                                }}
                                                className="bg-[#171717]"
                                              >
                                                <div className="flex items-center justify-between w-full gap-2">
                                                  <span className="break-words whitespace-normal">
                                                    {formatFilterValue(
                                                      column,
                                                      value
                                                    )}
                                                  </span>
                                                  <span className="ml-2 text-xs text-muted-foreground shrink-0">
                                                    {getValueCount(
                                                      column,
                                                      value
                                                    )}
                                                  </span>
                                                </div>
                                              </DropdownMenuCheckboxItem>
                                            ))}
                                        </div>
                                        {activeFilters[column]?.length > 0 && (
                                          <div className="border-t px-2 py-2 bg-[#171717]">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="w-full"
                                              onClick={() =>
                                                clearFilters(column)
                                              }
                                            >
                                              Очистить все
                                            </Button>
                                          </div>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                        >
                                          {sortConfig?.key === column ? (
                                            sortConfig.direction.includes(
                                              "asc"
                                            ) ? (
                                              <SortAsc className="h-4 w-4" />
                                            ) : (
                                              <SortDesc className="h-4 w-4" />
                                            )
                                          ) : (
                                            <SortAsc className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleSort(column, "asc")
                                          }
                                        >
                                          Сортировать по возрастанию
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleSort(column, "desc")
                                          }
                                        >
                                          Сортировать по убыванию
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleSort(column, "alpha-asc")
                                          }
                                        >
                                          Сортировать по алфавиту (А-Я)
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleSort(column, "alpha-desc")
                                          }
                                        >
                                          Сортировать по алфавиту (Я-А)
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                                {activeFilters[column]?.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {activeFilters[column].map((filter) => (
                                      <span
                                        key={filter}
                                        className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs"
                                      >
                                        {formatFilterValue(column, filter)}
                                        <button
                                          onClick={() =>
                                            removeFilter(column, filter)
                                          }
                                          className="text-muted-foreground hover:text-foreground"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </span>
                                    ))}
                                    <button
                                      onClick={() => clearFilters(column)}
                                      className="text-xs text-muted-foreground hover:text-foreground"
                                    >
                                      Очистить
                                    </button>
                                  </div>
                                )}
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((row, index) => (
                          <TableRow key={index}>
                            {columns.map((column) => (
                              <TableCell
                                key={column}
                                className="whitespace-nowrap"
                                style={{
                                  width: `${calculateColumnWidth(column)}px`,
                                  minWidth: `${calculateColumnWidth(column)}px`,
                                }}
                              >
                                {formatCellValue(row[column], column)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                        {filteredData.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={columns.length}
                              className="h-24 text-center"
                            ></TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
