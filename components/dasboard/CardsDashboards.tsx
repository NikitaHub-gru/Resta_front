'use client'

import { time } from 'console'
import { motion } from 'framer-motion'
import { LucideIcon, Soup } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '../ui/button'
import { Card } from '../ui/card'

import ReportNavigation from '@/components/main/ReportNavigation'
import { SidebarDemo } from '@/components/main/mailbar'
import { Dashboard } from '@/components/main/rightbar'
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern'
import { ScrollArea } from '@/components/ui/scroll-area'
import { WarpBackground } from '@/components/ui/warp-background'
import { getAuthUser } from '@/hooks/getauthuser'
import { cn } from '@/lib/utils'

// Update interface to match API response structure
interface DepartmentData {
	Department: string
	'Department.Code': string
}

interface ApiResponse {
	data: DepartmentData[]
}

interface UserData {
	name: string
	email: string
	corporation: string
	role: string
}

// 'RestaLabs'
const excludedCorporations = ['Лосось №1', 'American Dream', 'RestaLabs']

export default function CardDashboard() {
	const [loading, setLoading] = useState(false)
	const [response, setResponse] = useState<DepartmentData[]>([])
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()
	const [isModalOpen, setModalOpen] = useState(false)
	const [userData, setUserData] = useState<UserData>({
		name: '',
		email: '',
		corporation: '',
		role: ''
	})

	const handleOpenModal = () => {
		setModalOpen(true)
	}

	const handleCloseModal = () => {
		setModalOpen(false)

		// Задержка в 500 миллисекунд (0.5 секунды)
		setTimeout(() => {
			router.push('/')
		}, 500)
	}

	const MetricCard = ({
		icon: Icon,
		title,
		key,
		departmentCode,
		subValue = null
	}: {
		icon: LucideIcon
		title: string
		key: string | number
		departmentCode: string
		subValue?: string | null
	}) => {
		if (!excludedCorporations.includes(userData.corporation)) {
			return (
				<div className='flex h-full flex-col rounded-lg border border-gray-500/10 bg-white/50 p-3 shadow-lg dark:bg-black/50'>
					<div className='mb-1 flex flex-row items-center justify-center'>
						<Icon className='mr-2 h-8 w-8 text-gray-700 dark:text-foreground' />
						<h3 className='pb-1 text-center text-2xl font-medium text-gray-700 dark:text-foreground'>
							{userData.corporation}
						</h3>
						<Icon className='ml-2 h-8 w-8 text-gray-700 dark:text-foreground' />
					</div>
					{subValue && (
						<p className='mt-1 text-center text-xs text-gray-500'>{subValue}</p>
					)}
					<div className='mt-auto flex justify-center'>
						<Button className='h-full w-full' onClick={handleOpenModal}>
							Открыть Dashboard
						</Button>
					</div>
					<div className='bg-black/10'></div>

					{isModalOpen && (
						<motion.div
							className='fixed inset-0 flex items-center justify-center bg-black/20'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						>
							<motion.div
								className='rounded-lg bg-white p-5 shadow-lg'
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								exit={{ scale: 0 }}
							>
								<p className='text-center text-lg text-gray-700'>
									К сожалению, у вашей точки нет Dashboard, но вы всегда можете заказать
									его разработку.
								</p>
								<div className='mt-4 flex justify-center'>
									<Button
										className='bg-black text-white hover:bg-zinc-700'
										onClick={handleCloseModal}
									>
										На главную
									</Button>
								</div>
							</motion.div>
						</motion.div>
					)}
				</div>
			)
		}

		return (
			<div className='flex h-full flex-col rounded-lg border border-gray-500/10 bg-white/50 p-3 shadow-lg dark:bg-black/50'>
				<div className='mb-1 flex flex-row items-center justify-center'>
					<Icon className='mr-2 h-8 w-8 text-gray-700 dark:text-foreground' />
					<h3 className='text-center text-2xl font-medium text-gray-700 dark:text-foreground'>
						{title}
					</h3>
					<Icon className='ml-2 h-8 w-8 text-gray-700 dark:text-foreground' />
				</div>
				{subValue && (
					<p className='mt-1 text-center text-xs text-gray-500'>{subValue}</p>
				)}
				<div className='mt-auto flex justify-center'>
					<Button
						className='h-full w-full'
						onClick={() => router.push(`/ds_poins/${departmentCode}`)}
					>
						Окрыть Dashboard
					</Button>
				</div>
			</div>
		)
	}

	const handleSubmit = async () => {
		setLoading(true)
		setError(null)

		try {
			const apiResponse = await fetch(
				'https://nikitahub-gru-resta-back-c88a.twc1.net/restu/dashboard/poins',
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)

			if (!apiResponse.ok) {
				throw new Error(`HTTP error! status: ${apiResponse.status}`)
			}

			const result: ApiResponse = await apiResponse.json()
			setResponse(result.data || [])
		} catch (error) {
			console.error('Failed to fetch data:', error)
			setError(error instanceof Error ? error.message : 'Failed to fetch data')
		} finally {
			setLoading(false)
		}
	}

	const fetchUser = async () => {
		const user = (await getAuthUser()) as {
			email: string | undefined
			name: any
			corporation: any

			role: string
		}
		setUserData({
			name: user?.name || '',
			email: user?.email || '',
			corporation: user?.corporation || 'RestaLabs',
			role: user?.role || ''
		})
	}

	useEffect(() => {
		handleSubmit()
		fetchUser()
	}, [])

	return (
		<div className=''>
			<SidebarDemo>
				<Dashboard>
					<div className='relative'>
						<div className='mt-20'>
							<AnimatedGridPattern
								numSquares={30}
								maxOpacity={0.1}
								duration={3}
								repeatDelay={1}
								className={cn(
									'[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]',
									'absolute inset-x-0 inset-y-[-10%] h-[200%] skew-y-12'
								)}
							/>
						</div>
						<div className='relative z-10'>
							{loading && <div>Loading...</div>}
							{error && <div className='text-red-500'>Error: {error}</div>}
							{response.length > 0 ? (
								<div className='grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
									{response.map(item => (
										<MetricCard
											key={item['Department.Code']}
											icon={Soup}
											title={item.Department}
											departmentCode={item['Department.Code']}
										/>
									))}
								</div>
							) : (
								!loading && !error && <div>No departments found</div>
							)}
						</div>
					</div>
				</Dashboard>
			</SidebarDemo>
		</div>
	)
}
