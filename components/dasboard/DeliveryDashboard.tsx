'use client'

import { Item } from '@radix-ui/react-dropdown-menu'
import * as Tooltip from '@radix-ui/react-tooltip'
import { differenceInMinutes, format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import {
	AlertCircle,
	Archive,
	ChefHat,
	Clock,
	FrownIcon,
	LucideIcon,
	MehIcon,
	Package,
	Route,
	SmileIcon,
	Timer,
	TrendingUp,
	Trophy,
	Truck
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { DeliveryEmoji } from '@/components/dasboard/DeliveryEmoji'
import { WaveProgressBar } from '@/components/dasboard/WaveProgressBar'
import { DeliveryOrder } from '@/components/dasboard/types/delivery'
import { useOlapData } from '@/hooks/useOlapData'
import { supabase } from '@/lib/supabase'
import { useOrders } from '@/src/hooks/useOrders'

interface DepartmentData {
	department: string
	all_orders: number
	del_orders: number
	avg_dell_t: string
	avg_send_t: string
	wait_t: string
	avg_cooking_t: string
	send_40: string
	cooking_14: string
	wait_7: string
	insend_20: string
	insend_60: number
}

interface ApiResponse {
	data: DepartmentData[]
}

interface DashboardProps {
	id_p: string
}

interface Restaurant {
	id: string
	name: string
	performance: number
}

const MOCK_DATA: DeliveryOrder[] = Array.from({ length: 20 }, (_, i) => ({
	id: `order-${i + 1}`,
	duration: Math.random() * 60,
	timestamp: new Date(Date.now() - i * 1000 * 60 * 5),
	totalTime: 30 + Math.random() * 40,
	prepTime: Math.random() * 20,
	shelfTime: Math.random() * 15,
	transitTime: Math.random() * 25,
	status: Math.random() > 0.3 ? 'onTime' : 'delayed'
}))

interface DeliveryStatus {
	id: number
	remainingTime: number
	color: string
	mood: 'happy' | 'neutral' | 'sad'
	isClosed?: boolean
}

export function DeliveryDashboard({ id_p }: DashboardProps) {
	const [orders, setOrders] = useState<DeliveryOrder[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [response, setResponse] = useState<DepartmentData[]>([])

	const [stats, setStats] = useState({
		totalOrders: 0,
		delayedOrders: 0,
		onTimePercentage: 0,
		averageTotal: 0,
		longPrepOrders: 0,
		longShelfOrders: 0,
		longTransitOrders: 0
	})

	const handleSubmit = async () => {
		setLoading(true)
		setError(null)

		try {
			const apiResponse = await fetch(
				'https://nikitahub-gru-resta-back-f1fb.twc1.net/restu/dashboard/' + id_p,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)

			if (!apiResponse.ok) {
				throw new Error(`HTTP error! status: ${apiResponse.status}`)
			}

			const result: ApiResponse = await apiResponse.json()
			setResponse(result.data)
		} catch (error) {
			console.error('Failed to fetch data:', error)
			setError(error instanceof Error ? error.message : 'Failed to fetch data')
		} finally {
			setLoading(false)
		}
	}

	const [isLoading, setIsLoading] = useState(true)
	const [showAll, setShowAll] = useState(false)
	const { orders_db, isLoadings, errors } = useOrders()

	const [deliveryStatuses, setDeliveryStatuses] = useState<
		Record<string, DeliveryStatus>
	>({})

	useEffect(() => {
		setOrders(MOCK_DATA)
		setIsLoading(false)
		handleSubmit()

		// Затем запускаем интервал на 15 минут
		const interval = setInterval(
			() => {
				handleSubmit()
			},
			15 * 60 * 1000
		) // 15 минут

		// Очищаем интервал при размонтировании компонента
		return () => clearInterval(interval)
	}, [])

	useEffect(() => {
		const savedStatuses = localStorage.getItem('deliveryStatuses')
		if (savedStatuses) {
			setDeliveryStatuses(JSON.parse(savedStatuses))
		}
	}, [])

	useEffect(() => {
		if (!orders_db) return

		const interval = setInterval(async () => {
			const newStatuses = { ...deliveryStatuses }

			for (const order of orders_db) {
				if (!order.whenCreated) {
					console.error('Нет времени создания для заказа:', order.id)
					continue
				}

				const startTime = parseISO(order.whenCreated)
				const now = new Date()

				const elapsedMinutes = Math.round(
					(now.getTime() - startTime.getTime()) / (1000 * 60)
				)
				console.log('Order whenCreated:', startTime)
				console.log('Current time:', now)
				if (elapsedMinutes < 0) {
					console.error('Invalid elapsed time for order:', order.id)
					console.log('Order whenCreated:', startTime)
					console.log('Current time:', now)
					continue
				}

				// Для закрытых заказов сохраняем время в базу
				if (order.status === 'Closed' && !order.time) {
					try {
						await supabase
							.from('Orders')
							.update({ time: elapsedMinutes.toString() })
							.eq('id', order.id)
					} catch (error) {
						console.error('Error saving delivery time:', error)
					}
				}

				newStatuses[order.id] = {
					id: order.id,
					remainingTime: elapsedMinutes,
					color: getColorByTime(elapsedMinutes),
					mood: getMoodByTime(elapsedMinutes),
					isClosed: order.status === 'Closed'
				}
			}

			setDeliveryStatuses(newStatuses)
			localStorage.setItem('deliveryStatuses', JSON.stringify(newStatuses))
		}, 1000)

		return () => clearInterval(interval)
	}, [orders_db, deliveryStatuses])

	// Обновленные функции для определения цвета и настроения
	const getColorByTime = (time: number) => {
		if (time >= 40) return '#FF0000' // Красный
		if (time >= 30) return '#FFA500' // Темно-оранжевый
		if (time >= 25) return '#eab308' // Оранжевый ffff00
		return '#4CAF50' // Зеленый
	}

	const getMoodByTime = (time: number): 'happy' | 'neutral' | 'sad' => {
		if (time >= 40) return 'sad'
		if (time >= 30) return 'neutral'
		return 'happy'
	}

	const MetricCard = ({
		icon: Icon,
		title,
		value,
		subValue = null
	}: {
		icon: LucideIcon
		title: string
		value: string | number
		subValue?: string | null
	}) => (
		<div className='rounded-lg bg-white p-3 shadow-md dark:bg-neutral-700'>
			<div className='mb-1 flex items-center'>
				<Icon className='mr-2 h-4 w-4 text-gray-700 dark:text-foreground' />
				<h3 className='text-sm font-medium text-gray-700 dark:text-foreground'>
					{title}
				</h3>
			</div>
			<p className='text-xl font-bold'>{value}</p>
			{subValue && <p className='mt-1 text-xs text-gray-500'>{subValue}</p>}
		</div>
	)

	const { data: olapData } = useOlapData('Лосось №1')

	// Преобразуем данные OLAP в нужный формат для отображения
	const restaurants =
		olapData?.data
			?.map((item: any, index: number) => ({
				id: `r${index + 1}`,
				name: item.Department,
				performance: item['Доля заказов доставленных за 60 мин']
			}))
			.sort((a: Restaurant, b: Restaurant) => b.performance - a.performance) || []

	return (
		<div className='h-screen overflow-hidden bg-gray-50 p-4 dark:bg-[#171717]'>
			{loading ? (
				<div className='flex h-full items-center justify-center'>
					<p>Загрузка данных...</p>
				</div>
			) : error ? (
				<div className='flex h-full items-center justify-center text-red-500'>
					<p>{error}</p>
				</div>
			) : (
				<div className='space-y-4'>
					{/* Header */}
					<div className='flex items-center justify-between'>
						<h1 className='text-2xl font-bold'>
							{response.length > 0
								? response[0].department
								: 'Ваше торговое предприятие'}
						</h1>
					</div>
					{/* Main Content Area */}
					<div className='flex gap-4'>
						{/* Left Section - Emojis */}
						<div className='w-[500px]'>
							<div className='rounded-xl bg-white p-6 shadow-lg dark:bg-neutral-700'>
								<div className='mb-4 flex items-center justify-between'>
									<h2 className='text-lg font-semibold'>Текущие заказы</h2>
									<button
										onClick={() => setShowAll(!showAll)}
										className='h-6 w-20 rounded-full bg-black px-2 py-1 text-xs text-white transition-all hover:bg-muted-foreground hover:shadow-md dark:bg-white dark:text-black'
									>
										{showAll ? 'Show Less' : 'Show More'}
									</button>
								</div>

								<div className='grid grid-cols-3 gap-4 pt-10'>
									{orders_db?.slice(0, showAll ? orders_db.length : 12).map(order => {
										const status = deliveryStatuses[order.id]
										return (
											<div key={order.id} className='flex flex-col items-center'>
												<Tooltip.Provider>
													<Tooltip.Root>
														<Tooltip.Trigger asChild>
															<div className='mb-2 transform cursor-pointer transition-transform hover:scale-110'>
																<DeliveryEmoji
																	size='big'
																	duration={status?.remainingTime || 0}
																	mood={status?.mood}
																	color={status?.color}
																/>
															</div>
														</Tooltip.Trigger>
														<Tooltip.Portal>
															<Tooltip.Content
																className='rounded-md bg-white p-3 text-sm shadow-lg dark:bg-neutral-900'
																sideOffset={5}
															>
																<div className='space-y-2'>
																	<p className='font-semibold'>Заказ #{order.id}</p>
																	<p className='text-gray-600 dark:text-white'>
																		Статус: {order.status}
																	</p>
																	{status?.remainingTime && (
																		<p className='text-gray-600 dark:text-white'>
																			Осталось: {status.remainingTime}м
																		</p>
																	)}
																	{order.completeBefore && (
																		<p className='text-gray-600 dark:text-white'>
																			До:{' '}
																			{format(parseISO(order.completeBefore), 'HH:mm', {
																				locale: ru
																			})}
																		</p>
																	)}
																</div>
																<Tooltip.Arrow className='fill-white' />
															</Tooltip.Content>
														</Tooltip.Portal>
													</Tooltip.Root>
												</Tooltip.Provider>
												<div className='text-center'>
													<p className='font-medium'>#{order.id}</p>
													<p className='text-sm font-bold' style={{ color: status?.color }}>
														{status?.isClosed ? 'Завершен' : `${status?.remainingTime || 0}м`}
													</p>
													<p className='text-xs text-gray-500 dark:text-gray-400'>
														{status?.isClosed
															? `Время доставки: ${status.remainingTime}м`
															: `В работе: ${status?.remainingTime || 0}м`}
													</p>
												</div>
											</div>
										)
									})}
								</div>
							</div>
						</div>

						{/* Right Section - Combined Progress, Rankings, and Metrics */}
						<div className='flex-1 space-y-4'>
							{/* Progress Bar and Rankings */}
							<div className='rounded-xl bg-white p-4 shadow-lg dark:bg-neutral-700'>
								<div className='mb-6'>
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.1 }}
									>
										<div className='mb-4 flex items-center'>
											<TrendingUp className='mr-2 h-6 w-6 text-gray-900 dark:text-foreground' />
											<h2 className='text-xl font-semibold'>
												Заказов доставленных за 60 минут
											</h2>
										</div>
										{response.length > 0 && (
											<WaveProgressBar progress={response[0].insend_60} />
										)}
									</motion.div>
								</div>
								<div className='space-y-2'>
									<div className='mb-3 flex items-center'>
										<Trophy className='mr-2 h-5 w-5 text-yellow-500' />
										<h2 className='text-sm font-semibold'>Рейтинг ресторанов</h2>
									</div>
									{restaurants.map((restaurant: Restaurant, index: number) => (
										<div
											key={restaurant.id}
											className='flex items-center justify-between text-sm'
										>
											<div className='flex items-center'>
												<span
													className={`w-6 text-${index < 3 ? 'yellow' : 'gray'}-500 font-bold`}
												>
													#{index + 1}
												</span>
												<span className='ml-2'>{restaurant.name}</span>
											</div>
											<span className='font-semibold'>{restaurant.performance}%</span>
										</div>
									))}
								</div>
							</div>

							{/* Metrics Grid */}
							<div className='grid grid-cols-4 gap-3'>
								<MetricCard
									icon={Clock}
									title='Время доставки'
									value={response.length > 0 ? `${response[0].avg_dell_t} м` : '0 м'}
								/>
								<MetricCard
									icon={ChefHat}
									title='Приготовление'
									value={response.length > 0 ? `${response[0].avg_cooking_t} м` : '0 м'}
								/>
								<MetricCard
									icon={Archive}
									title='Ожидание на полке'
									value={response.length > 0 ? `${response[0].wait_t} м` : '0 м'}
								/>
								<MetricCard
									icon={Truck}
									title='Время в пути'
									value={response.length > 0 ? `${response[0].avg_send_t} м` : '0 м'}
								/>
								<MetricCard
									icon={AlertCircle}
									title='Доставка >40 мин'
									value={response.length > 0 ? `${response[0].send_40}` : '0 %'}
								/>
								<MetricCard
									icon={Timer}
									title='Приготовление >14 мин'
									value={response.length > 0 ? `${response[0].cooking_14}` : '0 %'}
								/>
								<MetricCard
									icon={Package}
									title='На полке >7 мин'
									value={response.length > 0 ? `${response[0].wait_7}` : '0 %'}
								/>
								<MetricCard
									icon={Route}
									title='В пути >20 мин'
									value={response.length > 0 ? `${response[0].insend_20}` : '0 %'}
								/>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
