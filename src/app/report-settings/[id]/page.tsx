'use client'

import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { SidebarDemo } from '@/components/main/mailbar'
import { Dashboard } from '@/components/main/rightbar'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils'

export default function ReportSettings({ params }: { params: { id: string } }) {
	const [date, setDate] = useState<Date | undefined>(undefined)
	const [report, setReport] = useState<any>(null)
	const [settings, setSettings] = useState<any>(null)
	// Добавим состояния для хранения значений полей формы
	const [zpHours, setZpHours] = useState<string>('')
	const [zpOrders, setZpOrders] = useState<string>('')
	const [zpGsm, setZpGsm] = useState<string>('')
	const [speedBonus, setSpeedBonus] = useState<string>('')
	const { toast } = useToast()
	const router = useRouter()
	const [selectedMonth, setSelectedMonth] = useState<string | undefined>(
		undefined
	)
	const [selectedYear, setSelectedYear] = useState<number>(
		new Date().getFullYear()
	)
	// Add new state for replication data
	const [replicationData, setReplicationData] = useState<any>(null)
	const [showReplicationData, setShowReplicationData] = useState<boolean>(false)

	useEffect(() => {
		fetchData()
	}, [params.id])

	// Добавим эффект для обновления полей при изменении settings или replicationData
	useEffect(() => {
		if (showReplicationData && replicationData) {
			setZpHours(replicationData.zp_hours?.toString() || '')
			setZpOrders(replicationData.zp_orders?.toString() || '')
			setZpGsm(replicationData.zp_gsm?.toString() || '')
			setSpeedBonus(replicationData.speed_bonus?.toString() || '')
		} else if (settings) {
			setZpHours(settings.zp_hours?.toString() || '')
			setZpOrders(settings.zp_orders?.toString() || '')
			setZpGsm(settings.zp_gsm?.toString() || '')
			setSpeedBonus(settings.speed_bonus?.toString() || '')
		}
	}, [settings, replicationData, showReplicationData])

	const fetchData = async () => {
		try {
			const [reportResult, settingsResult] = await Promise.all([
				supabase.from('Reports').select('*').eq('id', params.id).single(),
				supabase.from('static').select('*').eq('report_id', params.id).single()
			])

			if (reportResult.error) throw reportResult.error
			setReport(reportResult.data)

			if (settingsResult.data) {
				setSettings(settingsResult.data)
				if (settingsResult.data.mouth) {
					setDate(new Date(settingsResult.data.mouth))
				}
			}
		} catch (error) {
			console.error('Error fetching data:', error)
			toast({
				title: 'Ошибка',
				description: 'Не удалось загрузить данные',
				variant: 'destructive'
			})
		}
	}

	// Обновим handleSubmit для использования состояний вместо доступа к DOM
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!date) {
			toast({
				title: 'Ошибка',
				description: 'Выберите дату',
				variant: 'destructive'
			})

			return
		}
		if (showReplicationData) {
			// Compare the current date with the previous settings date
			const previousDate = new Date(settings.mouth)
			const formattedPreviousDate = format(previousDate, 'yyyy-MM-dd')
			const formattedCurrentDate = format(date, 'yyyy-MM-dd')

			if (formattedCurrentDate === formattedPreviousDate) {
				toast({
					title: 'Предупреждение',
					description: 'Дата не была изменена. Пожалуйста, выберите новую дату.',
					variant: 'destructive'
				})
				return
			}
		}

		const formData = {
			report_id: params.id,
			corporation: report.corporation,
			mouth: format(date, 'yyyy-MM-dd'),
			zp_hours: Number(zpHours || 0),
			zp_orders: Number(zpOrders || 0),
			zp_gsm: Number(zpGsm || 0),
			speed_bonus: Number(speedBonus || 0)
		}

		try {
			let result
			const currentMonth = format(date, 'yyyy-MM')

			// First check if settings exist for this report
			const { data: existingSettings } = await supabase
				.from('static')
				.select('*')
				.eq('report_id', params.id)
				.single()

			if (existingSettings) {
				// Update existing settings
				result = await supabase
					.from('static')
					.update(formData)
					.eq('report_id', params.id)

				// Check if we need to save to ReplicationGrillnica (only if month changed)
				const previousMonth = format(new Date(existingSettings.mouth), 'yyyy-MM')

				if (currentMonth !== previousMonth) {
					// Check if data for this month already exists in ReplicationGrillnica
					const { data: existingReplication, error: checkError } = await supabase
						.from('ReplicationGrillnica')
						.select('*')
						.eq('report_id', params.id)
						.eq('mouth', currentMonth)
						.single()

					if (checkError) {
						// No data exists for this month, create a new record
						const replicationData = {
							...formData,
							mouth: currentMonth // Change date format to yyyy-MM
						}

						const replicationResult = await supabase
							.from('ReplicationGrillnica')
							.insert([replicationData])

						if (replicationResult.error) throw replicationResult.error

						toast({
							title: 'Сохранено в архив',
							description: `Настройки сохранены в архив за ${
								format(new Date(`${currentMonth}-01`), 'LLLL yyyy', {
									locale: ru
								})
									.charAt(0)
									.toUpperCase() +
								format(new Date(`${currentMonth}-01`), 'LLLL yyyy', {
									locale: ru
								}).slice(1)
							}`,
							variant: 'default'
						})
					} else {
						// Data exists for this month, update it
						const replicationData = {
							...formData,
							mouth: currentMonth
						}

						const replicationResult = await supabase
							.from('ReplicationGrillnica')
							.update(replicationData)
							.eq('id', existingReplication.id)

						if (replicationResult.error) throw replicationResult.error
					}
				}
			} else {
				// Create new settings
				result = await supabase.from('static').insert([formData])

				// Save to ReplicationGrillnica during first save
				// Check if data for this month already exists
				const { data: existingReplication, error: checkError } = await supabase
					.from('ReplicationGrillnica')
					.select('*')
					.eq('report_id', params.id)
					.eq('mouth', currentMonth)
					.single()

				if (checkError) {
					// No data exists for this month, create a new record
					const replicationData = {
						...formData,
						mouth: currentMonth // Change date format to yyyy-MM
					}

					const replicationResult = await supabase
						.from('ReplicationGrillnica')
						.insert([replicationData])

					if (replicationResult.error) throw replicationResult.error
				}
			}

			if (result.error) throw result.error

			// Reset showReplicationData state after successful update
			if (showReplicationData) {
				setShowReplicationData(false)
			}

			toast({
				title: existingSettings ? 'Обновлено' : 'Создано',
				description: existingSettings
					? 'Настройки успешно обновлены'
					: 'Новые настройки успешно созданы',
				variant: 'default'
			})

			await fetchData() // Обновляем данные на странице
		} catch (error) {
			console.error('Error saving settings:', error)
			toast({
				title: 'Ошибка',
				description: settings
					? 'Не удалось обновить настройки'
					: 'Не удалось создать настройки',
				variant: 'destructive'
			})
		}
	}
	// Add function to load data from ReplicationGrillnica
	const loadReplicationData = async () => {
		if (!selectedMonth || !selectedYear) {
			toast({
				title: 'Ошибка',
				description: 'Выберите месяц и год',
				variant: 'destructive'
			})
			return
		}

		try {
			const period = `${selectedYear}-${selectedMonth}`

			const { data, error } = await supabase
				.from('ReplicationGrillnica')
				.select('*')
				.eq('report_id', params.id)
				.eq('mouth', period)
				.single()
			console.log(period)

			if (error) {
				console.error('Error fetching replication data:', error)
				toast({
					title: 'Информация',
					description: 'Данные за выбранный период не найдены',
					variant: 'destructive'
				})
				return
			}

			if (data) {
				setReplicationData(data)
				setShowReplicationData(true)
				toast({
					title: 'Успешно',
					description: 'Данные загружены',
					variant: 'default'
				})
			} else {
				toast({
					title: 'Информация',
					description: 'Данные за выбранный период не найдены',
					variant: 'destructive'
				})
			}
		} catch (error) {
			console.error('Error loading replication data:', error)
			toast({
				title: 'Ошибка',
				description: 'Не удалось загрузить данные',
				variant: 'destructive'
			})
		}
	}

	if (!report) return <div>Загрузка...</div>

	return (
		<SidebarDemo>
			<Dashboard>
				<div className='container mx-auto justify-center py-8'>
					<div className='mx-auto max-w-4xl space-y-6'>
						<h1 className='mb-8 text-2xl font-bold'>
							Настройки отчета: {report.tb_name}
						</h1>

						<Card className='mb-6 dark:bg-[#151515]'>
							<CardHeader>
								<CardTitle>
									{showReplicationData ? 'Архивные настройки' : 'Текущие настройки'}
								</CardTitle>
							</CardHeader>
							<CardContent className='dark:bg-[#151515]'>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>
												{showReplicationData ? 'Месяц и год действия' : 'Действуют до'}
											</TableHead>
											<TableHead>ЗП/Часовая</TableHead>
											<TableHead>ЗП/По чекам</TableHead>
											<TableHead>ГСМ</TableHead>
											<TableHead>Бонус за скорость</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{showReplicationData ? (
											<TableRow>
												<TableCell>
													{replicationData?.mouth
														? format(new Date(`${replicationData.mouth}-01`), 'LLLL yyyy', {
																locale: ru
															})
																.charAt(0)
																.toUpperCase() +
															format(new Date(`${replicationData.mouth}-01`), 'LLLL yyyy', {
																locale: ru
															}).slice(1)
														: '-'}
												</TableCell>
												<TableCell>{replicationData?.zp_hours || '-'}</TableCell>
												<TableCell>{replicationData?.zp_orders || '-'}</TableCell>
												<TableCell>{replicationData?.zp_gsm || '-'}</TableCell>
												<TableCell>{replicationData?.speed_bonus || '-'}</TableCell>
											</TableRow>
										) : (
											<TableRow>
												<TableCell>
													{settings?.mouth
														? format(new Date(settings.mouth), 'dd.MM.yyyy')
														: '-'}
												</TableCell>
												<TableCell>{settings?.zp_hours || '-'}</TableCell>
												<TableCell>{settings?.zp_orders || '-'}</TableCell>
												<TableCell>{settings?.zp_gsm || '-'}</TableCell>
												<TableCell>{settings?.speed_bonus || '-'}</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
								{showReplicationData && (
									<div className='mt-4 flex justify-end'>
										<Button
											variant='outline'
											onClick={() => setShowReplicationData(false)}
											className='h-8 text-sm dark:bg-[#151515]'
										>
											Вернуться к текущим настройкам
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
						<div className='mx-auto flex flex-row justify-between gap-6'>
							<Card className='w-full min-w-[550px] justify-start'>
								<CardHeader className='py-4 dark:bg-[#151515]'>
									<CardTitle className='text-lg'>
										{settings
											? 'Редактирование текущих настроек'
											: 'Создание новых настроек'}
									</CardTitle>
								</CardHeader>
								<CardContent className='dark:bg-[#151515]'>
									<form onSubmit={handleSubmit} className='space-y-4'>
										<div className='grid grid-cols-2 gap-4'>
											<div className='space-y-1'>
												<Label className='block text-center text-sm'>Действует до</Label>
												<div>
													<Popover>
														<PopoverTrigger asChild>
															<Button
																variant={'outline'}
																className={cn(
																	'h-8 w-full justify-center text-center text-sm font-normal dark:bg-[#151515]',
																	!date && 'text-muted-foreground'
																)}
															>
																<CalendarIcon className='mr-2 h-3 w-3' />
																{date ? format(date, 'dd.MM.yyyy') : 'Выберите дату'}
															</Button>
														</PopoverTrigger>
														<PopoverContent className='w-auto p-0' align='start'>
															<Calendar
																mode='single'
																selected={date}
																locale={ru}
																className='rounded-md border dark:bg-[#151515]'
																onSelect={newDate => {
																	setDate(newDate)
																	if (newDate) {
																		;(
																			document.getElementById('mouth') as HTMLInputElement
																		).value = format(newDate, 'yyyy-MM-dd')
																	}
																}}
															/>
														</PopoverContent>
													</Popover>
													<input type='hidden' id='mouth' defaultValue={settings?.mouth} />
												</div>
											</div>

											<div className='space-y-1'>
												<Label htmlFor='zp_hours' className='block text-center text-sm'>
													ЗП/Часовая
												</Label>
												{showReplicationData ? (
													<Input
														id='zp_hours'
														value={zpHours}
														onChange={e => setZpHours(e.target.value)}
														className='h-8 text-center text-sm dark:bg-[#151515]'
														readOnly={showReplicationData}
													/>
												) : (
													<Input
														id='zp_hours'
														value={zpHours}
														onChange={e => setZpHours(e.target.value)}
														className='h-8 text-center text-sm dark:bg-[#151515]'
													/>
												)}
											</div>

											<div className='space-y-1'>
												<Label htmlFor='zp_orders' className='block text-center text-sm'>
													ЗП/По чекам
												</Label>
												{showReplicationData ? (
													<Input
														id='zp_orders'
														value={zpOrders}
														onChange={e => setZpOrders(e.target.value)}
														className='h-8 text-center text-sm dark:bg-[#151515]'
														readOnly={showReplicationData}
													/>
												) : (
													<Input
														id='zp_orders'
														value={zpOrders}
														onChange={e => setZpOrders(e.target.value)}
														className='h-8 text-center text-sm dark:bg-[#151515]'
													/>
												)}
											</div>

											<div className='space-y-1'>
												<Label htmlFor='zp_gsm' className='block text-center text-sm'>
													ГСМ
												</Label>
												{showReplicationData ? (
													<Input
														id='zp_gsm'
														value={zpGsm}
														onChange={e => setZpGsm(e.target.value)}
														className='h-8 text-center text-sm dark:bg-[#151515]'
														readOnly={showReplicationData}
													/>
												) : (
													<Input
														id='zp_gsm'
														value={zpGsm}
														onChange={e => setZpGsm(e.target.value)}
														className='h-8 text-center text-sm dark:bg-[#151515]'
													/>
												)}
											</div>

											<div className='col-span-2 space-y-1'>
												<Label htmlFor='speed_bonus' className='block text-center text-sm'>
													Бонус за скорость
												</Label>
												{showReplicationData ? (
													<Input
														id='speed_bonus'
														value={speedBonus}
														onChange={e => setSpeedBonus(e.target.value)}
														className='h-8 text-center text-sm dark:bg-[#151515]'
														readOnly={showReplicationData}
													/>
												) : (
													<Input
														id='speed_bonus'
														value={speedBonus}
														onChange={e => setSpeedBonus(e.target.value)}
														className='h-8 text-center text-sm dark:bg-[#151515]'
													/>
												)}
											</div>
										</div>

										<div className='mt-4 flex justify-between gap-2'>
											<Button
												variant='outline'
												onClick={() => router.push('/setDataReports')}
												className='h-8 w-1/3 text-sm dark:bg-[#151515]'
											>
												Назад
											</Button>
											{showReplicationData ? (
												<Button type='submit' className='h-8 w-2/3 text-sm'>
													{settings ? 'Вернуться к старым ставкам' : 'Создать настройки'}
												</Button>
											) : (
												<Button type='submit' className='h-8 w-2/3 text-sm'>
													{settings ? 'Сохранить изменения' : 'Создать настройки'}
												</Button>
											)}
										</div>
									</form>
								</CardContent>
							</Card>

							{/* Ставки */}
							<Card className='w-full'>
								<CardHeader className='py-4 dark:bg-[#151515]'>
									<CardTitle className='flex justify-center text-lg'>
										{settings ? 'Выбор старых ставок' : 'Создание новых настроек'}
									</CardTitle>
								</CardHeader>
								<CardContent className='dark:bg-[#151515]'>
									<form className='space-y-4'>
										<div className='gap-4 md:grid-cols-3'>
											<div className='space-y-3'>
												<Label className='block text-center text-sm'>Выберите месяц</Label>
												<div className='flex flex-col space-y-3'>
													<div className='flex items-center justify-between px-2'>
														<Button
															type='button'
															variant='outline'
															size='icon'
															className='h-7 w-7 dark:bg-[#151515]'
															onClick={e => {
																e.preventDefault()
																setSelectedYear(prev => prev - 1)
															}}
														>
															<ChevronLeft className='h-4 w-4' />
														</Button>
														<div className='font-medium'>{selectedYear}</div>
														<Button
															type='button'
															variant='outline'
															size='icon'
															className='h-7 w-7 dark:bg-[#151515]'
															onClick={e => {
																e.preventDefault()
																setSelectedYear(prev => prev + 1)
															}}
														>
															<ChevronRight className='h-4 w-4' />
														</Button>
													</div>

													<div className='grid grid-cols-3 gap-2'>
														{[
															{ value: '01', label: 'Янв' },
															{ value: '02', label: 'Фев' },
															{ value: '03', label: 'Мар' },
															{ value: '04', label: 'Апр' },
															{ value: '05', label: 'Май' },
															{ value: '06', label: 'Июн' },
															{ value: '07', label: 'Июл' },
															{ value: '08', label: 'Авг' },
															{ value: '09', label: 'Сен' },
															{ value: '10', label: 'Окт' },
															{ value: '11', label: 'Ноя' },
															{ value: '12', label: 'Дек' }
														].map(month => (
															<Button
																key={month.value}
																type='button'
																variant={selectedMonth === month.value ? 'default' : 'outline'}
																className='h-8 dark:bg-[#151515] dark:hover:bg-[#252525]'
																onClick={e => {
																	e.preventDefault()
																	setSelectedMonth(month.value)
																}}
															>
																{month.label}
															</Button>
														))}
													</div>
												</div>
												<input
													type='hidden'
													id='selected_month_year'
													value={
														selectedMonth && selectedYear
															? `${selectedYear}-${selectedMonth}`
															: ''
													}
												/>
												<div className='mt-4 flex items-center justify-center'>
													<Button
														type='button'
														className='h-8 text-sm'
														onClick={e => {
															e.preventDefault()
															loadReplicationData()
														}}
													>
														Загрузить ставки
													</Button>
												</div>
											</div>
										</div>
									</form>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
				<Toaster />
			</Dashboard>
		</SidebarDemo>
	)
}
