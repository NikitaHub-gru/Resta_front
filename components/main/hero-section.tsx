'use client'

import { motion } from 'framer-motion'
import { BarChart3, ChartPie, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Meteors } from '../ui/meteors'

import { Button } from '@/components/ui/button'
import { getAuthUser } from '@/hooks/getauthuser'

export function HeroSection() {
	const router = useRouter()

	return (
		<div className='relative flex min-h-screen items-center'>
			<div className='absolute inset-0 from-primary/5 to-secondary/5' />

			<div className='relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className='text-center'
				>
					<h1 className='text-4xl font-bold tracking-tight md:text-5xl'>
						Преобразуйте Свой бизнес в сфере HoReCa
						<span className='mt-2 block text-primary'>
							С помощью расширенной аналитики
						</span>
					</h1>
					<p className='mx-auto mt-6 max-w-3xl text-xl text-muted-foreground'>
						Благодаря нашим комплексным решениям для создания
						отчетов, разработанным специально для отелей, ресторанов
						и предприятий общественного питания, вы сможете получать
						ценные аналитические данные и стимулировать рост, для
						ознакомления с отчетами нажмите кнопку ниже "Информация
						о отчетах".
					</p>
					<div className='mt-10 flex justify-center gap-4'>
						<Button
							size='lg'
							onClick={async () => {
								const user = await getAuthUser()
								if (user.corporation === 'Grill№1') {
									router.push('/orders')
								} else {
									router.push('/reports')
								}
							}}
						>
							Начать
						</Button>
						<Button
							size='lg'
							variant='outline'
							onClick={() => {
								router.push('/reportsInfo')
							}}
						>
							Информация о отчетах
						</Button>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.5 }}
					className='mt-20 grid grid-cols-1 gap-8 md:grid-cols-3'
				>
					{[
						{
							icon: ChartPie,
							title: 'Аналитика в реальном времени',
							description:
								'Мониторинг вашей бизнес-производительности в реальном времени с интерактивными панелями'
						},
						{
							icon: BarChart3,
							title: 'Отчеты по вашим потребностям',
							description:
								'Создание и настройка отчетов, специально адаптированных к вашим конкретным бизнес-потребностям'
						},
						{
							icon: TrendingUp,
							title: 'Прогнозные данные',
							description:
								'Принятие данных-ориентированных решений с использованием AI-powered forecasting and trends'
						}
					].map((feature, index) => (
						<div
							key={index}
							className='group relative overflow-hidden rounded-lg border bg-card/30 p-6 transition-all hover:shadow-lg'
						>
							<Meteors number={8} />
							<div className='absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 transition-opacity group-hover:opacity-100' />
							<feature.icon className='mb-4 h-12 w-12 text-primary' />
							<h3 className='mb-2 text-xl font-semibold'>
								{feature.title}
							</h3>
							<p className='text-muted-foreground'>
								{feature.description}
							</p>
						</div>
					))}
				</motion.div>
			</div>
		</div>
	)
}
