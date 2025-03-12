import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon, ClockAlert, RussianRuble, Waypoints } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import React from 'react'

import { Button } from './button'
import { SheetClose, SheetFooter } from './sheet'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import { collectAndProcessGrcData } from '@/hooks/calcul-grc'
import { supabase } from '@/lib/supabase'

interface CourierEntry {
	kmPerDay: string
	deductions: string
	personnelDelivery: string
	minutsDel: string
}

interface GlobalSettings {
	hourlyWage: string
	checkWage: string
	fuelExpense: string
	speedBonus: string
	date: string
}

interface ProcessedGrcData {
	hourlyWage: string
	checkWage: string
	fuelExpense: string
	speedBonus: string
	couriers: {
		[courierName: string]: CourierEntry[]
	}
	inputData: any[]
	serverResponse?: any[]
}

interface GrcPageProps {
	data: any[]
	report_id: string
	onCalculate?: (processedData: ProcessedGrcData) => void
}

export default function GrcPage({
	data,
	report_id,
	onCalculate
}: GrcPageProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const courierNames = Array.from(new Set(data.map(item => item['ФИО Курьера'])))
		.filter(name => name)
		.sort()

	// State for global settings
	const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
		hourlyWage: '',
		checkWage: '',
		fuelExpense: '',
		speedBonus: '',
		date: ''
	})

	// State for courier-specific data
	const [courierData, setCourierData] = useState<{
		[key: string]: CourierEntry[]
	}>(() => {
		const initialData: { [key: string]: CourierEntry[] } = {}
		courierNames.forEach(name => {
			if (name) {
				initialData[name] = [
					{
						kmPerDay: '',
						deductions: '',
						personnelDelivery: '',
						minutsDel: ''
					}
				]
			}
		})
		return initialData
	})

	// State for checking if settings are expired
	const [isSettingsExpired, setIsSettingsExpired] = useState(false)

	// Добавим новые состояния
	const [showCalendar, setShowCalendar] = useState(false)
	const [newDate, setNewDate] = useState<Date | undefined>(undefined)

	// Добавим состояние для Dialog
	const [isDialogOpen, setIsDialogOpen] = useState(false)

	const router = useRouter()

	// Handle global settings changes
	const handleGlobalChange =
		(field: keyof GlobalSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
			setGlobalSettings(prev => ({
				...prev,
				[field]: e.target.value
			}))
		}

	// Handle courier-specific data changes
	const handleCourierChange =
		(courierName: string, index: number, field: keyof CourierEntry) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setCourierData(prev => ({
				...prev,
				[courierName]: prev[courierName].map((entry, i) =>
					i === index ? { ...entry, [field]: e.target.value } : entry
				)
			}))
		}

	const handleCalculate = useCallback(async () => {
		if (isSubmitting) return

		try {
			setIsSubmitting(true)

			const processedData = {
				hourlyWage: globalSettings.hourlyWage,
				checkWage: globalSettings.checkWage,
				fuelExpense: globalSettings.fuelExpense,
				speedBonus: globalSettings.speedBonus,
				couriers: courierData,
				inputData: data
			}

			const response = await fetch(
				'https://nikitahub-gru-resta-back-c88a.twc1.net/olap/send_grc',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(processedData)
				}
			)

			if (!response.ok) {
				throw new Error('Network response was not ok')
			}

			const responseData = await response.json()
			console.log('Success:', responseData)

			// Если есть данные от сервера и они в правильном формате
			if (responseData && responseData.data && Array.isArray(responseData.data)) {
				// Вызываем onCalculate с полученными данными
				if (onCalculate) {
					onCalculate({
						...processedData,
						serverResponse: responseData.data // Добавляем данные от сервера
					})
				}
			}

			// Закрываем окно
			const closeButton = document.querySelector(
				'.sheet-close-button'
			) as HTMLButtonElement
			if (closeButton) {
				setTimeout(() => {
					closeButton.click()
				}, 100)
			}
		} catch (error) {
			console.error('Error sending data:', error)
		} finally {
			setIsSubmitting(false)
		}
	}, [globalSettings, courierData, onCalculate, data, isSubmitting])

	// Модифицируем useEffect для проверки даты
	useEffect(() => {
		const fetchSettings = async () => {
			try {
				const { data: settings, error } = await supabase
					.from('static')
					.select('*')
					.eq('report_id', report_id)
					.single()

				if (error) throw error

				if (settings) {
					const settingsDate = new Date(settings.mouth)
					const currentDate = new Date()
					setIsSettingsExpired(currentDate > settingsDate)

					setGlobalSettings({
						hourlyWage: settings.zp_hours?.toString() || '',
						checkWage: settings.zp_orders?.toString() || '',
						fuelExpense: settings.zp_gsm?.toString() || '',
						speedBonus: settings.speed_bonus?.toString() || '',
						date: settings.mouth
							? format(new Date(settings.mouth), 'dd MMMM yyyy', { locale: ru })
							: ''
					})
				}
			} catch (error) {
				console.error('Error fetching settings:', error)
			}
		}

		if (report_id) {
			fetchSettings()
		}
	}, [report_id])

	// Добавим функцию обновления даты
	const handleUpdateDate = async () => {
		if (!newDate) return

		try {
			const { error } = await supabase
				.from('static')
				.update({ mouth: format(newDate, 'yyyy-MM-dd') })
				.eq('report_id', report_id)

			if (error) throw error

			// Обновляем состояние и скрываем сообщение об истечении
			setGlobalSettings(prev => ({
				...prev,
				date: format(newDate, 'dd MMMM yyyy', { locale: ru })
			}))
			setShowCalendar(false)
			setIsSettingsExpired(false)
		} catch (error) {
			console.error('Error updating date:', error)
		}
	}

	// Добавляем функцию проверки заполненности данных
	const isDataEmpty = useCallback(() => {
		return (
			!globalSettings.hourlyWage ||
			!globalSettings.checkWage ||
			!globalSettings.fuelExpense ||
			!globalSettings.speedBonus ||
			Object.values(courierData).some(entries =>
				entries.some(
					entry =>
						!entry.kmPerDay ||
						!entry.deductions ||
						!entry.personnelDelivery ||
						!entry.minutsDel
				)
			)
		)
	}, [globalSettings, courierData])

	return (
		<div className='relative flex h-[900px] max-h-[720px] min-h-[600px]'>
			<ScrollArea className='w-full'>
				<div className='space-y-6 p-4 pb-24'>
					<h1 className='flex justify-center text-2xl font-semibold'>Курьеры</h1>
					<p className='flex items-center justify-center'>Для всех курьеров</p>

					{/* Settings Card - Made more compact */}
					{isSettingsExpired ? (
						<Card className='mx-auto max-w-[600px]'>
							<CardContent className='p-3'>
								<CardTitle className='mb-2 text-center text-sm'>
									Настройки устарели (действовали до {globalSettings.date})
								</CardTitle>
								<div className='flex justify-center gap-4'>
									{!showCalendar ? (
										<>
											<Button variant='outline' onClick={() => setShowCalendar(true)}>
												Перезаписать
											</Button>
											<Button onClick={() => router.push(`/report-settings/${report_id}`)}>
												Изменить
											</Button>
										</>
									) : (
										<div className='space-y-4'>
											<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
												<DialogTrigger asChild>
													<Button variant='outline' className='w-full'>
														<CalendarIcon className='mr-2 h-4 w-4' />
														{newDate ? format(newDate, 'dd.MM.yyyy') : 'Выберите дату'}
													</Button>
												</DialogTrigger>
												<DialogContent className='flex w-auto flex-col items-center justify-center p-0'>
													<div className='w-full border-b p-4 text-center'>
														<h2 className='font-medium'>Выберите новую дату</h2>
													</div>
													<div className='p-4'>
														<Calendar
															mode='single'
															selected={newDate}
															onSelect={date => {
																setNewDate(date)
																setIsDialogOpen(false) // Закрываем Dialog после выбора даты
															}}
															locale={ru}
														/>
													</div>
												</DialogContent>
											</Dialog>
											{newDate && (
												<div className='flex justify-center gap-2'>
													<Button variant='outline' onClick={() => setShowCalendar(false)}>
														Отмена
													</Button>
													<Button onClick={handleUpdateDate}>Обновить данные</Button>
												</div>
											)}
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					) : globalSettings.hourlyWage ? (
						<Card className='mx-auto max-w-full'>
							<CardContent className='p-3'>
								<CardTitle className='mb-2 text-center text-sm'>
									Данные актуальные до {globalSettings.date}
								</CardTitle>
								<Table>
									<TableBody>
										<TableRow>
											<TableCell className='font-medium'>З/П Часовая</TableCell>
											<TableCell>{globalSettings.hourlyWage}</TableCell>
											<TableCell className='w-[40px]'>
												<RussianRuble color='green' size={20} />
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell className='font-medium'>З/П по чекам</TableCell>
											<TableCell>{globalSettings.checkWage}</TableCell>
											<TableCell className='w-[40px]'>
												<RussianRuble color='green' size={20} />
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell className='font-medium'>ГСМ</TableCell>
											<TableCell>{globalSettings.fuelExpense}</TableCell>
											<TableCell className='w-[40px]'>
												<RussianRuble color='green' size={20} />
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell className='font-medium'>Бонус за скорость</TableCell>
											<TableCell>{globalSettings.speedBonus}</TableCell>
											<TableCell className='w-[40px]'>
												<RussianRuble color='green' size={20} />
											</TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					) : (
						<Card className='mx-auto max-w-[600px]'>
							<CardContent className='p-6'>
								<div className='flex flex-col items-center gap-4'>
									<CardTitle className='text-center'>
										Необходимо заполнить данные
									</CardTitle>
									<Button
										onClick={() => router.push(`/report-settings/${report_id}`)}
										className='w-full max-w-[200px]'
									>
										Заполнить данные
									</Button>
								</div>
							</CardContent>
						</Card>
					)}

					<p className='flex items-center justify-center'>Для каждого курьера</p>
					{/* Restructured courier cards grid */}
					<div className='w-full overflow-x-auto'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className='w-[200px]'>ФИО Курьера</TableHead>
									<TableHead>КМ за день</TableHead>
									<TableHead>Удержания</TableHead>
									<TableHead>Доставка персонала</TableHead>
									<TableHead>Доставлено за 30 мин</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{courierNames.map((courierName, index) => (
									<TableRow key={index}>
										<TableCell className='font-medium'>{courierName}</TableCell>
										{courierData[courierName]?.map((entry, entryIndex) => (
											<React.Fragment key={entryIndex}>
												<TableCell>
													<div className='flex items-center gap-2'>
														<Input
															className='w-[135px]'
															placeholder='Введите данные'
															value={entry.kmPerDay}
															onChange={handleCourierChange(
																courierName,
																entryIndex,
																'kmPerDay'
															)}
														/>
														<Waypoints color='green' size={16} />
													</div>
												</TableCell>
												<TableCell>
													<div className='flex items-center gap-2'>
														<Input
															className='w-[135px]'
															placeholder='Введите данные'
															value={entry.deductions}
															onChange={handleCourierChange(
																courierName,
																entryIndex,
																'deductions'
															)}
														/>
														<RussianRuble color='green' size={16} />
													</div>
												</TableCell>
												<TableCell>
													<div className='flex items-center gap-2'>
														<Input
															className='w-[135px]'
															placeholder='Введите данные'
															value={entry.personnelDelivery}
															onChange={handleCourierChange(
																courierName,
																entryIndex,
																'personnelDelivery'
															)}
														/>
														<RussianRuble color='green' size={16} />
													</div>
												</TableCell>
												<TableCell>
													<div className='flex items-center gap-2'>
														<Input
															className='w-[135px]'
															placeholder='Введите данные'
															value={entry.minutsDel}
															onChange={handleCourierChange(
																courierName,
																entryIndex,
																'minutsDel'
															)}
														/>
														<ClockAlert color='green' size={16} />
													</div>
												</TableCell>
											</React.Fragment>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>

				{isSettingsExpired ? (
					<SheetFooter className='flex flex-col items-center justify-center pt-5'>
						<Button disabled={true} type='submit' className='h-[50px] w-full'>
							<p className='text-center text-sm'>Необходимо обновить настройки</p>
						</Button>
						<SheetClose className='sheet-close-button hidden' />
					</SheetFooter>
				) : (
					<SheetFooter className='pt-5'>
						<Button
							type='submit'
							onClick={handleCalculate}
							disabled={isSubmitting || isDataEmpty()}
							className='h-[50px] w-full'
						>
							{isSubmitting
								? 'Отправка...'
								: isDataEmpty()
									? 'Необходимо заполнить все данные'
									: 'Рассчитать'}
						</Button>
						<SheetClose className='sheet-close-button hidden' />
					</SheetFooter>
				)}
			</ScrollArea>
		</div>
	)
}
