'use client'

import { format } from 'date-fns'
import {
	addDays,
	addMonths,
	endOfMonth,
	startOfMonth,
	startOfWeek,
	subDays
} from 'date-fns'
import { ru } from 'date-fns/locale'
import {
	CalendarIcon,
	Download,
	Filter,
	Frown,
	Info,
	Search,
	SortAsc,
	SortDesc,
	X
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

import Loading_page from '../loadingP/Loading_comp'
import Zagruzka from '../loadingP/zagruzka'
import GrcPage from '../ui/grc-page'

import SheetTable from '@/components/dy_table/SheetTable'
import { Button } from '@/components/ui/button'
import Calculleit from '@/components/ui/calculleit'
import { Calendar } from '@/components/ui/calendar'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover'
import { ReportInfoModal } from '@/components/ui/report-info-modal'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from '@/components/ui/sheet'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import { collectAndProcessGrcData } from '@/hooks/calcul-grc'
import { getAuthUser } from '@/hooks/getauthuser'
import { getColumnDisplayName, getColumnOriginalName } from '@/lib/const'
import { supabase } from '@/lib/supabaseClient'

const ALL_COMPANIES = 'all_companies'

type DeliveryOrder = {
	[key: string]: string | number | null
}

type SortConfig = {
	key: string
	direction: 'asc' | 'desc'
} | null

type FilterConfig = {
	[key: string]: Set<string>
}

// Helper function to parse delivery zone with color
const parseDeliveryZone = (value: string) => {
	const match = value.match(/\[(#[0-9A-Fa-f]{6})\](.*)/)
	if (match) {
		return {
			color: match[1],
			text: match[2].trim()
		}
	}
	return null
}

interface Report {
	id: number
	tb_name: string
	descript: string
	data: string
	corporation: string
	description_info?: string // Added this optional property
}

interface TableData {
	id: string
	// добавьте другие поля
}
interface ReportTableInfoProps {
	id: number
	corporation: string
}

interface ExportData {
	[key: string]:
		| string
		| number
		| Date
		| null
		| {
				v: string | number
				s: {
					fill: {
						fgColor: { rgb: string }
					}
				}
		  }
}

interface CellValue {
	v?: string | number
	s?: {
		fill?: {
			fgColor?: {
				rgb?: string
			}
		}
	}
}

export default function DeliveryOrders({
	id,
	corporation
}: ReportTableInfoProps) {
	const { toast } = useToast()
	const [data, setData] = useState<DeliveryOrder[]>([])
	const [columns, setColumns] = useState<string[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [sortConfig, setSortConfig] = useState<SortConfig>(null)
	const [filters, setFilters] = useState<FilterConfig>({})
	const [activeFilters, setActiveFilters] = useState<{
		[key: string]: string[]
	}>({})
	const [filterSearchTerms, setFilterSearchTerms] = useState<{
		[key: string]: string
	}>({})
	const [isDataTooLarge, setIsDataTooLarge] = useState(false)
	const [startDate, setStartDate] = useState<Date | undefined>(undefined)
	const [endDate, setEndDate] = useState<Date | undefined>(undefined)
	const [isLoading, setIsLoading] = useState(false)
	const [reports, setReports] = useState<Report[]>([])
	const [selectedReport, setSelectedReport] = useState<Report | null>(null)
	// Add new states for company handling
	const [companies, setCompanies] = useState<string[]>([])
	const [selectedCompany, setSelectedCompany] = useState<string>('')
	const [isDataFetched, setIsDataFetched] = useState(false)
	const [user, setUser] = useState<any>(null)
	// Добавим новый state для отслеживания полноэкранного режима
	const [isFullScreen, setIsFullScreen] = useState(false)

	// Добавим функцию для разбиения периода на месяцы
	const getMonthPeriods = (
		startDate: Date,
		endDate: Date
	): { start: Date; end: Date }[] => {
		const periods: { start: Date; end: Date }[] = []
		let currentStart = startOfMonth(startDate)

		while (currentStart <= endDate) {
			const currentEnd = endOfMonth(currentStart)
			periods.push({
				start: currentStart > startDate ? currentStart : startDate,
				end: currentEnd < endDate ? currentEnd : endDate
			})
			currentStart = addMonths(currentStart, 1)
		}

		return periods
	}

	// Обновленная функция проверки длительности периода
	const isMoreThanOneMonth = (start: Date, end: Date): boolean => {
		const diffTime = Math.abs(end.getTime() - start.getTime())
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
		return diffDays >= 90
	}

	// Оборачиваем fetchData в useCallback
	const fetchData = useCallback(async () => {
		if (!startDate || !endDate || !selectedReport) {
			return
		}

		try {
			setIsLoading(true)
			setIsDataFetched(false) // Reset when starting new fetch
			const formattedStartDate = format(startDate, 'yyyy-MM-dd')
			const formattedEndDate = format(endDate, 'yyyy-MM-dd')

			const processedData =
				typeof selectedReport.data === 'string'
					? selectedReport.data.replace(/False/g, 'false').replace(/True/g, 'true')
					: ''

			// Используем id и corporation из props
			const reportId = id // Используем id из props
			const reportCorporation = corporation // Используем corporation из props

			if (!isMoreThanOneMonth(startDate, endDate)) {
				const response = await fetch(
					`https://nikitahub-gru-resta-back-c88a.twc1.net/olap/get_olap_sec?start_date=${formattedStartDate}&end_date=${formattedEndDate}&report_id=${reportId}&corporation=${reportCorporation}`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: processedData
					}
				)

				if (!response.ok) {
					throw new Error('Ошибка при загрузке данных')
				}

				const jsonData = await response.json()
				if (jsonData && jsonData.data && Array.isArray(jsonData.data)) {
					setIsDataTooLarge(false)
					processReceivedData(jsonData.data)
					setIsDataFetched(true) // Set to true after successful fetch
				}
			} else {
				// Обработка для периода более одного месяца
			}
		} catch (error) {
			console.error('Ошибка при загрузке данных:', error)
			setData([])
			setIsDataFetched(false)
		} finally {
			setIsLoading(false)
		}
	}, [startDate, endDate, selectedReport, id, corporation])

	// Вспомогательная функция для обработки полученных данных
	const processReceivedData = (receivedData: DeliveryOrder[]) => {
		setData(receivedData)

		// Получаем все уникальные ключи из данных
		const allColumns = Array.from(
			new Set(receivedData.flatMap(item => Object.keys(item)))
		)
		setColumns(allColumns)

		// Инициализируем фильтры для каждого столбца
		const initialFilters: FilterConfig = {}
		allColumns.forEach(column => {
			const uniqueValues = new Set(
				receivedData.map(item => String(item[column] ?? 'Пусто')).filter(Boolean)
			)
			initialFilters[column] = uniqueValues
		})
		setFilters(initialFilters)
	}

	const handleSort = (
		key: string,
		sortType: 'asc' | 'desc' | 'alpha-asc' | 'alpha-desc'
	) => {
		const sorted = [...data].sort((a, b) => {
			const valueA = a[key]
			const valueB = b[key]

			if (valueA === null || valueA === undefined) return 1
			if (valueB === null || valueB === undefined) return -1

			// Сортировка по алфавиту
			if (sortType === 'alpha-asc' || sortType === 'alpha-desc') {
				const direction = sortType === 'alpha-asc' ? 1 : -1
				return direction * String(valueA).localeCompare(String(valueB), 'ru')
			}

			// Числовая сортировка
			if (typeof valueA === 'number' && typeof valueB === 'number') {
				return sortType === 'asc' ? valueA - valueB : valueB - valueA
			}

			// Сортировка дат
			if (
				key.toLowerCase().includes('time') ||
				key.toLowerCase().includes('date')
			) {
				return sortType === 'asc'
					? new Date(String(valueA)).getTime() - new Date(String(valueB)).getTime()
					: new Date(String(valueB)).getTime() - new Date(String(valueA)).getTime()
			}

			// Обычная сортировка строк
			return sortType === 'asc'
				? String(valueA).localeCompare(String(valueB), 'ru')
				: String(valueB).localeCompare(String(valueA), 'ru')
		})

		setData(sorted)
		setSortConfig({ key, direction: sortType as 'asc' | 'desc' })
	}

	const handleFilter = (column: string, value: string) => {
		setActiveFilters(prev => ({
			...prev,
			[column]: [...(prev[column] || []), value]
		}))
	}

	const removeFilter = (column: string, value: string) => {
		setActiveFilters(prev => ({
			...prev,
			[column]: prev[column].filter(v => v !== value)
		}))
	}

	const clearFilters = (column: string) => {
		setActiveFilters(prev => ({
			...prev,
			[column]: []
		}))
	}

	const filteredData = data.filter(item => {
		// Применяем активные фильтры
		const passesFilters = Object.entries(activeFilters).every(
			([column, selectedValues]) => {
				if (!selectedValues || selectedValues.length === 0) return true
				const itemValue = String(item[column] ?? 'Пусто')
				return selectedValues.includes(itemValue)
			}
		)

		// Применяем поиск по всем полям
		const passesSearch = Object.values(item).some(value =>
			String(value).toLowerCase().includes(searchTerm.toLowerCase())
		)

		return passesFilters && passesSearch
	})

	// Обновленная функция formatDate
	const formatDate = (dateString: string | null): string => {
		if (!dateString) return '—'

		// Проверяем, содержит ли строка реальное время (не 00:00 или 07:00)
		const hasActualTime = (str: string): boolean => {
			const timeMatch = str.match(/\d{2}:\d{2}(:\d{2})?$/)
			if (!timeMatch) return false

			const time = timeMatch[0]
			return (
				time !== '00:00:00' &&
				time !== '00:00' &&
				time !== '07:00:00' &&
				time !== '07:00'
			)
		}

		try {
			const date = new Date(dateString)

			if (hasActualTime(dateString)) {
				// Если есть реальное время, возвращаем дату со временем
				return format(date, 'd MMMM yyyy HH:mm', { locale: ru })
			} else {
				// Если времени нет или оно дефолтное, возвращаем только дату
				return format(date, 'd MMMM yyyy', { locale: ru })
			}
		} catch {
			return dateString
		}
	}

	// Используйте эту функцию в formatCellValue
	const formatCellValue = (
		value: string | number | null,
		column: string
	): string | JSX.Element => {
		if (value === null || value === undefined || value === '') return '—'

		if (column === 'OrderTime.OrderLength') {
			return `${value}`
		}

		if (
			column.toLowerCase().includes('time') ||
			(column.toLowerCase().includes('date') && column !== 'OrderTime.OrderLength')
		) {
			if (column === 'cookingTosend_time') {
				const numericValue = parseFloat(String(value))
				const color = numericValue > 40 ? '#ff0000' : '#00ff00'
				return (
					<div className='flex items-center gap-2'>
						<span
							className='inline-block h-3 w-3 rounded-full'
							style={{ backgroundColor: color }}
						/>
						<span>{`${value}`}</span>
					</div>
				)
			}
			return formatDate(String(value))
		}

		// Handle delivery zone with color
		if (column === 'delivery_zone' && typeof value === 'string') {
			const zoneInfo = parseDeliveryZone(value)
			if (zoneInfo) {
				return (
					<div className='flex items-center gap-2'>
						<span
							className='inline-block h-3 w-3 rounded-full'
							style={{ backgroundColor: zoneInfo.color }}
						/>
						<span>{zoneInfo.text}</span>
					</div>
				)
			}
		}

		// Default case: convert value to string
		return String(value)
	}
	// Добавим функцию для расчета ширины колонки
	const calculateColumnWidth = (columnName: string): number => {
		const displayName = getColumnDisplayName(columnName)
		// Уменьшаем базовую ширину
		const baseWidth = 100
		// Уменьшаем ширину символа
		const charWidth = 6
		// Уменьшаем минимальную ширину
		const minWidth = 80
		const maxWidth = 300

		const calculatedWidth = baseWidth + displayName.length * charWidth
		return Math.min(Math.max(calculatedWidth, minWidth), maxWidth)
	}

	// Добавим функцию для проверки и форматирования даты
	const formatDateValue = (value: string | number | null): string => {
		if (!value) return '—'

		try {
			const date = new Date(String(value))
			// Проверяем, что дата валидная
			if (isNaN(date.getTime())) {
				return String(value)
			}
			return format(date, 'd MMMM yyyy HH:mm', { locale: ru })
		} catch {
			return String(value)
		}
	}

	// Обновим функцию для преобразования данных перед экспортом
	const prepareDataForExport = (data: DeliveryOrder[]): ExportData[] => {
		return data.map(row => {
			const transformedRow: ExportData = {}
			Object.entries(row).forEach(([key, value]) => {
				const russianKey = getColumnDisplayName(key)

				if (key === 'OrderTime.OrderLength') {
					transformedRow[russianKey] = value ? `${value}` : '—'
				} else if (key === 'delivery_zone' && typeof value === 'string') {
					const zoneInfo = parseDeliveryZone(value)
					if (zoneInfo) {
						transformedRow[russianKey] = {
							v: zoneInfo.text,
							s: {
								fill: {
									fgColor: {
										rgb: zoneInfo.color.replace('#', '')
									}
								}
							}
						}
					} else {
						transformedRow[russianKey] = value
					}
				} else if (key === 'cookingTosend_time') {
					const numericValue = parseFloat(String(value))
					const color = numericValue > 40 ? '#ff0000' : '#00ff00'
					transformedRow[russianKey] = {
						v: `${value}`,
						s: {
							fill: {
								fgColor: { rgb: color.replace('#', '') }
							}
						}
					}
				} else if (
					key.toLowerCase().includes('time') ||
					(key.toLowerCase().includes('date') && key !== 'OrderTime.OrderLength')
				) {
					transformedRow[russianKey] = formatDateValue(value)
				} else {
					transformedRow[russianKey] = value ?? '—'
				}
			})
			return transformedRow
		})
	}

	// Добавляем функцию для подсчета количества значений
	const getValueCount = (column: string, value: string): number => {
		return data.filter(item => String(item[column] ?? 'Пусто') === value).length
	}

	// Добавим функцию для форматирования значения в фильтре
	const formatFilterValue = (column: string, value: string): string => {
		if (value === 'Пусто') return value

		if (column === 'OrderTime.OrderLength') {
			return `${value}`
		}

		if (
			column.toLowerCase().includes('time') ||
			(column.toLowerCase().includes('date') && column !== 'OrderTime.OrderLength')
		) {
			try {
				const date = new Date(value)
				if (!isNaN(date.getTime())) {
					return format(date, 'd MMMM yyyy HH:mm', { locale: ru })
				}
			} catch {
				// Если не удалось отформатировать дату, возвращаем исходное значение
			}
		}

		return value
	}

	// Добавлем фнкции для быстрого выбора периода
	const handleToday = () => {
		const today = new Date()
		setStartDate(today)
		setEndDate(today)
	}

	const handleYesterday = () => {
		const yesterday = subDays(new Date(), 1)
		setStartDate(yesterday)
		setEndDate(yesterday)
	}

	const handleWeek = () => {
		const today = new Date()
		const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Начало с понедельника
		setStartDate(weekStart)
		setEndDate(today)
	}

	// Загрузка доступных отчетов
	useEffect(() => {
		const loadReport = async () => {
			if (id) {
				const report = await fetchReportById(id)
				if (report) {
					setSelectedReport(report)
				} else {
					console.warn('Отчет не найден или неактивен')
				}
			}
		}

		loadReport()
	}, [id])

	// Add function to extract unique companies from reports
	const extractCompanies = (reports: Report[]) => {
		const uniqueCompanies = Array.from(
			new Set(reports.map(report => report.corporation))
		)
		setCompanies(uniqueCompanies)
	}

	const fetchReportById = async (reportId: number): Promise<Report | null> => {
		try {
			const { data, error } = await supabase
				.from('Reports')
				.select('*')
				.eq('id', reportId)
				.eq('is_active', true)

			if (error) throw error

			if (data && data.length > 0) {
				return data[0] as Report
			} else {
				console.warn('Отчет не найден или неактивен')
				return null
			}
		} catch (error) {
			console.error('Ошибка при получении отчета:', error)
			return null
		}
	}

	// Add company selection handler
	const handleCompanySelect = (company: string) => {
		setSelectedCompany(company === ALL_COMPANIES ? '' : company)
		setSelectedReport(null) // Reset selected report when company changes
	}

	// Обработчик выбора отчета
	const handleReportSelect = (report: Report) => {
		setSelectedReport(report)
		// Clear all active filters when selecting a new report
		setActiveFilters({})
		setFilterSearchTerms({})
		setSearchTerm('')
	}

	const getReportDetailsById = (reportId: number) => {
		const report = reports.find(r => r.id === reportId)
		return report
			? { name: report.tb_name, description: report.descript }
			: { name: '', description: '' }
	}

	// После других useEffect
	useEffect(() => {
		const loadUser = async () => {
			const userData = await getAuthUser()
			setUser(userData)
		}
		loadUser()
	}, [])

	return (
		<ScrollArea className='h-[calc(100vh-2rem)]'>
			<div className='mx-16 w-auto py-10'>
				<div className='rounded-lg border bg-white text-card-foreground shadow-sm dark:bg-[#171717]'>
					<div className='flex flex-col space-y-1.5 p-6'>
						<div className='flex items-center justify-between'>
							<div>
								<h2 className='mb-5 text-2xl font-semibold leading-none tracking-tight'>
									{selectedReport?.tb_name || 'Название отчета'}
								</h2>
								<p className='text-sm text-muted-foreground'>
									{selectedReport?.descript || 'Описание отчета будет здесь'}
								</p>
							</div>
						</div>
					</div>

					<div className='p-6 pt-0'>
						{/* Добавляем выбор периода */}
						<div className='mb-6'>
							<div className='rounded-md border p-4'>
								<div className='flex items-center gap-4'>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant='outline'
												className='min-w-[155px] max-w-[300px] items-center justify-start bg-white text-left font-normal dark:bg-neutral-900'
											>
												<CalendarIcon className='mr-2 h-4 w-4' />
												{startDate && endDate
													? format(startDate, 'd MMMM yyyy', { locale: ru }) +
														' - ' +
														format(endDate, 'd MMMM yyyy', { locale: ru })
													: 'Выберите период'}
											</Button>
										</PopoverTrigger>
										<PopoverContent
											className='z-50 w-auto p-0'
											align='start'
											sideOffset={5}
											side='bottom'
										>
											<div
												className='rounded-md border bg-white p-3 shadow-md dark:bg-neutral-900'
												style={{ minWidth: '600px' }}
											>
												<Calendar
													mode='range'
													selected={{
														from: startDate,
														to: endDate
													}}
													onSelect={range => {
														setStartDate(range?.from)
														setEndDate(range?.to)
													}}
													numberOfMonths={2}
													locale={ru}
													className='w-full bg-white dark:bg-neutral-900'
												/>
											</div>
										</PopoverContent>
									</Popover>

									<div className='flex gap-2'>
										<Button
											variant='link'
											onClick={() => {
												handleToday()
												// Убираем автоматический вызов fetchData
											}}
											className='text-sm'
										>
											Сегодня
										</Button>
										<Button
											variant='link'
											onClick={() => {
												handleYesterday()
												// Убираем автоматический вызов fetchData
											}}
											className='text-sm'
										>
											Вчера
										</Button>
										<Button
											variant='link'
											onClick={() => {
												handleWeek()
												// Убираем автоматический вызов fetchData
											}}
											className='text-sm'
										>
											Неделя
										</Button>
									</div>

									<div className='flex items-center gap-4'>
										<Button onClick={fetchData}>Получить данные</Button>
										{isDataFetched &&
											selectedReport?.id !== undefined &&
											[17, 30, 31, 32, 33, 34, 35, 44].includes(selectedReport.id) && (
												<Dialog>
													<DialogTrigger asChild>
														<Button>Рассчитать</Button>
													</DialogTrigger>
													<DialogContent className='h-[90vh] max-w-[90vw] overflow-hidden'>
														<div className='h-full'>
															<GrcPage
																data={filteredData}
																report_id={id.toString()}
																onCalculate={formData => {
																	try {
																		console.log('Received form data in ReportTable:', formData)
																		if (formData.serverResponse) {
																			setData(formData.serverResponse)
																			processReceivedData(formData.serverResponse)
																		}
																	} catch (error) {
																		console.error('Error during calculation:', error)
																	}
																}}
															/>
														</div>
													</DialogContent>
												</Dialog>
											)}
									</div>
								</div>
							</div>
						</div>

						{isLoading ? (
							<div className='flex flex-col items-center justify-center pt-20'>
								<div className='h-[200px]'>
									<Loading_page />
								</div>
								<div className='flex h-2 w-full items-center justify-center'>
									<Zagruzka />
								</div>
							</div>
						) : isDataTooLarge ? (
							<div className='flex flex-col items-center justify-center space-y-4 p-8'>
								<Frown className='h-16 w-16 text-muted-foreground' />
								<p className='text-center text-lg text-muted-foreground'>
									Объем анных слишком большой для отбражения в таблице.
									<br />
									Пожалуйста, воспользуйтесь экспортом в Excel.
								</p>
								<Button
									onClick={() => {
										const exportData = prepareDataForExport(data)
										const worksheet = XLSX.utils.json_to_sheet(exportData)

										const columns = Object.keys(exportData[0] || {})
										const columnWidths: {
											[key: string]: number
										} = {}

										columns.forEach(col => {
											let maxLength = col.length
											exportData.forEach(row => {
												const cellLength = String(row[col] || '').length
												maxLength = Math.max(maxLength, cellLength)
											})
											columnWidths[col] = maxLength + 2
										})

										worksheet['!cols'] = columns.map(col => ({
											wch: columnWidths[col]
										}))

										const workbook = XLSX.utils.book_new()
										XLSX.utils.book_append_sheet(
											workbook,
											worksheet,
											`Кастомный отчет ${selectedReport?.tb_name}`
										)
										XLSX.writeFile(
											workbook,
											`${selectedReport?.tb_name}${format(new Date(), 'yyyy-MM-dd')}.xlsx`
										)
									}}
								>
									<Download className='mr-2 h-4 w-4' />
									Экспорт в Excel
								</Button>
							</div>
						) : (
							<>
								<div className='mb-6 flex items-center justify-between'>
									<div className='relative w-[300px]'>
										<Input
											placeholder='Поиск по всем полям...'
											value={searchTerm}
											onChange={e => setSearchTerm(e.target.value)}
											className='h-8 w-full bg-white pl-10 text-xs dark:bg-neutral-900'
										/>
										<Search className='absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 transform text-muted-foreground' />
									</div>
									<div className='flex items-center gap-2'>
										<Button
											variant='outline'
											size='sm'
											onClick={() => setIsFullScreen(!isFullScreen)}
											className='text-xs'
										>
											{isFullScreen ? 'Свернуть' : 'На весь экран'}
										</Button>
										{isDataFetched &&
											selectedReport?.id !== undefined &&
											[17, 30, 31, 32, 33, 34, 35, 44].includes(selectedReport.id) && (
												<Button
													onClick={async () => {
														try {
															const user = await getAuthUser()
															const currentTimestamp = new Date().toISOString()

															const response = await fetch(
																'https://nikitahub-gru-resta-back-c88a.twc1.net/olap/save_report',
																{
																	method: 'POST',
																	headers: {
																		'Content-Type': 'application/json'
																	},
																	body: JSON.stringify({
																		reportId: selectedReport.id,
																		data: filteredData,
																		startDate: startDate,
																		endDate: endDate,
																		savedBy: user.name,
																		full_name: user.full_name,
																		savedAt: currentTimestamp
																	})
																}
															)

															if (!response.ok) {
																throw new Error('Failed to save report')
															}

															toast({
																title: 'Успешно',
																description: 'Отчет успешно сохранен',
																variant: 'default'
															})

															console.log('Report saved successfully')
														} catch (error) {
															console.error('Error saving report:', error)
															toast({
																title: 'Ошибка',
																description:
																	'Не удалось сохранить отчет, вы не произвели расчет сотрудников!',
																variant: 'destructive'
															})
														}
													}}
												>
													Сохранить отчет
												</Button>
											)}
										<Button
											onClick={() => {
												const exportData = prepareDataForExport(filteredData)
												const worksheet = XLSX.utils.json_to_sheet(exportData, {
													cellStyles: true
												})

												// Get all columns
												const columns = Object.keys(exportData[0] || {})
												const columnWidths: {
													[key: string]: number
												} = {}

												// Calculate column widths
												columns.forEach(col => {
													let maxLength = col.length

													exportData.forEach(row => {
														const cellValue = row[col] as Date | CellValue
														const cellLength =
															cellValue instanceof Date
																? String(cellValue).length
																: String((cellValue as CellValue).v || cellValue || '').length

														maxLength = Math.max(maxLength, cellLength)
														columnWidths[col] = maxLength
													})
												})

												worksheet['!cols'] = columns.map(col => ({
													wch: columnWidths[col]
												}))

												const workbook = XLSX.utils.book_new()
												XLSX.utils.book_append_sheet(
													workbook,
													worksheet,
													'Заказы на доставку'
												)
												XLSX.writeFile(
													workbook,
													`${selectedReport?.tb_name}_${format(
														new Date(),
														'yyyy-MM-dd'
													)}.xlsx`
												)
											}}
										>
											<Download className='mr-2 h-4 w-4' />
											Экспорт в Excel
										</Button>
									</div>
								</div>
								<div
									className={`rounded-md border ${
										isFullScreen
											? 'fixed inset-0 z-50 m-4 bg-white dark:bg-neutral-900'
											: 'relative'
									}`}
								>
									{isFullScreen && (
										<div className='absolute right-4 top-4 z-50'>
											<Button
												variant='outline'
												size='sm'
												onClick={() => setIsFullScreen(false)}
												className='h-8 w-8 p-0'
											>
												<X className='h-4 w-4' />
											</Button>
										</div>
									)}
									<div className='relative overflow-hidden'>
										<div>
											<ScrollArea
												className={`${
													isFullScreen ? 'h-[calc(100vh-8rem)]' : 'h-[500px]'
												} w-full`}
											>
												<div className='min-w-max'>
													<Table>
														<TableHeader
															className='sticky top-0 z-30 bg-white dark:bg-neutral-900'
															style={{
																position: 'sticky',
																top: 0,
																zIndex: 30
															}}
														>
															<TableRow>
																{columns.map(column => (
																	<TableHead
																		key={column}
																		className='z-20 bg-white p-1.5 shadow-[0_1px_0_0_rgba(0,0,0,0.1)] dark:bg-neutral-900'
																		style={{
																			width: `${calculateColumnWidth(column)}px`,
																			minWidth: `${calculateColumnWidth(column)}px`
																		}}
																	>
																		<div className='flex flex-col gap-0.5'>
																			<div className='flex items-center justify-between'>
																				<span className='text-xs font-medium'>
																					{getColumnDisplayName(column)}
																				</span>
																				<div className='flex items-center gap-0'>
																					<DropdownMenu>
																						<DropdownMenuTrigger asChild>
																							<Button
																								variant='ghost'
																								size='sm'
																								className='h-6 w-6 p-0'
																							>
																								<Filter className='h-3 w-3' />
																							</Button>
																						</DropdownMenuTrigger>
																						<DropdownMenuContent
																							align='end'
																							className='w-[400px] border bg-white dark:bg-[#171717]'
																						>
																							<div className='px-2 py-2'>
																								<Input
																									placeholder='Поиск...'
																									value={filterSearchTerms[column] || ''}
																									onChange={e =>
																										setFilterSearchTerms(prev => ({
																											...prev,
																											[column]: e.target.value
																										}))
																									}
																									className='h-8 bg-white dark:bg-[#171717]'
																								/>
																							</div>
																							<div className='max-h-[400px] overflow-y-auto bg-white dark:bg-[#171717]'>
																								{Array.from(filters[column] || [])
																									.filter(value =>
																										formatFilterValue(column, value)
																											.toLowerCase()
																											.includes(
																												(filterSearchTerms[column] || '').toLowerCase()
																											)
																									)
																									.map(value => (
																										<DropdownMenuCheckboxItem
																											key={value}
																											checked={activeFilters[column]?.includes(value)}
																											onCheckedChange={checked => {
																												if (checked) {
																													handleFilter(column, value)
																												} else {
																													removeFilter(column, value)
																												}
																											}}
																											className='bg-white dark:bg-[#171717]'
																										>
																											<div className='flex w-full items-center justify-between gap-2'>
																												<span className='whitespace-normal break-words'>
																													{formatFilterValue(column, value)}
																												</span>
																												<span className='ml-2 shrink-0 text-xs text-muted-foreground'>
																													{getValueCount(column, value)}
																												</span>
																											</div>
																										</DropdownMenuCheckboxItem>
																									))}
																							</div>
																							{activeFilters[column]?.length > 0 && (
																								<div className='border-t bg-white px-2 py-2 dark:bg-[#171717]'>
																									<Button
																										variant='ghost'
																										size='sm'
																										className='w-full'
																										onClick={() => clearFilters(column)}
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
																								variant='ghost'
																								size='sm'
																								className='h-6 w-6 p-0'
																							>
																								{sortConfig?.key === column ? (
																									sortConfig.direction.includes('asc') ? (
																										<SortAsc className='h-3 w-3' />
																									) : (
																										<SortDesc className='h-3 w-3' />
																									)
																								) : (
																									<SortAsc className='h-3 w-3' />
																								)}
																							</Button>
																						</DropdownMenuTrigger>
																						<DropdownMenuContent align='end'>
																							<DropdownMenuItem
																								onClick={() => handleSort(column, 'asc')}
																							>
																								Сортировать по возрастанию
																							</DropdownMenuItem>
																							<DropdownMenuItem
																								onClick={() => handleSort(column, 'desc')}
																							>
																								Сортировать по убыванию
																							</DropdownMenuItem>
																							<DropdownMenuItem
																								onClick={() => handleSort(column, 'alpha-asc')}
																							>
																								Сортировать по алфавиту (А-Я)
																							</DropdownMenuItem>
																							<DropdownMenuItem
																								onClick={() => handleSort(column, 'alpha-desc')}
																							>
																								Сортировать по алфавиту (Я-А)
																							</DropdownMenuItem>
																						</DropdownMenuContent>
																					</DropdownMenu>
																				</div>
																			</div>
																		</div>
																		{activeFilters[column]?.length > 0 && (
																			<div className='flex flex-wrap gap-0.5'>
																				{activeFilters[column].map(filter => (
																					<span
																						key={filter}
																						className='inline-flex items-center gap-0.5 rounded-full bg-muted px-1 py-0.5 text-[10px]'
																					>
																						{formatFilterValue(column, filter)}
																						<button
																							onClick={() => removeFilter(column, filter)}
																							className='text-muted-foreground hover:text-foreground'
																						>
																							<X className='h-2 w-2' />
																						</button>
																					</span>
																				))}
																				<button
																					onClick={() => clearFilters(column)}
																					className='text-[10px] text-muted-foreground hover:text-foreground'
																				>
																					Очистить
																				</button>
																			</div>
																		)}
																	</TableHead>
																))}
															</TableRow>
														</TableHeader>
														<TableBody>
															{filteredData.map((row, index) => (
																<TableRow key={index}>
																	{columns.map(column => (
																		<TableCell
																			key={column}
																			className='whitespace-nowrap p-1.5 text-xs'
																			style={{
																				width: `${calculateColumnWidth(column)}px`,
																				minWidth: `${calculateColumnWidth(column)}px`
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
																		className='h-24 text-center'
																	></TableCell>
																</TableRow>
															)}
														</TableBody>
													</Table>
												</div>
												<ScrollBar orientation='horizontal' />
											</ScrollArea>
										</div>
									</div>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
			<ScrollBar orientation='vertical' />
		</ScrollArea>
	)
}
