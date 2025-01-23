'use client'

import {
	AlertCircle,
	BarChart3,
	ChevronDown,
	ChevronRight,
	Clock,
	DollarSign,
	Megaphone,
	Settings,
	Truck,
	Users
} from 'lucide-react'
import { useState } from 'react'

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger
} from '@/components/ui/hover-card'
import { cn } from '@/lib/utils'

interface ReportCategory {
	id: string
	title: string
	icon: React.ReactNode
	description: string
	metrics: string[]
	timeOptions: string[]
	subCategories?: ReportCategory[]
}

const reportCategories: ReportCategory[] = [
	{
		id: 'delivery-speed',
		title: 'Скорость доставки',
		icon: <Truck className='h-5 w-5' />,
		description: 'Отслеживание и анализ показателей эффективности доставки',
		metrics: [
			'Среднее время доставки',
			'Пройденное расстояние',
			'Производительность в часы пик'
		],
		timeOptions: ['Ежедневный', 'Недельный', 'Месячный', 'Квартальный']
	},
	{
		id: 'delivery-delays',
		title: 'Задержки с доставкой',
		icon: <AlertCircle className='h-5 w-5' />,
		description:
			'Отслеживайте и анализируйте закономерности задержек доставки',
		metrics: [
			'Частота задержек',
			'Распространенные причины задержек',
			'Оценка воздействия'
		],
		timeOptions: ['Ежедневный', 'Недельный', 'Месячный']
	},
	{
		id: 'promotion-performance',
		title: 'Эффективность рекламной кампании',
		icon: <Megaphone className='h-5 w-5' />,
		description: 'Оценка эффективности маркетинговой кампании',
		metrics: [
			'Коэффициент конверсии',
			'Вовлечение клиентов',
			'Анализ рентабельности инвестиций'
		],
		timeOptions: ['Недельный', 'Месячный', 'На основе кампаний']
	},
	{
		id: 'cost-analysis',
		title: 'Анализ затрат',
		icon: <DollarSign className='h-5 w-5' />,
		description: 'Всесторонняя разбивка и анализ затрат',
		metrics: ['Операционные расходы', 'Анализ выручки', 'Норма прибыли'],
		timeOptions: ['Ежемесячно', 'Ежеквартально', 'Ежегодно']
	},
	{
		id: 'payroll',
		title: 'Платежная ведомость',
		icon: <Users className='h-5 w-5' />,
		description:
			'Управление вознаграждением персонала и начислением заработной платы',
		metrics: [
			'Распределение заработной платы',
			'Анализ сверхурочных',
			'Отслеживание льгот'
		],
		timeOptions: ['Раз в две недели', 'Ежемесячно'],
		subCategories: [
			{
				id: 'kitchen-staff-payroll',
				title: 'Начисление заработной платы кухонному персоналу',
				icon: <Users className='h-5 w-5' />,
				description: 'Отслеживание вознаграждения кухонного персонала',
				metrics: [
					'Обычный рабочий день',
					'Сверхурочная работа',
					'Бонусы за производительность'
				],
				timeOptions: ['Раз в две недели', 'Ежемесячно']
			},
			{
				id: 'management-payroll',
				title: 'Управление начислением заработной платы',
				icon: <Users className='h-5 w-5' />,
				description:
					'Отслеживание вознаграждения управленческой команды',
				metrics: ['Базовый оклад', 'Премии за работу', 'Льготы'],
				timeOptions: ['Ежемесячно']
			}
		]
	}
]

const ReportCard = ({ category }: { category: ReportCategory }) => {
	return (
		<div className='relativ group'>
			<div className='flex items-center space-x-4 rounded-lg border border-border bg-background/50 p-4 transition-all hover:shadow-md dark:bg-background/50'>
				<div className='flex h-10 w-10 items-center justify-center rounded-full bg-background/50'>
					{category.icon}
				</div>
				<div className='flex-1'>
					<h3 className='text-lg font-semibold'>{category.title}</h3>
					<p className='text-sm text-muted-foreground'>
						{category.description}
					</p>
				</div>
				<HoverCard>
					<HoverCardTrigger asChild>
						<Button variant='ghost' size='icon'>
							<ChevronRight className='h-4 w-4' />
						</Button>
					</HoverCardTrigger>
					<HoverCardContent className='w-80'>
						<div className='space-y-2'>
							<h4 className='font-medium'>Метрика отчетов</h4>
							<ul className='list-inside list-disc text-sm'>
								{category.metrics.map(metric => (
									<li key={metric}>{metric}</li>
								))}
							</ul>
							<div className='flex items-center space-x-2 text-sm'>
								<Clock className='h-4 w-4' />
								<span>
									Временные периоды:{' '}
									{category.timeOptions.join(', ')}
								</span>
							</div>
							<Button className='w-full' size='sm'>
								Посмотреть примеры отчетов
							</Button>
						</div>
					</HoverCardContent>
				</HoverCard>
			</div>
		</div>
	)
}

export default function ReportNavigation() {
	const [activePath, setActivePath] = useState<string[]>([])

	return (
		<div className='space-y-6 pl-4'>
			<div className='mb-8'>
				<h2 className='text-3xl font-bold'>
					Что вы хотите проанализировать?
				</h2>
				<p className='text-muted-foreground'>
					Ознакомьтесь с подробными отчетами и аналитикой для вашего
					бизнеса
				</p>
			</div>

			<div className='space-y-4 pr-16'>
				{reportCategories.map(category => (
					<div key={category.id} className='space-y-2'>
						<ReportCard category={category} />
						{category.subCategories && (
							<div className='ml-14 space-y-2 border-l pb-5 pl-4'>
								{category.subCategories.map(subCategory => (
									<ReportCard
										key={subCategory.id}
										category={subCategory}
									/>
								))}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	)
}
