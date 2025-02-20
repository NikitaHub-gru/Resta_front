'use client'

import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
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
				<div className='container mx-auto py-8'>
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

						<Card>
							<CardHeader className='py-4 dark:bg-[#151515]'>
								<CardTitle className='text-lg'>
									{settings ? 'Редактирование настроек' : 'Создание новых настроек'}
								</CardTitle>
							</CardHeader>
							<CardContent className='dark:bg-[#151515]'>
								<form onSubmit={handleSubmit} className='space-y-4'>
									<div className='grid grid-cols-3 gap-4'>
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
																	;(document.getElementById('mouth') as HTMLInputElement).value =
																		format(newDate, 'yyyy-MM-dd')
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

										<div className='space-y-1'>
											<Label htmlFor='speed_bonus' className='block text-center text-sm'>
												Bонус за скорость
											</Label>
											<Input
												id='speed_bonus'
												defaultValue={settings?.speed_bonus}
												className='h-8 text-center text-sm dark:bg-[#151515]'
											/>
										</div>
									</div>

									<div className='flex justify-end gap-2'>
										<Button
											variant='outline'
											onClick={() => router.push('/setDataReports')}
											className='h-8 text-sm dark:bg-[#151515]'
										>
											Назад
										</Button>
										<Button type='submit' className='h-8 text-sm'>
											{settings ? 'Сохранить изменения' : 'Создать настройки'}
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='py-4 dark:bg-[#151515]'>
								<CardTitle className='text-lg'>
									{settings ? 'Редактирование настроек' : 'Создание новых настроек'}
								</CardTitle>
							</CardHeader>
							<CardContent className='dark:bg-[#151515]'>
								<form onSubmit={handleSubmit} className='space-y-4'>
									<div className='grid grid-cols-3 gap-4'>
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
																	;(document.getElementById('mouth') as HTMLInputElement).value =
																		format(newDate, 'yyyy-MM-dd')
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

										<div className='space-y-1'>
											<Label htmlFor='speed_bonus' className='block text-center text-sm'>
												Bонус за скорость
											</Label>
											<Input
												id='speed_bonus'
												defaultValue={settings?.speed_bonus}
												className='h-8 text-center text-sm dark:bg-[#151515]'
											/>
										</div>
									</div>

									<div className='flex justify-end gap-2'>
										<Button
											variant='outline'
											onClick={() => router.push('/setDataReports')}
											className='h-8 text-sm dark:bg-[#151515]'
										>
											Назад
										</Button>
										<Button type='submit' className='h-8 text-sm'>
											{settings ? 'Сохранить изменения' : 'Создать настройки'}
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>
					</div>
				</div>
				<Toaster />
			</Dashboard>
		</SidebarDemo>
	)
}
