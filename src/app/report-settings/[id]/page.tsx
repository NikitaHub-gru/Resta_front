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
	const { toast } = useToast()
	const router = useRouter()
	const [selectedMonth, setSelectedMonth] = useState<string | undefined>(
		undefined
	)
	const [selectedYear, setSelectedYear] = useState<number>(
		new Date().getFullYear()
	)

	useEffect(() => {
		fetchData()
	}, [params.id])

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

		const formData = {
			report_id: params.id,
			corporation: report.corporation,
			mouth: format(date, 'yyyy-MM-dd'),
			zp_hours: Number(
				(document.getElementById('zp_hours') as HTMLInputElement).value || 0
			),
			zp_orders: Number(
				(document.getElementById('zp_orders') as HTMLInputElement).value || 0
			),
			zp_gsm: Number(
				(document.getElementById('zp_gsm') as HTMLInputElement).value || 0
			),
			speed_bonus: Number(
				(document.getElementById('speed_bonus') as HTMLInputElement).value || 0
			)
		}

		try {
			let result

			if (settings) {
				result = await supabase
					.from('static')
					.update(formData)
					.eq('report_id', params.id)
			} else {
				result = await supabase.from('static').insert([formData])
			}

			if (result.error) throw result.error

			toast({
				title: settings ? 'Обновлено' : 'Создано',
				description: settings
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
								<CardTitle>Текущие настройки</CardTitle>
							</CardHeader>
							<CardContent className='dark:bg-[#151515]'>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Действует до</TableHead>
											<TableHead>ЗП/Часовая</TableHead>
											<TableHead>ЗП/По чекам</TableHead>
											<TableHead>ГСМ</TableHead>
											<TableHead>Бонус за скорость</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
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
									</TableBody>
								</Table>
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
												<Input
													id='zp_hours'
													defaultValue={settings?.zp_hours}
													className='h-8 text-center text-sm dark:bg-[#151515]'
												/>
											</div>

											<div className='space-y-1'>
												<Label htmlFor='zp_orders' className='block text-center text-sm'>
													ЗП/По чекам
												</Label>
												<Input
													id='zp_orders'
													defaultValue={settings?.zp_orders}
													className='h-8 text-center text-sm dark:bg-[#151515]'
												/>
											</div>

											<div className='space-y-1'>
												<Label htmlFor='zp_gsm' className='block text-center text-sm'>
													ГСМ
												</Label>
												<Input
													id='zp_gsm'
													defaultValue={settings?.zp_gsm}
													className='h-8 text-center text-sm dark:bg-[#151515]'
												/>
											</div>

											<div className='col-span-2 space-y-1'>
												<Label htmlFor='speed_bonus' className='block text-center text-sm'>
													Бонус за скорость
												</Label>
												<Input
													id='speed_bonus'
													defaultValue={settings?.speed_bonus}
													className='h-8 text-center text-sm dark:bg-[#151515]'
												/>
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
											<Button type='submit' className='h-8 w-2/3 text-sm'>
												{settings ? 'Сохранить изменения' : 'Создать настройки'}
											</Button>
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
															// Here you would add logic to load data for the selected month/year
															toast({
																title: 'Информация',
																description: `Выбран период: ${selectedMonth ? `${selectedYear}-${selectedMonth}` : 'Не выбран месяц'}`
															})
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
