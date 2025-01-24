'use client'

import { addDays, format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'
import { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export function DateRangePicker({
	date,
	setDate
}: {
	date: DateRange | undefined
	setDate: (date: DateRange | undefined) => void
}) {
	return (
		<div className='grid gap-2'>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id='date'
						variant={'outline'}
						className={cn(
							'w-[300px] justify-start bg-white text-left font-normal dark:bg-neutral-900',
							!date && 'text-muted-foreground'
						)}
					>
						<CalendarIcon className='mr-2 h-4 w-4' />
						{date?.from ? (
							date.to ? (
								<>
									{format(date.from, 'dd.MM.yyyy', {
										locale: ru
									})}{' '}
									-{' '}
									{format(date.to, 'dd.MM.yyyy', {
										locale: ru
									})}
								</>
							) : (
								format(date.from, 'dd.MM.yyyy', { locale: ru })
							)
						) : (
							<span>Выберите период</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-auto p-0' align='start'>
					<Calendar
						mode='range'
						defaultMonth={date?.from}
						selected={date}
						onSelect={setDate}
						numberOfMonths={2}
					/>
				</PopoverContent>
			</Popover>
		</div>
	)
}
