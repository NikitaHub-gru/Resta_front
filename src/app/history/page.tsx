'use client'

import { format } from 'date-fns'
import {
	endOfMonth,
	isSameMonth,
	isWithinInterval,
	startOfMonth
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Eye, Trash2, X } from 'lucide-react'
import { CalendarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

import { supabase } from '../../utils/supabase'

import { SidebarDemo } from '@/components/main/mailbar'
import { Dashboard } from '@/components/main/rightbar'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

const COLUMN_ORDER = [
	'Торговое предприятие',
	'ФИО Курьера',
	'Дата',
	'Кол-во отработанных часов',
	'ЗП часовая',
	'Кол-во чеков',
	'ЗП по чекам',
	'Расстояние за день (км)',
	'ГСМ',
	'Заказов доставленных за 30 мин.',
	'Бонус за скорость',
	'Удержания',
	'Доставка персонала в акт',
	'Итого'
]

interface ReportData {
	id: number
	reportId: number
	startDate: string
	endDate: string
	created_at: string
	full_name: string
	data: {
		data: Array<{
			ГСМ: number
			Дата: string
			Итого: number
			Удержания: number
			'ЗП часовая': number | null
			'ЗП по чекам': number | null
			'ФИО Курьера': string | null
			'Кол-во чеков': number | null
			'Бонус за скорость': number | null
			'Торговое предприятие': string | null
			'Расстояние за день (км)': number | null
			'Доставка персонала в акт': number | null
			'Кол-во отработанных часов': number | null
			'Заказов доставленных за 30 мин.': number | null
			[key: string]: any
		}>
	}
	last_changes: string | null
	last_change_date: string | null
}

function MonthPicker({
	selected,
	onSelect
}: {
	selected: Date | undefined
	onSelect: (date: Date | undefined) => void
}) {
	const [year, setYear] = useState(
		selected?.getFullYear() || new Date().getFullYear()
	)
	const months = Array.from({ length: 12 }, (_, i) => {
		const date = new Date(year, i)
		return format(date, 'LLLL', { locale: ru })
	})

	return (
		<div className='p-3'>
			<div className='mb-4 flex items-center justify-between'>
				<Button variant='ghost' size='icon' onClick={() => setYear(year - 1)}>
					<ChevronLeft className='h-4 w-4' />
				</Button>
				<div className='font-semibold'>{year}</div>
				<Button variant='ghost' size='icon' onClick={() => setYear(year + 1)}>
					<ChevronRight className='h-4 w-4' />
				</Button>
			</div>
			<div className='grid grid-cols-3 gap-2'>
				{months.map((month, index) => {
					const date = new Date(year, index)
					const isSelected = selected && isSameMonth(selected, date)

					return (
						<Button
							key={month}
							variant={isSelected ? 'default' : 'ghost'}
							className='capitalize'
							onClick={() => onSelect(date)}
						>
							{month}
						</Button>
					)
				})}
			</div>
		</div>
	)
}

interface EditableCellProps {
	value: any
	onChange: (value: any) => void
	type?: 'text' | 'number'
	isEditing: boolean
	onDoubleClick: () => void
	onBlur: () => void
}

const EditableCell: React.FC<EditableCellProps> = ({
	value,
	onChange,
	type = 'text',
	isEditing,
	onDoubleClick,
	onBlur
}) => {
	if (isEditing) {
		return (
			<Input
				type={type}
				value={value}
				onChange={e =>
					onChange(type === 'number' ? Number(e.target.value) : e.target.value)
				}
				onBlur={onBlur}
				autoFocus
				className='h-8 w-full'
			/>
		)
	}
	return (
		<div onDoubleClick={onDoubleClick} className='cursor-pointer'>
			{value === null || value === undefined ? '—' : value}
		</div>
	)
}

export default function ReportsSettingsPage() {
	const [rawData, setRawData] = useState<ReportData[]>([])
	const [selectedReportId, setSelectedReportId] = useState<string>('all')
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [reportToDelete, setReportToDelete] = useState<number | null>(null)
	const [viewModalOpen, setViewModalOpen] = useState(false)
	const [selectedReport, setSelectedReport] = useState<ReportData | null>(null)
	const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(undefined)
	const [editingCell, setEditingCell] = useState<{
		rowIndex: number
		columnName: string
	} | null>(null)
	const { toast } = useToast()

	const getReportLocation = (reportId: number): string => {
		const locationMap: { [key: number]: string } = {
			17: 'КРСН Газеты',
			30: 'КРСН Судостроительная',
			31: 'КРСН Мира',
			32: 'КРСН Металлургов',
			33: 'КРСН Кутузова',
			34: 'КРСН Вильского',
			44: 'КРСН Мартынова'
		}
		return locationMap[reportId] || `Точка #${reportId}`
	}

	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data, error } = await supabase.from('Users').select('*')
				if (error) {
					console.error('Error fetching data:', error)
					return
				}
				if (data) {
					setRawData(data as ReportData[])
				}
			} catch (err) {
				console.error('Fetch error:', err)
			}
		}

		fetchData()
	}, [])

	const formatDate = (dateString: string | null) => {
		if (!dateString) return 'Нет даты'

		try {
			const date = new Date(dateString)
			if (isNaN(date.getTime())) {
				return 'Неверная дата'
			}
			return format(date, 'd MMMM yyyy', { locale: ru })
		} catch (error) {
			console.error('Error formatting date:', error)
			return 'Ошибка даты'
		}
	}

	const filterByMonth = (data: ReportData[]) => {
		return data.filter(item => {
			if (!selectedMonth) return true

			const itemStart = new Date(item.startDate)
			const itemEnd = new Date(item.endDate)
			const filterStart = startOfMonth(selectedMonth)
			const filterEnd = endOfMonth(selectedMonth)

			return (
				isWithinInterval(itemStart, { start: filterStart, end: filterEnd }) ||
				isWithinInterval(itemEnd, { start: filterStart, end: filterEnd }) ||
				(itemStart <= filterStart && itemEnd >= filterEnd)
			)
		})
	}

	const filteredData = filterByMonth(
		selectedReportId === 'all'
			? rawData
			: rawData.filter(item => item.reportId.toString() === selectedReportId)
	)

	const handleDelete = async (id: number) => {
		try {
			const { error } = await supabase.from('Users').delete().eq('id', id)

			if (error) {
				console.error('Error deleting report:', error)
				return
			}

			// Update the local state to remove the deleted item
			setRawData(prevData => prevData.filter(item => item.id !== id))
			setDeleteDialogOpen(false)
			setReportToDelete(null)
		} catch (err) {
			console.error('Delete error:', err)
		}
	}

	const handleExportToExcel = () => {
		if (selectedReport?.data?.data) {
			// Reorder data according to COLUMN_ORDER
			const orderedData = selectedReport.data.data.map(row => {
				const orderedRow: { [key: string]: any } = {}
				COLUMN_ORDER.forEach(columnName => {
					let value = row[columnName]
					if (columnName === 'Дата' && value) {
						value = formatDate(value)
					}
					if (typeof value === 'number') {
						value = Number(value.toFixed(2))
					}
					orderedRow[columnName] = value ?? '—'
				})
				return orderedRow
			})

			// Create worksheet with ordered data
			const ws = XLSX.utils.json_to_sheet(orderedData, {
				header: COLUMN_ORDER
			})

			// Set column widths
			const colWidths = COLUMN_ORDER.map(col => ({
				wch: Math.max(col.length, 15)
			}))
			ws['!cols'] = colWidths

			const wb = XLSX.utils.book_new()
			XLSX.utils.book_append_sheet(wb, ws, 'Report')

			// Generate filename with location name and date
			const locationName = getReportLocation(selectedReport.reportId)
			const fileName = `${locationName}_${format(new Date(), 'dd-MM-yyyy')}.xlsx`

			// Save the file
			XLSX.writeFile(wb, fileName)
		}
	}

	const handleCellEdit = async (
		rowIndex: number,
		columnName: string,
		newValue: any
	) => {
		if (!selectedReport) return

		try {
			// Create a deep copy of the selected report
			const updatedReport = JSON.parse(JSON.stringify(selectedReport))

			// Update the value in the copied data
			updatedReport.data.data[rowIndex][columnName] = newValue

			// Get current user's name
			const {
				data: { session },
				error: sessionError
			} = await supabase.auth.getSession()
			if (sessionError) throw sessionError

			const currentUserName =
				session?.user?.user_metadata?.full_name ||
				session?.user?.email ||
				'Unknown User'
			const currentDate = new Date().toISOString()

			// Update the database with new data and last change info
			const { error } = await supabase
				.from('Users')
				.update({
					data: updatedReport.data,
					last_changes: currentUserName,
					last_change_date: currentDate
				})
				.eq('id', selectedReport.id)

			if (error) throw error

			// Update local state with new data and last change info
			updatedReport.last_changes = currentUserName
			updatedReport.last_change_date = currentDate

			setSelectedReport(updatedReport)
			setRawData(prev =>
				prev.map(item => (item.id === selectedReport.id ? updatedReport : item))
			)

			toast({
				title: 'Успешно обновлено',
				description: 'Изменения сохранены в базе данных'
			})
		} catch (error) {
			console.error('Error updating cell:', error)
			toast({
				title: 'Ошибка обновления',
				description: 'Не удалось сохранить изменения',
				variant: 'destructive'
			})
		}
	}

	return (
		<div className='h-screen w-screen bg-white dark:bg-neutral-900'>
			<SidebarDemo>
				<Dashboard>
					<div className='h-full w-full p-4'>
						<Card className='h-full bg-white dark:bg-neutral-900'>
							<CardHeader>
								<CardTitle className='text-2xl font-bold'>История отчетов</CardTitle>
								<div className='flex flex-col gap-4 sm:flex-row'>
									<div className='w-[250px]'>
										<Select value={selectedReportId} onValueChange={setSelectedReportId}>
											<SelectTrigger>
												<SelectValue placeholder='Выберите локацию' />
											</SelectTrigger>
											<SelectContent className='dark:bg-[#171717]'>
												<SelectItem value='all'>Все отчеты</SelectItem>
												{[...new Set(rawData.map(item => item.reportId))].map(id => (
													<SelectItem key={id} value={id.toString()}>
														{getReportLocation(id)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className='flex items-center gap-2'>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant='outline'
													className='w-[280px] justify-center bg-transparent text-left font-normal'
												>
													<CalendarIcon className='mr-2 h-4 w-4' />
													{selectedMonth
														? format(selectedMonth, 'LLLL yyyy', { locale: ru })
														: 'Выберите месяц'}
												</Button>
											</PopoverTrigger>
											<PopoverContent
												className='w-auto p-0 dark:bg-[#171717]'
												align='start'
											>
												<MonthPicker selected={selectedMonth} onSelect={setSelectedMonth} />
											</PopoverContent>
										</Popover>
										<Button
											variant='ghost'
											size='icon'
											onClick={() => {
												setSelectedMonth(undefined)
											}}
											className='hover:bg-red-100 hover:text-red-500'
										>
											<X className='h-4 w-4' />
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent className='flex-1'>
								<ScrollArea className='h-[calc(100vh-250px)] w-full rounded-md border'>
									<div className='p-4'>
										<table className='w-full'>
											<thead>
												<tr className='border-b'>
													<th className='p-4 text-left'>ID отчета</th>
													<th className='p-4 text-left'>Дата начала</th>
													<th className='p-4 text-left'>Дата окончания</th>
													<th className='p-4 text-left'>Дата создания</th>
													<th className='p-4 text-left'>Пользователь</th>
													<th className='p-4 text-left'>Последние изменения</th>
													<th className='p-4 text-left'>Дата изменения</th>
													<th className='p-4 text-right'>Действия</th>
												</tr>
											</thead>
											<tbody>
												{filteredData.map(item => (
													<tr key={item.reportId} className='border-b hover:bg-muted/50'>
														<td className='p-4'>{item.reportId}</td>
														<td className='p-4'>{formatDate(item.startDate)}</td>
														<td className='p-4'>{formatDate(item.endDate)}</td>
														<td className='p-4'>{formatDate(item.created_at)}</td>
														<td className='items-center justify-center p-4'>
															{item.full_name || 'Нет имени'}
														</td>
														<td className='p-4'>
															{item.last_changes || 'Изменений не было'}
														</td>
														<td className='p-4'>
															{item.last_change_date ? formatDate(item.last_change_date) : '—'}
														</td>
														<td className='p-4 text-right'>
															<Button
																variant='ghost'
																size='icon'
																className='mr-2'
																onClick={() => {
																	setSelectedReport(item)
																	setViewModalOpen(true)
																}}
															>
																<Eye className='h-4 w-4' />
															</Button>
															<Button
																variant='ghost'
																size='icon'
																className='text-red-500'
																onClick={() => {
																	setReportToDelete(item.id)
																	setDeleteDialogOpen(true)
																}}
															>
																<Trash2 className='h-4 w-4' />
															</Button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</ScrollArea>
							</CardContent>
						</Card>
					</div>
				</Dashboard>
			</SidebarDemo>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent className='bg-white dark:bg-neutral-900'>
					<AlertDialogHeader>
						<AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
						<AlertDialogDescription>
							Вы уверены, что хотите удалить этот отчет? После удаления данный отчет
							нельзя будет восстановить.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className='bg-black/25'>Отмена</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => reportToDelete && handleDelete(reportToDelete)}
							className='bg-red-500 text-white hover:bg-red-600'
						>
							Удалить
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
				<DialogContent className='fixed left-1/2 top-1/2 flex h-[80vh] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 transform flex-col bg-white p-0 dark:bg-neutral-900'>
					<div className='sticky top-0 z-50 border-b border-gray-700 bg-white dark:bg-neutral-900'>
						<DialogHeader className='p-6'>
							<div className='flex items-center justify-between'>
								<DialogTitle className='text-xl font-bold'>
									Просмотр данных отчета
								</DialogTitle>
								<div className='flex items-center gap-2'>
									<Button
										variant='outline'
										size='sm'
										onClick={handleExportToExcel}
										className='bg-white text-black hover:bg-green-500'
									>
										Экспорт в Excel
									</Button>
									<Button
										variant='ghost'
										size='sm'
										onClick={() => setViewModalOpen(false)}
										className='rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'
									>
										<X className='h-4 w-4' />
										<span className='sr-only'>Close</span>
									</Button>
								</div>
							</div>
						</DialogHeader>
					</div>

					<ScrollArea className='w-full flex-1'>
						<div className='p-6'>
							{selectedReport &&
							selectedReport.data &&
							selectedReport.data.data &&
							selectedReport.data.data.length > 0 ? (
								<div className='w-full'>
									<table className='w-full min-w-max border-collapse'>
										<thead>
											<tr className='border-b border-gray-700'>
												{COLUMN_ORDER.map(columnName => (
													<th
														key={columnName}
														className='sticky top-0 whitespace-nowrap bg-white p-4 text-left text-sm font-semibold dark:bg-neutral-900'
													>
														{columnName}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{selectedReport.data.data.map((row, index) => (
												<tr
													key={index}
													className='border-b border-gray-700 hover:bg-[#1f1f1f]/50'
												>
													{COLUMN_ORDER.map(columnName => {
														let value = row[columnName]
														const isEditing =
															editingCell?.rowIndex === index &&
															editingCell?.columnName === columnName
														const type = typeof value === 'number' ? 'number' : 'text'

														if (columnName === 'Дата' && value) {
															value = formatDate(value)
														}
														if (typeof value === 'number' && !isEditing) {
															value = value.toFixed(2)
														}

														return (
															<td key={columnName} className='whitespace-nowrap p-4 text-sm'>
																<EditableCell
																	value={value}
																	onChange={newValue =>
																		handleCellEdit(index, columnName, newValue)
																	}
																	type={type}
																	isEditing={isEditing}
																	onDoubleClick={() =>
																		setEditingCell({ rowIndex: index, columnName })
																	}
																	onBlur={() => setEditingCell(null)}
																/>
															</td>
														)
													})}
												</tr>
											))}
										</tbody>
									</table>
								</div>
							) : (
								<div className='p-4 text-center text-muted-foreground'>
									Нет данных для отображения
								</div>
							)}
						</div>
						<ScrollBar orientation='horizontal' />
						<ScrollBar orientation='vertical' />
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</div>
	)
}
