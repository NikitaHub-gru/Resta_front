import { format } from 'date-fns'
import {
	ChevronDown,
	ChevronRight,
	Filter,
	Maximize2,
	Minimize2,
	Search,
	X,
	XCircle
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface JsonRowItem {
	[category: string]: {
		[key: string]: number
	}
}

interface JsonData {
	columns: TableColumn[]
	data: TableData[]
}

interface TableData {
	'ТОРГОВОЕ ПРЕДПРИЯТИЕ'?: string
	ГРУППА?: string
	ОПИСАНИЕ?: string
	Значение: number
	level: number
	items?: TableData[]
	[key: string]: string | number | TableData[] | undefined | null
}

interface TableColumn {
	key: string
	title: string
	width?: number
	filterable?: boolean
}

const SheetTable = () => {
	const [tableData, setTableData] = useState<TableData[]>([])
	const [columns, setColumns] = useState<TableColumn[]>([])
	const [isFullScreen, setIsFullScreen] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedGroup, setSelectedGroup] = useState<string>('')
	const [filters, setFilters] = useState<Record<string, string>>({})
	const [activeFilter, setActiveFilter] = useState<string | null>(null)
	const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
	const [startDate, setStartDate] = useState(new Date())
	const [endDate, setEndDate] = useState(new Date())
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const uniqueValues = useMemo(() => {
		return columns.reduce(
			(acc, col) => {
				if (col.filterable) {
					acc[col.key] = [...new Set(tableData.map(item => item[col.key]))].filter(
						Boolean
					)
				}
				return acc
			},
			{} as Record<string, any[]>
		)
	}, [tableData, columns])

	const filteredData = useMemo(() => {
		return tableData.filter(row => {
			// Поиск по всем полям
			if (searchTerm) {
				const searchableValue = Object.values(row)
					.filter(val => typeof val !== 'object')
					.join(' ')
					.toLowerCase()
				if (!searchableValue.includes(searchTerm.toLowerCase())) {
					return false
				}
			}

			// Фильтр по группе из выпадающего списка
			if (selectedGroup) {
				if (row.level === 0) {
					// Показываем предприятие, если у него есть дочерние элементы с выбранной группой
					return tableData.some(
						item =>
							item.level > 0 &&
							item['ТОРГОВОЕ ПРЕДПРИЯТИЕ'] === row['ТОРГОВОЕ ПРЕДПРИЯТИЕ'] &&
							item.ГРУППА === selectedGroup
					)
				}

				// Показываем элементы выбранной группы и их дочерние элементы
				if (row.level === 1) {
					return row.ГРУППА === selectedGroup
				}

				// Для уровня 2 (описания) показываем, если родительская группа совпадает
				if (row.level === 2) {
					return tableData.some(
						parent =>
							parent.level === 1 &&
							parent.ГРУППА === selectedGroup &&
							parent['ТОРГОВОЕ ПРЕДПРИЯТИЕ'] === row['ТОРГОВОЕ ПРЕДПРИЯТИЕ'] &&
							parent.ГРУППА === row.ГРУППА
					)
				}
			}

			// Применяем фильтры колонок
			return Object.entries(filters).every(([key, value]) => {
				if (!value) return true
				const rowValue = row[key]
				if (!rowValue) return false
				return rowValue.toString().toLowerCase().includes(value.toLowerCase())
			})
		})
	}, [tableData, filters, searchTerm, selectedGroup])

	const processedData = useMemo(() => {
		const result: TableData[] = []
		let currentEnterprise: string | null = null

		filteredData.forEach(row => {
			if (row.level === 0) {
				currentEnterprise = row['ТОРГОВОЕ ПРЕДПРИЯТИЕ'] as string
				result.push(row)
			} else if (row.level === 1) {
				const groupId = `${currentEnterprise}-${row.ГРУППА}`

				// Добавляем группу
				const groupRow = {
					...row,
					'ТОРГОВОЕ ПРЕДПРИЯТИЕ': '',
					Значение: collapsedGroups.has(groupId)
						? filteredData
								.filter(
									item =>
										item.level === 2 &&
										item['ТОРГОВОЕ ПРЕДПРИЯТИЕ'] === currentEnterprise &&
										item.ГРУППА === row.ГРУППА
								)
								.reduce((sum, item) => sum + (item.Значение || 0), 0)
						: row.Значение
				}
				result.push(groupRow)

				// Добавляем дочерние элементы если группа не свернута
				if (!collapsedGroups.has(groupId)) {
					const children = filteredData.filter(
						item =>
							item.level === 2 &&
							item['ТОРГОВОЕ ПРЕДПРИЯТИЕ'] === currentEnterprise &&
							item.ГРУППА === row.ГРУППА
					)
					result.push(
						...children.map(child => ({
							...child,
							'ТОРГОВОЕ ПРЕДПРИЯТИЕ': '',
							ГРУППА: ''
						}))
					)
				}
			}
		})

		return result
	}, [filteredData, collapsedGroups])

	const fetchData = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)

			const formattedStartDate = format(startDate, 'yyyy-MM-dd')
			const formattedEndDate = format(endDate, 'yyyy-MM-dd')

			const response = await fetch(
				`https://nikitahub-gru-resta-back-f1fb.twc1.net/olap/get_olap_sec?start_date=${formattedStartDate}&end_date=${formattedEndDate}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)

			if (!response.ok) {
				throw new Error('Ошибка при загрузке данных')
			}

			const jsonData = await response.json()

			setColumns(jsonData.columns)

			const groupedData: TableData[] = []
			const processItems = (items: TableData[], parentItem?: TableData) => {
				items.forEach(item => {
					const newItem: TableData = {
						...item,
						'ТОРГОВОЕ ПРЕДПРИЯТИЕ': parentItem
							? parentItem['ТОРГОВОЕ ПРЕДПРИЯТИЕ']
							: item['ТОРГОВОЕ ПРЕДПРИЯТИЕ'],
						ГРУППА: item.ГРУППА || parentItem?.ГРУППА || ''
					}

					const { items: _, ...itemWithoutNested } = newItem
					groupedData.push(itemWithoutNested)

					if (item.items && item.items.length > 0) {
						processItems(item.items, newItem)
					}
				})
			}

			processItems(jsonData.data)
			setTableData(groupedData)

			setFilters(
				Object.fromEntries(
					jsonData.columns
						.filter((col: TableColumn) => col.filterable)
						.map((col: TableColumn) => [col.key, ''])
				)
			)
		} catch (error) {
			console.error('Ошибка при загрузке данных:', error)
			setError(error instanceof Error ? error.message : 'Произошла ошибка')
			setTableData([])
		} finally {
			setIsLoading(false)
		}
	}, [startDate, endDate])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	const exportToExcel = () => {
		const ws = XLSX.utils.json_to_sheet(tableData)
		const wb = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(wb, ws, 'Report')
		XLSX.writeFile(wb, 'report.xlsx')
	}

	const resetFilters = () => {
		setFilters(
			Object.fromEntries(
				columns.filter(col => col.filterable).map(col => [col.key, ''])
			)
		)
		setActiveFilter(null)
	}

	const resetColumnFilter = (column: string) => {
		setFilters(prev => ({ ...prev, [column]: '' }))
		setActiveFilter(null)
	}

	const toggleFullScreen = () => {
		setIsFullScreen(!isFullScreen)
		document.body.style.overflow = !isFullScreen ? 'hidden' : 'auto'
	}

	const toggleGroup = (groupId: string) => {
		setCollapsedGroups(prev => {
			const next = new Set(prev)
			if (next.has(groupId)) {
				next.delete(groupId)
			} else {
				next.add(groupId)
			}
			return next
		})
	}

	const FilterPopover = ({ column }: { column: string }) => (
		<div className='absolute left-0 top-full z-50 mt-1 w-48 rounded-md border bg-white p-2 shadow-lg'>
			<div className='mb-2 flex items-center gap-2'>
				<Search className='h-4 w-4 text-muted-foreground' />
				<input
					className='w-full rounded border p-1 text-xs'
					placeholder='Поиск...'
					value={filters[column]}
					onChange={e => setFilters(prev => ({ ...prev, [column]: e.target.value }))}
				/>
				{filters[column] && (
					<button
						className='text-muted-foreground hover:text-foreground'
						onClick={() => resetColumnFilter(column)}
					>
						<XCircle className='h-4 w-4' />
					</button>
				)}
			</div>
			<div className='max-h-40 overflow-auto'>
				{uniqueValues[column].map(value => (
					<div
						key={value}
						className='cursor-pointer rounded px-2 py-1 text-xs hover:bg-gray-100'
						onClick={() => {
							setFilters(prev => ({ ...prev, [column]: value }))
							setActiveFilter(null)
						}}
					>
						{value}
					</div>
				))}
			</div>
		</div>
	)

	return (
		<>
			<div className='w-full'>
				<div className='mb-4 flex items-center justify-between gap-4'>
					<div className='flex items-center gap-2'>
						<Button onClick={exportToExcel} variant='outline'>
							Экспорт в Excel
						</Button>
						<Button onClick={toggleFullScreen} variant='outline' size='icon'>
							<Maximize2 className='h-4 w-4' />
						</Button>
						{Object.values(filters).some(Boolean) && (
							<Button onClick={resetFilters} variant='outline' size='sm'>
								Сбросить все фильтры
								<X className='ml-2 h-3 w-3' />
							</Button>
						)}
						<input
							type='date'
							className='rounded-md border p-2'
							value={format(startDate, 'yyyy-MM-dd')}
							onChange={e => setStartDate(new Date(e.target.value))}
						/>
						<input
							type='date'
							className='rounded-md border p-2'
							value={format(endDate, 'yyyy-MM-dd')}
							onChange={e => setEndDate(new Date(e.target.value))}
						/>
						<Button onClick={fetchData} variant='outline'>
							Обновить
						</Button>
					</div>
					<div className='flex items-center gap-4'>
						<div className='relative'>
							<Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
							<Input
								placeholder='Поиск...'
								className='pl-8'
								value={searchTerm}
								onChange={e => setSearchTerm(e.target.value)}
							/>
						</div>
						<select
							className='rounded-md border p-2'
							value={selectedGroup}
							onChange={e => setSelectedGroup(e.target.value)}
						>
							<option value=''>Все группы</option>
							{[...new Set(tableData.map(item => item.ГРУППА))]
								.filter(Boolean)
								.map(group => (
									<option key={group} value={group}>
										{group}
									</option>
								))}
						</select>
					</div>
				</div>

				{isLoading && <div className='flex justify-center p-4'>Загрузка...</div>}

				{error && <div className='p-4 text-red-500'>{error}</div>}

				<ScrollArea className='h-[600px] rounded-md border' type='scroll'>
					<div className='min-w-max'>
						<table className='w-full border-collapse text-xs'>
							<thead className='sticky top-0 bg-gray-100'>
								<tr>
									{columns.map(column => (
										<th
											key={column.key}
											className='border p-1 text-left'
											style={{ minWidth: column.width || 120 }}
										>
											<div className='flex items-center justify-between'>
												<span>{column.title}</span>
												{column.filterable && (
													<button
														className={`ml-2 rounded p-0.5 hover:bg-gray-200 ${
															filters[column.key] ? 'text-blue-500' : ''
														}`}
														onClick={() =>
															setActiveFilter(activeFilter === column.key ? null : column.key)
														}
													>
														<Filter className='h-3 w-3' />
													</button>
												)}
											</div>
											{activeFilter === column.key && column.filterable && (
												<FilterPopover column={column.key} />
											)}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{processedData.map((row, idx) => (
									<tr key={idx} className='hover:bg-gray-50'>
										{columns.map(column => (
											<td
												key={column.key}
												className={`border p-1 ${
													column.key === columns[0].key ? 'font-medium' : ''
												}`}
												style={{
													paddingLeft: row.level ? `${row.level * 0.75}rem` : undefined,
													textAlign: typeof row[column.key] === 'number' ? 'right' : 'left'
												}}
											>
												{row.level === 1 && column.key === 'ГРУППА' && (
													<button
														onClick={() =>
															toggleGroup(`${row['ТОРГОВОЕ ПРЕДПРИЯТИЕ']}-${row.ГРУППА}`)
														}
														className='mr-2 inline-flex items-center'
													>
														{collapsedGroups.has(
															`${row['ТОРГОВОЕ ПРЕДПРИЯТИЕ']}-${row.ГРУППА}`
														) ? (
															<ChevronRight className='h-4 w-4' />
														) : (
															<ChevronDown className='h-4 w-4' />
														)}
													</button>
												)}
												{row[column.key]?.toString()}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<ScrollBar orientation='horizontal' />
					<ScrollBar orientation='vertical' />
				</ScrollArea>
			</div>

			{isFullScreen && (
				<div className='fixed inset-0 z-50 flex flex-col bg-white'>
					<div className='flex items-center justify-between border-b p-4'>
						<h2 className='text-lg font-semibold'>Детальный просмотр</h2>
						<div className='flex items-center gap-2'>
							<Button onClick={toggleFullScreen} variant='outline' size='icon'>
								<X className='h-4 w-4' />
							</Button>
						</div>
					</div>

					<div className='flex-1 p-4'>
						<div className='mb-4 flex items-center gap-4'>
							<div className='relative'>
								<Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
								<Input
									placeholder='Поиск...'
									className='pl-8'
									value={searchTerm}
									onChange={e => setSearchTerm(e.target.value)}
								/>
							</div>
							<select
								className='rounded-md border p-2'
								value={selectedGroup}
								onChange={e => setSelectedGroup(e.target.value)}
							>
								<option value=''>Все группы</option>
								{[...new Set(tableData.map(item => item.ГРУППА))]
									.filter(Boolean)
									.map(group => (
										<option key={group} value={group}>
											{group}
										</option>
									))}
							</select>
						</div>

						<ScrollArea
							className='h-[calc(100vh-12rem)] rounded-md border'
							type='scroll'
						>
							<div className='min-w-max'>
								<table className='w-full border-collapse text-xs'>
									<thead className='sticky top-0 bg-gray-100'>
										<tr>
											{columns.map(column => (
												<th
													key={column.key}
													className='border p-1 text-left'
													style={{ minWidth: column.width || 120 }}
												>
													<div className='flex items-center justify-between'>
														<span>{column.title}</span>
														{column.filterable && (
															<button
																className={`ml-2 rounded p-0.5 hover:bg-gray-200 ${
																	filters[column.key] ? 'text-blue-500' : ''
																}`}
																onClick={() =>
																	setActiveFilter(
																		activeFilter === column.key ? null : column.key
																	)
																}
															>
																<Filter className='h-3 w-3' />
															</button>
														)}
													</div>
													{activeFilter === column.key && column.filterable && (
														<FilterPopover column={column.key} />
													)}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{processedData.map((row, idx) => (
											<tr key={idx} className='hover:bg-gray-50'>
												{columns.map(column => (
													<td
														key={column.key}
														className={`border p-1 ${
															column.key === columns[0].key ? 'font-medium' : ''
														}`}
														style={{
															paddingLeft: row.level ? `${row.level * 0.75}rem` : undefined,
															textAlign: typeof row[column.key] === 'number' ? 'right' : 'left'
														}}
													>
														{row.level === 1 && column.key === 'ГРУППА' && (
															<button
																onClick={() =>
																	toggleGroup(`${row['ТОРГОВОЕ ПРЕДПРИЯТИЕ']}-${row.ГРУППА}`)
																}
																className='mr-2 inline-flex items-center'
															>
																{collapsedGroups.has(
																	`${row['ТОРГОВОЕ ПРЕДПРИЯТИЕ']}-${row.ГРУППА}`
																) ? (
																	<ChevronRight className='h-4 w-4' />
																) : (
																	<ChevronDown className='h-4 w-4' />
																)}
															</button>
														)}
														{row[column.key]?.toString()}
													</td>
												))}
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<ScrollBar orientation='horizontal' />
							<ScrollBar orientation='vertical' />
						</ScrollArea>
					</div>
				</div>
			)}
		</>
	)
}

export default SheetTable
