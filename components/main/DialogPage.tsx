import { FileBarChart, LineChart, PieChart, Users } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ReportData {
	status: string
	name: string
	description: string
	characteristics: Array<{
		title: string
		description: string
	}>
	users: Array<{
		role: string
		description: string
	}>
	example: string
}

export default function DialogContentPage() {
	const searchParams = useSearchParams()
	const [reportData, setReportData] = useState<ReportData | null>(null)

	useEffect(() => {
		const fetchData = async () => {
			const id = searchParams.get('id')
			if (id) {
				try {
					const data = await import(`@/data/${id}.json`)
					setReportData(data)
				} catch (error) {
					console.error('Error loading report data:', error)
				}
			}
		}
		fetchData()
	}, [searchParams])

	if (!reportData) return <div>Loading...</div>

	return (
		<div className='mt-1 flex justify-center'>
			<ScrollArea className='max-h-[80vh] overflow-y-auto px-1'>
				<DialogHeader>
					<DialogTitle className='flex justify-center text-2xl font-bold'>
						{reportData.name}
					</DialogTitle>
				</DialogHeader>
				<div className='space-y-6 py-4'>
					{/* Описание отчета */}
					<Card>
						<CardContent className='pt-6'>
							<h3 className='mb-2 flex items-center gap-2 text-lg font-semibold'>
								<LineChart className='h-5 w-5 text-primary' />
								Общее описание
							</h3>
							<p className='text-gray-600 dark:text-gray-300'>
								{reportData.description}
							</p>
						</CardContent>
					</Card>

					{/* Характеристики */}
					<Card>
						<CardContent className='pt-6'>
							<h3 className='mb-4 flex items-center gap-2 text-lg font-semibold'>
								<PieChart className='h-5 w-5 text-primary' />
								Характеристики отчета
							</h3>
							<ul className='space-y-3 text-gray-600 dark:text-gray-300'>
								{reportData.characteristics.map(
									(char, index) => (
										<li
											key={index}
											className='flex items-start gap-2'
										>
											<span className='min-w-[140px] font-medium'>
												{char.title}:
											</span>
											<span>{char.description}</span>
										</li>
									)
								)}
							</ul>
						</CardContent>
					</Card>

					{/* Пользователи */}
					<Card>
						<CardContent className='pt-6'>
							<h3 className='mb-4 flex items-center gap-2 text-lg font-semibold'>
								<Users className='h-5 w-5 text-primary' />
								Потенциальные пользователи
							</h3>
							<ul className='space-y-3 text-gray-600 dark:text-gray-300'>
								{reportData.users.map((user, index) => (
									<li
										key={index}
										className='flex items-start gap-2'
									>
										<span className='font-medium'>
											{user.role}:
										</span>
										<span>{user.description}</span>
									</li>
								))}
							</ul>
						</CardContent>
					</Card>

					{/* Пример использования */}
					<Card>
						<CardContent className='pt-6'>
							<h3 className='mb-2 text-lg font-semibold'>
								Пример использования
							</h3>
							<p className='text-gray-600 dark:text-gray-300'>
								{reportData.example}
							</p>
						</CardContent>
					</Card>
				</div>
			</ScrollArea>
		</div>
	)
}
