'use client'

import { motion } from 'framer-motion'
import { HomeIcon, Router } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import io from 'socket.io-client'

import { BorderBeam } from '@/components/ui/border-beam'
import { Button } from '@/components/ui/button'
import DotPattern from '@/components/ui/dot-pattern'
import { cn } from '@/lib/utils'

interface ScheduleSlot {
	time: string
	orders: number
}

interface LocationSchedule {
	name: string
	slots: ScheduleSlot[]
}

// Create a singleton socket instance outside the component
let socket: any

export default function Home() {
	const timeSlots = [
		'11-12',
		'12-13',
		'13-14',
		'14-15',
		'15-16',
		'16-17',
		'17-18',
		'18-19',
		'19-20',
		'20-21',
		'21-22',
		'22-23'
	]

	// Initialize with default data structure
	const [locations, setLocations] = useState<LocationSchedule[]>([
		{
			name: 'Малахова',
			slots: timeSlots.map(time => ({
				time,
				orders: time === '11-12' || time === '16-17' ? 4 : 0
			}))
		},
		{
			name: 'Соц',
			slots: timeSlots.map(time => ({
				time,
				orders: time === '11-12' || time === '16-17' ? 4 : 0
			}))
		},
		{
			name: 'Поляна',
			slots: timeSlots.map(time => ({
				time,
				orders: time === '11-12' || time === '16-17' ? 4 : 0
			}))
		}
	])
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedLocation, setSelectedLocation] = useState('')
	const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
	const theme = useTheme()
	const shadowColor = theme.resolvedTheme === 'dark' ? 'white' : 'black'

	// Manual update function that can be called directly
	const updateOrderCount = (location: string, timeSlot: string) => {
		setLocations(prevLocations =>
			prevLocations.map(loc => {
				if (loc.name === location) {
					return {
						...loc,
						slots: loc.slots.map(slot => {
							if (slot.time === timeSlot) {
								return { ...slot, orders: slot.orders + 1 }
							}
							return slot
						})
					}
				}
				return loc
			})
		)
	}

	useEffect(() => {
		// Try to load from localStorage first
		const savedData = localStorage.getItem('schedulingData')
		if (savedData) {
			try {
				setLocations(JSON.parse(savedData))
			} catch (e) {
				console.error('Failed to parse localStorage data')
				fetchOrders() // Fallback to API
			}
		} else {
			fetchOrders()
		}

		// Setup WebSocket connection only once
		if (!socket) {
			try {
				socket = io('http://localhost:3001', {
					reconnectionAttempts: 5,
					reconnectionDelay: 1000,
					transports: ['websocket']
				})

				console.log('Attempting to connect to WebSocket...')
			} catch (error) {
				console.error('Failed to initialize WebSocket:', error)
			}
		}

		// Set up event listeners
		const handleOrderUpdate = (data: any) => {
			console.log('Order update received:', data)

			if (data.location && data.timeSlot) {
				updateOrderCount(data.location, data.timeSlot)
			}

			if (data.updatedLocations) {
				setLocations(data.updatedLocations)
				localStorage.setItem(
					'schedulingData',
					JSON.stringify(data.updatedLocations)
				)
			}
		}

		socket?.on('orderUpdated', handleOrderUpdate)

		socket?.on('connect', () => {
			console.log('WebSocket connected successfully')
		})

		socket?.on('connect_error', (err: any) => {
			console.error('WebSocket connection error:', err)
		})

		return () => {
			socket?.off('orderUpdated', handleOrderUpdate)
		}
	}, [])

	const fetchOrders = async () => {
		try {
			const response = await fetch('/api/orders')
			if (response.ok) {
				const data = await response.json()
				if (data.locations && data.locations.length > 0) {
					setLocations(data.locations)
					localStorage.setItem('schedulingData', JSON.stringify(data.locations))
				}
			}
		} catch (error) {
			console.error('Failed to fetch orders:', error)
		}
	}

	const addNewOrder = async () => {
		if (!selectedLocation || !selectedTimeSlot) return

		try {
			// Optimistically update UI immediately
			updateOrderCount(selectedLocation, selectedTimeSlot)

			const response = await fetch('/api/orders', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					location: selectedLocation,
					timeSlot: selectedTimeSlot
				})
			})

			if (response.ok) {
				const data = await response.json()
				console.log('Order created successfully:', data)

				if (data.locations) {
					setLocations(data.locations)
					localStorage.setItem('schedulingData', JSON.stringify(data.locations))
				}

				setIsModalOpen(false)
				setSelectedLocation('')
				setSelectedTimeSlot('')
			}
		} catch (error) {
			console.error('Failed to add order:', error)
		}
	}
	return (
		<div className='relative min-h-screen overflow-hidden bg-gray-100 p-8 dark:bg-[#171717]'>
			<DotPattern
				glow={true}
				className={cn(
					'absolute inset-0 z-0 h-full w-full opacity-45 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]'
				)}
			/>

			<motion.h1
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className='relative z-10 mb-8 text-center text-4xl font-bold text-[#171717] dark:text-white'
			></motion.h1>
			<div className='relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-3'>
				{locations.map((location, locationIndex) => (
					<motion.div
						key={location.name}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: locationIndex * 0.2 }}
						className='overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-[#222222]'
					>
						<div className='bg-[#171717] p-4 text-center text-xl font-semibold text-white dark:bg-[#333333]'>
							{location.name}
						</div>
						<div className='p-4'>
							<div className='mb-2 grid grid-cols-2 gap-4 font-semibold text-[#171717] dark:text-white'>
								<div>Время</div>
								<div>Заказов</div>
							</div>
							{location.slots.map((slot, index) => (
								<motion.div
									key={slot.time}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: index * 0.05 }}
									className={`grid grid-cols-2 gap-4 p-2 ${
										slot.orders > 0 ? 'bg-gray-100 dark:bg-[#2a2a2a]' : ''
									} ${index % 2 === 0 ? 'bg-opacity-50' : ''}`}
								>
									<div className='text-[#171717] dark:text-white'>{slot.time}</div>
									<div className='text-[#171717] dark:text-white'>
										{slot.orders || ''}
									</div>
								</motion.div>
							))}
						</div>
					</motion.div>
				))}
			</div>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.8 }}
				className='relative z-10 mt-8 flex justify-center'
			>
				<a
					href='/'
					className='flex items-center justify-center rounded-lg border border-white/50 bg-[#171717] px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-[#333333] dark:bg-[#2a2a2a]'
				>
					<HomeIcon className='h-5 w-5'></HomeIcon>
				</a>
			</motion.div>
		</div>
	)
}
