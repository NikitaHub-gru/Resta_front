'use client'

import { motion } from 'framer-motion'
import { HomeIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import DotPattern from '@/components/ui/dot-pattern'
import { supabase } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils'

interface ScheduleSlot {
	time: string
	orders: number
}

interface LocationSchedule {
	name: string
	slots: ScheduleSlot[]
}

// Organization ID to location name mapping
const org_locations = {
	'0372747c-0a0e-4c21-8f08-a150e94ad809': 'Поляна',
	'34758b3b-1961-4306-96be-66bc316cd782': 'Малахова',
	'd9892380-abaa-4eee-9fd9-013841cb7662': 'Соц'
}

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
				orders: 0
			}))
		},
		{
			name: 'Соц',
			slots: timeSlots.map(time => ({
				time,
				orders: 0
			}))
		},
		{
			name: 'Поляна',
			slots: timeSlots.map(time => ({
				time,
				orders: 0
			}))
		}
	])
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedLocation, setSelectedLocation] = useState('')
	const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
	const theme = useTheme()
	const shadowColor = theme.resolvedTheme === 'dark' ? 'white' : 'black'

	useEffect(() => {
		// Initial fetch of orders data
		fetchOrders()
	}, [])
	useEffect(() => {
		// Initial fetch of orders data
		fetchOrders()
	  // Set up real-time subscription
	  const subscription = supabase
	    .channel('dymmi-yamii-channel')
	    .on(
	      'postgres_changes',
	      {
	        event: '*',
	        schema: 'public',
	        table: 'DymmiYamii'  // Changed from 'orders' to 'DymmiYamii'
	      },
	      payload => {
	        console.log('Real-time update received:', payload)
	        fetchOrders() // Refresh data when changes occur
	      }
	    )
	    .subscribe()
	  // Cleanup subscription on component unmount
	  return () => {
	    subscription.unsubscribe()
	  }
	}, [])
	const fetchOrders = async () => {
		try {
			const response = await fetch('/api/orders')
			if (response.ok) {
				const data = await response.json()
				console.log('Fetched orders data:', data)
				if (data.locations && data.locations.length > 0) {
					console.log('Setting locations with:', data.locations)
					setLocations(data.locations)
				} else {
					console.log('No locations data available or empty array')
				}
			} else {
				console.log('API response not OK:', response.status)
			}
		} catch (error) {
			console.error('Failed to fetch orders:', error)
		}
	}

	const addNewOrder = async () => {
		if (!selectedLocation || !selectedTimeSlot) return

		try {
			// Find org_id for the selected location
			const orgId = Object.keys(org_locations).find(
				key => org_locations[key as keyof typeof org_locations] === selectedLocation
			)

			if (!orgId) {
				throw new Error('Invalid location selected')
			}

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
				className={cn(
					'absolute inset-0 z-0 h-full w-full opacity-45 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]'
				)}
			/>

			<motion.h1
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className='relative z-10 mb-8 text-center text-4xl font-bold text-[#171717] dark:text-white'
			></motion.h1>
			<div className='relative z-10 mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3'>
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
							<div className='mx-auto mb-2 grid grid-cols-2 gap-4 pl-10 font-semibold text-[#171717] dark:text-white'>
								<div>Время</div>
								<div>Заказов</div>
							</div>
							{location.slots.map((slot, index) => (
								<motion.div
									key={slot.time}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: index * 0.05 }}
									className='p-2'
								>
									<div className='mx-auto grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 dark:border-gray-400 dark:bg-[#262626]'>
										<div className='text-center text-[#171717] dark:text-white'>
											{slot.time}
										</div>
										<div className='text-center font-medium text-[#171717] dark:text-white'>
											{slot.orders || ''}
										</div>
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
