'use client'

import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Eye, Trash2, X } from 'lucide-react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'

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
}

export default function ReportsSettingsPage() {
	const [rawData, setRawData] = useState<ReportData[]>([])
	const [selectedReportId, setSelectedReportId] = useState<string>('all')
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [reportToDelete, setReportToDelete] = useState<number | null>(null)
	const [viewModalOpen, setViewModalOpen] = useState(false)
	const [selectedReport, setSelectedReport] = useState<ReportData | null>(
		null
	)

	const getReportLocation = (reportId: number): string => {
		const locationMap: { [key: number]: string } = {
			17: 'КРСН Газеты',
			30: 'КРСН Судостроительная',
			31: 'КРСН Мира',
			32: 'КРСН Металлургов',
			33: 'КРСН Кутузова',
			34: 'КРСН Вильского'
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

	const filteredData =
		selectedReportId === 'all'
			? rawData
			: rawData.filter(
					item => item.reportId.toString() === selectedReportId
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
			const fileName = `${locationName}_${format(
				new Date(),
				'dd-MM-yyyy'
			)}.xlsx`

			// Save the file
			XLSX.writeFile(wb, fileName)
		}
	}

	return (
		<div className='h-screen w-screen bg-white dark:bg-neutral-900'>
			<SidebarDemo>
				<Dashboard>
					<div className='h-full w-full p-4'>
						<Card className='h-full bg-white dark:bg-neutral-900'>
							<CardHeader>
								<CardTitle className='text-2xl font-bold'>
									История отчетов
								</CardTitle>
								<div className='mt-4 w-[250px]'>
									<Select
										value={selectedReportId}
										onValueChange={setSelectedReportId}
									>
										<SelectTrigger>
											<SelectValue placeholder='Выберите локацию' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='all'>
												Все отчеты
											</SelectItem>
											{[
												...new Set(
													rawData.map(
														item => item.reportId
													)
												)
											].map(id => (
												<SelectItem
													key={id}
													value={id.toString()}
												>
													{getReportLocation(id)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</CardHeader>
							<CardContent className='flex-1'>
								<ScrollArea className='h-[calc(100vh-250px)] w-full rounded-md border'>
									<div className='p-4'>
										<table className='w-full'>
											<thead>
												<tr className='border-b'>
													<th className='p-4 text-left'>
														ID отчета
													</th>
													<th className='p-4 text-left'>
														Дата начала
													</th>
													<th className='p-4 text-left'>
														Дата окончания
													</th>
													<th className='p-4 text-left'>
														Дата создания
													</th>
													<th className='p-4 text-left'>
														Пользователь
													</th>
													<th className='p-4 text-right'>
														Действия
													</th>
												</tr>
											</thead>
											<tbody>
												{filteredData.map(item => (
													<tr
														key={item.reportId}
														className='border-b hover:bg-muted/50'
													>
														<td className='p-4'>
															{item.reportId}
														</td>
														<td className='p-4'>
															{formatDate(
																item.startDate
															)}
														</td>
														<td className='p-4'>
															{formatDate(
																item.endDate
															)}
														</td>
														<td className='p-4'>
															{formatDate(
																item.created_at
															)}
														</td>
														<td className='items-center justify-center p-4'>
															{item.full_name ||
																'Нет имени'}
														</td>
														<td className='p-4 text-right'>
															<Button
																variant='ghost'
																size='icon'
																className='mr-2'
																onClick={() => {
																	setSelectedReport(
																		item
																	)
																	setViewModalOpen(
																		true
																	)
																}}
															>
																<Eye className='h-4 w-4' />
															</Button>
															<Button
																variant='ghost'
																size='icon'
																className='text-red-500'
																onClick={() => {
																	setReportToDelete(
																		item.id
																	)
																	setDeleteDialogOpen(
																		true
																	)
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

			<AlertDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
			>
				<AlertDialogContent className='bg-white dark:bg-neutral-900'>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Подтверждение удаления
						</AlertDialogTitle>
						<AlertDialogDescription>
							Вы уверены, что хотите удалить этот отчет? После
							удаления данный отчет нельзя будет восстановить.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className='bg-black/25'>
							Отмена
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={() =>
								reportToDelete && handleDelete(reportToDelete)
							}
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
												{COLUMN_ORDER.map(
													columnName => (
														<th
															key={columnName}
															className='sticky top-0 whitespace-nowrap bg-white p-4 text-left text-sm font-semibold dark:bg-neutral-900'
														>
															{columnName}
														</th>
													)
												)}
											</tr>
										</thead>
										<tbody>
											{selectedReport.data.data.map(
												(row, index) => (
													<tr
														key={index}
														className='border-b border-gray-700 hover:bg-[#1f1f1f]/50'
													>
														{COLUMN_ORDER.map(
															columnName => {
																let value =
																	row[
																		columnName
																	]
																if (
																	columnName ===
																		'Дата' &&
																	value
																) {
																	value =
																		formatDate(
																			value
																		)
																}
																if (
																	typeof value ===
																	'number'
																) {
																	value =
																		value.toFixed(
																			2
																		)
																}
																return (
																	<td
																		key={
																			columnName
																		}
																		className='whitespace-nowrap p-4 text-sm'
																	>
																		{value ===
																			null ||
																		value ===
																			undefined
																			? '—'
																			: value}
																	</td>
																)
															}
														)}
													</tr>
												)
											)}
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
