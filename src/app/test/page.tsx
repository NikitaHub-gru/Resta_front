'use client'

import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

type BaseReservation = {
	startTime: string
	endTime: string
	clientName: string
	phone: string
	comment: string
	date: Date
}

type SingleTableReservation = BaseReservation & {
	type: 'banquet' | 'reserve'
	tableNumber: number
	tableId: string
}

type CombinedTableReservation = BaseReservation & {
	type: 'combined'
	tableNumbers: number[]
}

type Reservation = SingleTableReservation | CombinedTableReservation

export default function TestOrderPage() {
	const [selectedReservation, setSelectedReservation] =
		useState<Reservation | null>(null)
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [date, setDate] = useState<Date>(new Date())

	// Time slots from 14:00 to 21:30 with 30-minute intervals
	const timeSlots = Array.from({ length: 16 }, (_, i) => {
		const hour = Math.floor(i / 2) + 14
		const minutes = (i % 2) * 30
		return `${hour}:${minutes.toString().padStart(2, '0')}`
	})

	// Table numbers from 1 to 16
	const tables = Array.from({ length: 16 }, (_, i) => i + 1)

	// Mock reservations data (will be replaced with API data later)
	const mockReservations: Reservation[] = [
		{
			type: 'banquet',
			tableNumber: 5,
			startTime: '18:30',
			endTime: '19:30',
			clientName: 'Иванов Иван Иванович',
			phone: '+79994445545',
			tableId: 'N5',
			comment: '',
			date: new Date()
		},
		{
			type: 'reserve',
			tableNumber: 3,
			startTime: '16:00',
			endTime: '17:00',
			clientName: 'Петров Петр Петрович',
			phone: '+79993334444',
			tableId: 'N3',
			comment: '',
			date: new Date(new Date().setDate(new Date().getDate() + 1)) // Tomorrow
		},
		{
			type: 'combined',
			tableNumbers: [8, 9, 10],
			startTime: '16:00',
			endTime: '17:00',
			clientName: 'Сидоров Сидор Сидорович',
			phone: '+79992223333',
			comment: 'Объединение столов',
			date: new Date(new Date().setDate(new Date().getDate() + 2)) // Day after tomorrow
		}
	]

	const getReservationForCell = (tableNum: number, time: string) => {
		for (const reservation of mockReservations) {
			const timeValue = parseInt(time.split(':').join(''))
			const startValue = parseInt(reservation.startTime.split(':').join(''))
			const endValue = parseInt(reservation.endTime.split(':').join(''))
			const isTimeMatch = timeValue >= startValue && timeValue < endValue
			const isDateMatch =
				format(reservation.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
			const isFirstTimeSlot = timeValue === startValue
			const isLastTimeSlot =
				parseInt(time.split(':')[0] + time.split(':')[1]) + 30 ===
				parseInt(
					reservation.endTime.split(':')[0] + reservation.endTime.split(':')[1]
				)

			if (!isDateMatch) continue

			if (reservation.type === 'combined') {
				if (reservation.tableNumbers.includes(tableNum) && isTimeMatch) {
					return {
						reserved: true,
						type: 'combined',
						reservation,
						isFirstTimeSlot,
						isLastTimeSlot
					}
				}
			} else if (reservation.tableNumber === tableNum && isTimeMatch) {
				return {
					reserved: true,
					type: reservation.type,
					reservation,
					isFirstTimeSlot,
					isLastTimeSlot
				}
			}
		}
		return {
			reserved: false,
			type: null,
			reservation: null,
			isFirstTimeSlot: false,
			isLastTimeSlot: false
		}
	}

	const handleCellClick = (tableNum: number, time: string) => {
		const { reservation } = getReservationForCell(tableNum, time)
		if (reservation) {
			setSelectedReservation(reservation)
			setIsDialogOpen(true)
		}
	}

	return (
		<div className='container mx-auto p-6'>
			<div className='mb-6 flex items-center justify-between'>
				<h1 className='text-2xl font-bold'>Бронирование банкетов</h1>
				<div className='flex items-center gap-4'>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant='outline'
								className='justify-start text-left font-normal'
							>
								<CalendarIcon className='mr-2 h-4 w-4' />
								{format(date, 'd MMMM yyyy', { locale: ru })}
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-auto p-0'>
							<Calendar
								mode='single'
								selected={date}
								onSelect={date => date && setDate(date)}
								locale={ru}
							/>
						</PopoverContent>
					</Popover>
					<div className='flex gap-2'>
						<Button
							variant='outline'
							size='icon'
							onClick={() => {
								const newDate = new Date(date)
								newDate.setDate(date.getDate() - 1)
								setDate(newDate)
							}}
						>
							<ChevronLeft className='h-4 w-4' />
						</Button>
						<Button
							variant='outline'
							size='icon'
							onClick={() => {
								const newDate = new Date(date)
								newDate.setDate(date.getDate() + 1)
								setDate(newDate)
							}}
						>
							<ChevronRight className='h-4 w-4' />
						</Button>
					</div>
				</div>
			</div>

			{/* Legend */}
			<div className='mb-6 flex items-center gap-8'>
				<div className='flex items-center gap-2'>
					<div className='h-6 w-6 bg-purple-500'></div>
					<span>Банкет</span>
				</div>
				<div className='flex items-center gap-2'>
					<div className='h-6 w-6 bg-amber-400'></div>
					<span>Резерв</span>
				</div>
				<div className='flex items-center gap-2'>
					<div className='h-6 w-6 bg-orange-500'></div>
					<span>Объединенные столы</span>
				</div>
			</div>

			<Card className='p-4'>
				<ScrollArea className='h-[calc(100vh-280px)]'>
					<div className='relative'>
						{/* Time header */}
						<div className='sticky top-0 z-10 flex bg-white dark:bg-neutral-950'>
							<div className='w-20 flex-shrink-0 border-b border-r p-1 text-sm font-semibold'>
								Стол
							</div>
							{timeSlots.map(time => (
								<div
									key={time}
									className='w-20 flex-shrink-0 border-b border-r p-1 text-center text-sm font-semibold'
								>
									{time}
								</div>
							))}
						</div>

						{/* Table rows */}
						{tables.map(tableNum => (
							<div key={tableNum} className='flex'>
								<div className='w-20 flex-shrink-0 border-b border-r p-1 text-sm'>
									Стол №{tableNum}
								</div>
								{timeSlots.map(time => {
									const { reserved, type, isFirstTimeSlot, isLastTimeSlot } =
										getReservationForCell(tableNum, time)
									return (
										<div
											key={`${tableNum}-${time}`}
											className={`group relative w-20 flex-shrink-0 transition-colors ${!reserved ? 'border-b border-r' : ''} ${
												reserved
													? `cursor-pointer ${isFirstTimeSlot ? '' : '-ml-[1px]'} ${
															type === 'banquet'
																? 'bg-purple-500 hover:bg-purple-600'
																: type === 'reserve'
																	? 'bg-amber-400 hover:bg-amber-500'
																	: 'bg-orange-500 hover:bg-orange-600'
														}`
													: 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
											} ${reserved && !isLastTimeSlot ? 'border-r-0' : ''} ${reserved ? 'border-b border-t' : ''}`}
											onClick={() => handleCellClick(tableNum, time)}
										>
											<div className='flex h-8 items-center justify-center'>
												{reserved && isFirstTimeSlot && (
													<div className='invisible absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:visible'>
														<Eye className='h-3 w-3 text-white' />
													</div>
												)}
											</div>
										</div>
									)
								})}
							</div>
						))}
					</div>
				</ScrollArea>
			</Card>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>
							{selectedReservation?.type === 'banquet'
								? 'Банкет'
								: selectedReservation?.type === 'reserve'
									? 'Резерв'
									: 'Объединенные столы'}
						</DialogTitle>
					</DialogHeader>
					<div className='grid gap-4 py-4'>
						<div className='grid grid-cols-2 gap-4'>
							<div className='font-medium'>Дата:</div>
							<div>
								{selectedReservation &&
									format(selectedReservation.date, 'd MMMM yyyy', { locale: ru })}
							</div>
							<div className='font-medium'>Начало:</div>
							<div>{selectedReservation?.startTime}</div>
							<div className='font-medium'>Окончание:</div>
							<div>{selectedReservation?.endTime}</div>
							<div className='font-medium'>ФИО клиента:</div>
							<div>{selectedReservation?.clientName}</div>
							<div className='font-medium'>Номер телефона:</div>
							<div>{selectedReservation?.phone}</div>
							<div className='font-medium'>
								{selectedReservation?.type === 'combined'
									? 'Номера столов:'
									: 'Номер стола:'}
							</div>
							<div>
								{selectedReservation?.type === 'combined'
									? selectedReservation.tableNumbers.map(num => `№${num}`).join(', ')
									: selectedReservation?.tableId}
							</div>
							{selectedReservation?.comment && (
								<>
									<div className='font-medium'>Комментарий:</div>
									<div>{selectedReservation.comment}</div>
								</>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
