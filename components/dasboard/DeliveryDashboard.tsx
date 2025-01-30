'use client'

import { Item } from '@radix-ui/react-dropdown-menu'
import * as Tooltip from '@radix-ui/react-tooltip'
import { AnimatePresence, motion } from 'framer-motion'
import {
	AlertCircle,
	Archive,
	ChefHat,
	Clock,
	LucideIcon,
	Package,
	Route,
	Timer,
	TrendingUp,
	Trophy,
	Truck
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { DeliveryEmoji } from '@/components/dasboard/DeliveryEmoji'
import { WaveProgressBar } from '@/components/dasboard/WaveProgressBar'
import { DeliveryOrder } from '@/components/dasboard/types/delivery'

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
}

interface ApiResponse {
	data: DepartmentData[]
}

interface DashboardProps {
	id_p: string
}
const RESTAURANTS = [
	{ id: 'r1', name: 'Вкусный Дракон', performance: 98 },
	{ id: 'r2', name: 'Пицца Мастер', performance: 95 },
	{ id: 'r3', name: 'Суши & Роллы', performance: 92 },
	{ id: 'r4', name: 'Бургер Хаус', performance: 88 },
	{ id: 'r5', name: 'Pasta Bella', performance: 85 },
	{ id: 'r6', name: 'Шашлычный Двор', performance: 82 },
	{ id: 'r7', name: 'Тако Лако', performance: 78 },
	{ id: 'r8', name: 'Вок Стрит', performance: 75 }
].sort((a, b) => b.performance - a.performance)

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
				'http://localhost:8000/restu/dashboard/' + id_p,
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
		if (orders.length > 0) {
			const onTimeOrders = orders.filter(order => order.totalTime <= 60)
			setStats({
				totalOrders: orders.length,
				delayedOrders: orders.filter(order => order.totalTime > 40).length,
				onTimePercentage: (onTimeOrders.length / orders.length) * 100,
				averageTotal:
					orders.reduce((acc, curr) => acc + curr.totalTime, 0) / orders.length,
				longPrepOrders: orders.filter(order => order.prepTime > 14).length,
				longShelfOrders: orders.filter(order => order.shelfTime > 7).length,
				longTransitOrders: orders.filter(order => order.transitTime > 20).length
			})
		}
	}, [orders])

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

	const displayedOrders = showAll ? orders : orders.slice(0, 10)

	return (
		<div className='h-screen overflow-hidden bg-gray-50 p-4 dark:bg-[#171717]'>
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
								{orders.slice(0, showAll ? orders.length : 12).map((order, index) => (
									<div key={order.id} className='flex flex-col items-center'>
										<Tooltip.Provider>
											<Tooltip.Root>
												<Tooltip.Trigger asChild>
													<div className='mb-2 transform transition-transform hover:scale-110'>
														<DeliveryEmoji
															size='big'
															duration={order.totalTime}
															index={index}
															total={showAll ? orders.length : 11}
														/>
													</div>
												</Tooltip.Trigger>
												<Tooltip.Portal>
													<Tooltip.Content
														className='rounded-md bg-white p-3 text-sm shadow-lg dark:bg-neutral-900'
														sideOffset={5}
													>
														<div className='space-y-2'>
															<p className='font-semibold'>Order #{order.id}</p>
															<p className='text-gray-600 dark:text-white'>
																Delivery Time: {Math.round(order.totalTime)}m
															</p>
														</div>
														<Tooltip.Arrow className='fill-white' />
													</Tooltip.Content>
												</Tooltip.Portal>
											</Tooltip.Root>
										</Tooltip.Provider>
										<div className='text-center'>
											<p className='font-medium'>#{order.id}</p>
											<p className='text-sm text-gray-600 dark:text-white'>
												{Math.round(order.totalTime)}m
											</p>
										</div>
									</div>
								))}
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
									<WaveProgressBar progress={stats.onTimePercentage} />
								</motion.div>
							</div>
							<div className='space-y-2'>
								<div className='mb-3 flex items-center'>
									<Trophy className='mr-2 h-5 w-5 text-yellow-500' />
									<h2 className='text-sm font-semibold'>Restaurant Rankings</h2>
								</div>
								{RESTAURANTS.map((restaurant, index) => (
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
								value={response && response[0] ? `${response[0].avg_dell_t} м` : '0 м'}
							/>
							<MetricCard
								icon={ChefHat}
								title='Приготовление'
								value={
									response && response[0] ? `${response[0].avg_cooking_t} м` : '0 м'
								}
							/>
							<MetricCard
								icon={Archive}
								title='Ожидание на полке'
								value={response && response[0] ? `${response[0].wait_t} м` : '0 м'}
							/>
							<MetricCard
								icon={Truck}
								title='Время в пути'
								value={response && response[0] ? `${response[0].avg_send_t} м` : '0 м'}
							/>
							<MetricCard
								icon={AlertCircle}
								title='Доставка >40 мин'
								value={response && response[0] ? `${response[0].send_40}` : '0 %'}
							/>
							<MetricCard
								icon={Timer}
								title='Приготовление >14 мин'
								value={response && response[0] ? `${response[0].cooking_14}` : '0 %'}
							/>
							<MetricCard
								icon={Package}
								title='На полке >7 мин'
								value={response && response[0] ? `${response[0].wait_7}` : '0 %'}
							/>
							<MetricCard
								icon={Route}
								title='В пути >20 мин'
								value={response && response[0] ? `${response[0].insend_20}` : '0 %'}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
