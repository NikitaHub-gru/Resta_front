'use client'

import { Euro, MoreVertical, User } from 'lucide-react'
import { useState } from 'react'

import { ScrollArea } from '../ui/scroll-area'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type CheckRange = 'none' | 'low' | 'medium' | 'high'

const checkRanges = [
	{ id: 'none', label: 'Не имеет значения' },
	{ id: 'low', label: 'Низкий (0-135)' },
	{ id: 'medium', label: 'Средний (135-427)' },
	{ id: 'high', label: 'Высокий (427-7825)' }
] as const

const timeRanges = [
	'менее 1 месяца',
	'от 1 до 3 месяцев',
	'от 3 до 5 месяцев',
	'более 5 месяцев'
]

const orderRanges = ['1 заказ', '2-3 заказа', '4-9 заказов', '10 и более']

const guestTypes = [
	{ type: 'Новые', percentage: 54, color: 'text-green-500' },
	{ type: 'Лояльные', percentage: 4, color: 'text-green-700' },
	{ type: 'Случайные', percentage: 0, color: 'text-gray-500' },
	{ type: 'Не определившиеся', percentage: 0, color: 'text-yellow-500' },
	{ type: 'Уходящие', percentage: 0, color: 'text-orange-500' },
	{ type: 'Ушедшие', percentage: 0, color: 'text-red-500' },
	{ type: 'Потерянные', percentage: 43, color: 'text-gray-500' }
]

export default function RfmReport() {
	const [selectedRange, setSelectedRange] = useState<CheckRange>('none')

	return (
		<ScrollArea className='h-[calc(100vh-2rem)] w-full'>
			<div className='bg-white dark:bg-[#202020]'>
				{/* Header */}
				<header className='border-b border-white/30 bg-gradient-to-r from-blue-600 to-blue-900 p-4 shadow-lg dark:bg-gradient-to-r dark:from-black/20 dark:to-black/50'>
					<div className='mx-auto flex items-center justify-between gap-4 text-white'>
						<span className='text-lg font-medium'>Торговое предприятие</span>
						<div className='flex flex-wrap gap-4'>
							<span className='mr-4 text-lg font-medium'>Средний чек, €:</span>
							{checkRanges.map(range => (
								<Button
									key={range.id}
									variant={selectedRange === range.id ? 'secondary' : 'ghost'}
									className={`transition-all duration-200 ${selectedRange === range.id ? 'bg-white text-blue-600' : 'bg-white/10 text-white hover:bg-white/20'} `}
									onClick={() => setSelectedRange(range.id)}
								>
									{range.label}
								</Button>
							))}
						</div>
					</div>
				</header>

				<main className='p-4 md:p-8'>
					<div className='flex flex-col gap-2 2xl:flex-row'>
						{/* Main Grid */}
						<div className='flex-1 rounded-xl border border-gray-500/15 bg-white p-6 shadow-sm dark:border-white/15 dark:bg-gray-400/15'>
							<h1 className='mb-4 text-center text-2xl font-bold text-gray-800 dark:text-white'>
								БЫЛИ В ВАШЕМ ЗАВЕДЕНИИ
							</h1>

							<div className='grid gap-1'>
								{/* Column Headers */}
								<div className='grid grid-cols-[120px_repeat(4,1fr)] gap-1'>
									<div className='w-[120px]' /> {/* Empty corner cell */}
									{timeRanges.map(range => (
										<div
											key={range}
											className='px-2 text-center text-lg font-medium text-gray-600 dark:text-white/75'
										>
											{range}
										</div>
									))}
								</div>

								{/* Grid Content */}
								<div className='grid grid-cols-[120px_repeat(4,1fr)] gap-1'>
									<div className='flex items-center'>
										<span className='text-lg font-medium text-gray-600 dark:text-white/75'>
											1 заказ
										</span>
									</div>

									<Card
										key='1'
										className='animate-fade-in p-4 opacity-0 transition-all duration-300 [animation-delay:var(--delay)] hover:shadow-md dark:bg-white'
										style={
											{
												'--delay': `${(1 * timeRanges.length + 1) * 100}ms`
											} as React.CSSProperties
										}
									>
										<div className='flex justify-between'>
											<span className='font-semibold text-black'>Новые</span>
											<button className='text-gray-400 transition-colors hover:text-gray-600'>
												<MoreVertical className='h-5 w-5' />
											</button>
										</div>
										<div className='mt-3 flex items-center justify-center text-4xl font-bold text-gray-800'>
											<p>0.0%</p>{' '}
										</div>
										<div className='mt-3 w-full border-t border-t-gray-300'></div>
										<div className='mt-2 flex justify-between text-sm text-gray-500'>
											<div className='flex items-center'>
												<User className='h-5 w-5' />
												<span className='ml-2 text-sm'>10</span>
											</div>
											<div className='flex items-center'>
												<Euro className='h-5 w-5' />
												<span className='ml-2 text-sm'>327</span>
											</div>
										</div>
									</Card>
									{/* 2 столбец */}
									<Card
										key='1'
										className='animate-fade-in p-4 opacity-0 transition-all duration-300 [animation-delay:var(--delay)] hover:shadow-md dark:bg-white'
										style={
											{
												'--delay': `${(1 * timeRanges.length + 2) * 100}ms`
											} as React.CSSProperties
										}
									>
										<div className='flex justify-between'>
											<span className='font-semibold text-black'>Случайные</span>
											<button className='text-gray-400 transition-colors hover:text-gray-600'>
												<MoreVertical className='h-5 w-5' />
											</button>
										</div>
										<div className='mt-3 flex items-center justify-center text-4xl font-bold text-gray-800'>
											<p>0.0%</p>{' '}
										</div>
										<div className='mt-3 w-full border-t border-t-gray-300'></div>
										<div className='mt-2 flex justify-between text-sm text-gray-500'>
											<div className='flex items-center'>
												<User className='h-5 w-5' />
												<span className='ml-2 text-sm'>10</span>
											</div>
											<div className='flex items-center'>
												<Euro className='h-5 w-5' />
												<span className='ml-2 text-sm'>327</span>
											</div>
										</div>
									</Card>
									{/* 3-й столбец */}
									<Card
										key='1'
										className='animate-fade-in p-4 opacity-0 transition-all duration-300 [animation-delay:var(--delay)] hover:shadow-md dark:bg-white'
										style={
											{
												'--delay': `${(1 * timeRanges.length + 3) * 100}ms`
											} as React.CSSProperties
										}
									>
										<div className='flex justify-between'>
											<span className='font-semibold text-black'>Случайные</span>
											<button className='text-gray-400 transition-colors hover:text-gray-600'>
												<MoreVertical className='h-5 w-5' />
											</button>
										</div>
										<div className='mt-3 flex items-center justify-center text-4xl font-bold text-gray-800'>
											<p>0.0%</p>{' '}
										</div>
										<div className='mt-3 w-full border-t border-t-gray-300'></div>
										<div className='mt-2 flex justify-between text-sm text-gray-500'>
											<div className='flex items-center'>
												<User className='h-5 w-5' />
												<span className='ml-2 text-sm'>10</span>
											</div>
											<div className='flex items-center'>
												<Euro className='h-5 w-5' />
												<span className='ml-2 text-sm'>327</span>
											</div>
										</div>
									</Card>
									{/* 4-й столбец */}
									<Card
										key='1'
										className='animate-fade-in p-4 opacity-0 transition-all duration-300 [animation-delay:var(--delay)] hover:shadow-md dark:bg-white'
										style={
											{
												'--delay': `${(1 * timeRanges.length + 4) * 100}ms`
											} as React.CSSProperties
										}
									>
										<div className='flex justify-between'>
											<span className='font-semibold text-black'>Потерянные</span>
											<button className='text-gray-400 transition-colors hover:text-gray-600'>
												<MoreVertical className='h-5 w-5' />
											</button>
										</div>
										<div className='mt-3 flex items-center justify-center text-4xl font-bold text-gray-800'>
											<p>0.0%</p>{' '}
										</div>
										<div className='mt-3 w-full border-t border-t-gray-300'></div>
										<div className='mt-2 flex justify-between text-sm text-gray-500'>
											<div className='flex items-center'>
												<User className='h-5 w-5' />
												<span className='ml-2 text-sm'>10</span>
											</div>
											<div className='flex items-center'>
												<Euro className='h-5 w-5' />
												<span className='ml-2 text-sm'>327</span>
											</div>
										</div>
									</Card>
								</div>
								{/* 2-3 заказа */}
								<div className='grid grid-cols-[120px_repeat(4,1fr)] gap-1'>
									<div className='flex w-[120px] items-center'>
										<span className='text-lg font-medium text-gray-600 dark:text-white/75'>
											2-3 заказа
										</span>
									</div>

									<Card
										key='1'
										className='animate-fade-in p-4 opacity-0 transition-all duration-300 [animation-delay:var(--delay)] hover:shadow-md dark:bg-white'
										style={
											{
												'--delay': `${(2 * timeRanges.length + 5) * 100}ms`
											} as React.CSSProperties
										}
									>
										<div className='flex justify-between'>
											<span className='font-semibold text-black'>Новые</span>
											<button className='text-gray-400 transition-colors hover:text-gray-600'>
												<MoreVertical className='h-5 w-5' />
											</button>
										</div>
										<div className='mt-3 flex items-center justify-center text-4xl font-bold text-gray-800'>
											<p>0.0%</p>{' '}
										</div>
										<div className='mt-3 w-full border-t border-t-gray-300'></div>
										<div className='mt-2 flex justify-between text-sm text-gray-500'>
											<div className='flex items-center'>
												<User className='h-5 w-5' />
												<span className='ml-2 text-sm'>10</span>
											</div>
											<div className='flex items-center'>
												<Euro className='h-5 w-5' />
												<span className='ml-2 text-sm'>327</span>
											</div>
										</div>
									</Card>
									{/* 2-й столбец */}
									<Card
										key='1'
										className='animate-fade-in p-4 opacity-0 transition-all duration-300 [animation-delay:var(--delay)] hover:shadow-md dark:bg-white'
										style={
											{
												'--delay': `${(2 * timeRanges.length + 6) * 100}ms`
											} as React.CSSProperties
										}
									>
										<div className='flex justify-between'>
											<span className='font-semibold text-black'>Не определившиеся</span>
											<button className='text-gray-400 transition-colors hover:text-gray-600'>
												<MoreVertical className='h-5 w-5' />
											</button>
										</div>
										<div className='mt-3 flex items-center justify-center text-4xl font-bold text-gray-800'>
											<p>0.0%</p>{' '}
										</div>
										<div className='mt-3 w-full border-t border-t-gray-300'></div>
										<div className='mt-2 flex justify-between text-sm text-gray-500'>
											<div className='flex items-center'>
												<User className='h-5 w-5' />
												<span className='ml-2 text-sm'>10</span>
											</div>
											<div className='flex items-center'>
												<Euro className='h-5 w-5' />
												<span className='ml-2 text-sm'>327</span>
											</div>
										</div>
									</Card>
									{/* 3-й столбец */}
									<Card
										key='1'
										className='animate-fade-in p-4 opacity-0 transition-all duration-300 [animation-delay:var(--delay)] hover:shadow-md dark:bg-white'
										style={
											{
												'--delay': `${(2 * timeRanges.length + 7) * 100}ms`
											} as React.CSSProperties
										}
									>
										<div className='flex justify-between'>
											<span className='font-semibold text-black'>Ушедшие</span>
											<button className='text-gray-400 transition-colors hover:text-gray-600'>
												<MoreVertical className='h-5 w-5' />
											</button>
										</div>
										<div className='mt-3 flex items-center justify-center text-4xl font-bold text-gray-800'>
											<p>0.0%</p>{' '}
										</div>
										<div className='mt-3 w-full border-t border-t-gray-300'></div>
										<div className='mt-2 flex justify-between text-sm text-gray-500'>
											<div className='flex items-center'>
												<User className='h-5 w-5' />
												<span className='ml-2 text-sm'>10</span>
											</div>
											<div className='flex items-center'>
												<Euro className='h-5 w-5' />
												<span className='ml-2 text-sm'>327</span>
											</div>
										</div>
									</Card>
									{/* 4-й столбец */}
									<Card
										key='1'
										className='animate-fade-in p-4 opacity-0 transition-all duration-300 [animation-delay:var(--delay)] hover:shadow-md dark:bg-white'
										style={
											{
												'--delay': `${(2 * timeRanges.length + 8) * 100}ms`
											} as React.CSSProperties
										}
									>
										<div className='flex justify-between'>
											<span className='font-semibold text-black'>Потерянные</span>
											<button className='text-gray-400 transition-colors hover:text-gray-600'>
												<MoreVertical className='h-5 w-5' />
											</button>
										</div>
										<div className='mt-3 flex items-center justify-center text-4xl font-bold text-gray-800'>
											<p>0.0%</p>{' '}
										</div>
										<div className='mt-3 w-full border-t border-t-gray-300'></div>
										<div className='mt-2 flex justify-between text-sm text-gray-500'>
											<div className='flex items-center'>
												<User className='h-5 w-5' />
												<span className='ml-2 text-sm'>10</span>
											</div>
											<div className='flex items-center'>
												<Euro className='h-5 w-5' />
												<span className='ml-2 text-sm'>327</span>
											</div>
										</div>
									</Card>
								</div>
								{/* 4-9 заказа */}
								<div className='grid grid-cols-[120px_repeat(4,1fr)] gap-1'>
									<div className='flex w-[120px] items-center'>
										<span className='text-lg font-medium text-gray-600 dark:text-white/75'>
											4-9 заказов
										</span>
									</div>

									<Card
										key='1'
										className='animate-fade-in p-4 opacity-0 transition-all duration-300 [animation-delay:var(--delay)] hover:shadow-md dark:bg-white'
										style={
											{
												'--delay': `${(3 * timeRanges.length + 9) * 100}ms`
											} as React.CSSProperties
										}
									>
										<div className='flex justify-between'>
											<span className='font-semibold text-black'>Лояльные</span>
											<button className='text-gray-400 transition-colors hover:text-gray-600'>
												<MoreVertical className='h-5 w-5' />
											</button>
										</div>
										<div className='mt-3 flex items-center justify-center text-4xl font-bold text-gray-800'>
											<p>0.0%</p>{' '}
										</div>
										<div className='mt-3 w-full border-t border-t-gray-300'></div>
										<div className='mt-2 flex justify-between text-sm text-gray-500'>
											<div className='flex items-center'>
												<User className='h-5 w-5' />
												<span className='ml-2 text-sm'>10</span>
											</div>
											<div className='flex items-center'>
												<Euro className='h-5 w-5' />
												<span className='ml-2 text-sm'>327</span>
											</div>
										</div>
										<div className='mt-2 text-sm text-gray-500'>€0</div>
									</Card>
									{/* 2-й столбец */}
									<Card
										key='1'
										className='animate-fade-in p-4 opacity-0 transition-all duration-300 [animation-delay:var(--delay)] hover:shadow-md dark:bg-white'
										style={
											{
												'--delay': `${(3 * timeRanges.length + 10) * 100}ms`
											} as React.CSSProperties
										}
									>
										<div className='flex justify-between'>
											<span className='font-semibold text-black'>Уходящие</span>
											<button className='text-gray-400 transition-colors hover:text-gray-600'>
												<MoreVertical className='h-5 w-5' />
											</button>
										</div>
										<div className='mt-3 flex items-center justify-center text-4xl font-bold text-gray-800'>
											<p>0.0%</p>{' '}
										</div>
										<div className='mt-3 w-full border-t border-t-gray-300'></div>
										<div className='mt-2 flex justify-between text-sm text-gray-500'>
											<div className='flex items-center'>
												<User className='h-5 w-5' />
												<span className='ml-2 text-sm'>10</span>
											</div>
											<div className='flex items-center'>
												<Euro className='h-5 w-5' />
												<span className='ml-2 text-sm'>327</span>
											</div>
										</div>
									</Card>
									{/* 3-й столбец */}
									<Card
										key='1'
										className='animate-fade-in p-4 opacity-0 transition-all duration-300 [animation-delay:var(--delay)] hover:shadow-md dark:bg-white'
										style={
											{
												'--delay': `${(3 * timeRanges.length + 11) * 100}ms`
											} as React.CSSProperties
										}
									>
										<div className='flex justify-between'>
											<span className='font-semibold text-black'>Ушедшие</span>
											<button className='text-gray-400 transition-colors hover:text-gray-600'>
												<MoreVertical className='h-5 w-5' />
											</button>
										</div>
										<div className='mt-3 flex items-center justify-center text-4xl font-bold text-gray-800'>
											<p>0.0%</p>{' '}
										</div>
										<div className='mt-3 w-full border-t border-t-gray-300'></div>
										<div className='mt-2 flex justify-between text-sm text-gray-500'>
											<div className='flex items-center'>
												<User className='h-5 w-5' />
												<span className='ml-2 text-sm'>10</span>
											</div>
											<div className='flex items-center'>
												<Euro className='h-5 w-5' />
												<span className='ml-2 text-sm'>327</span>
											</div>
										</div>
									</Card>
									{/* 4-й столбец */}
									<Card
										key='1'
										className='animate-fade-in p-4 opacity-0 transition-all duration-300 [animation-delay:var(--delay)] hover:shadow-md dark:bg-white'
										style={
											{
												'--delay': `${(3 * timeRanges.length + 12) * 100}ms`
											} as React.CSSProperties
										}
									>
										<div className='flex justify-between'>
											<span className='font-semibold text-black'>Потерянные</span>
											<button className='text-gray-400 transition-colors hover:text-gray-600'>
												<MoreVertical className='h-5 w-5' />
											</button>
										</div>
										<div className='mt-3 flex items-center justify-center text-4xl font-bold text-gray-800'>
											<p>0.0%</p>{' '}
										</div>
										<div className='mt-3 w-full border-t border-t-gray-300'></div>
										<div className='mt-2 flex justify-between text-sm text-gray-500'>
											<div className='flex items-center'>
												<User className='h-5 w-5' />
												<span className='ml-2 text-sm'>10</span>
											</div>
											<div className='flex items-center'>
												<Euro className='h-5 w-5' />
												<span className='ml-2 text-sm'>327</span>
											</div>
										</div>
									</Card>
								</div>
								{/* 10 и более */}
								<div className='grid grid-cols-[120px_repeat(4,1fr)] gap-1'>
									<div className='flex w-[120px] items-center'>
										<span className='text-lg font-medium text-gray-600 dark:text-white/75'>
											10 и более
										</span>
									</div>

									<Card
										key='1'
										className='animate-fade-in p-4 opacity-0 transition-all duration-300 [animation-delay:var(--delay)] hover:shadow-md dark:bg-white'
										style={
											{
												'--delay': `${(4 * timeRanges.length + 13) * 100}ms`
											} as React.CSSProperties
										}
									>
										<div className='flex justify-between'>
											<span className='font-semibold text-black'>Лояльные</span>
											<button className='text-gray-400 transition-colors hover:text-gray-600'>
												<MoreVertical className='h-5 w-5' />
											</button>
										</div>
										<div className='mt-3 flex items-center justify-center text-4xl font-bold text-gray-800'>
											<p>0.0%</p>{' '}
										</div>
										<div className='mt-3 w-full border-t border-t-gray-300'></div>
										<div className='mt-2 flex justify-between text-sm text-gray-500'>
											<div className='flex items-center'>
												<User className='h-5 w-5' />
												<span className='ml-2 text-sm'>10</span>
											</div>
											<div className='flex items-center'>
												<Euro className='h-5 w-5' />
												<span className='ml-2 text-sm'>327</span>
											</div>
										</div>
									</Card>
									{/* 2-й столбец */}
									<Card
										key='1'
										className='animate-fade-in p-4 opacity-0 transition-all duration-300 [animation-delay:var(--delay)] hover:shadow-md dark:bg-white'
										style={
											{
												'--delay': `${(4 * timeRanges.length + 14) * 100}ms`
											} as React.CSSProperties
										}
									>
										<div className='flex justify-between'>
											<span className='font-semibold text-black'>Уходящие</span>
											<button className='text-gray-400 transition-colors hover:text-gray-600'>
												<MoreVertical className='h-5 w-5' />
											</button>
										</div>
										<div className='mt-3 flex items-center justify-center text-4xl font-bold text-gray-800'>
											<p>0.0%</p>{' '}
										</div>
										<div className='mt-3 w-full border-t border-t-gray-300'></div>
										<div className='mt-2 flex justify-between text-sm text-gray-500'>
											<div className='flex items-center'>
												<User className='h-5 w-5' />
												<span className='ml-2 text-sm'>10</span>
											</div>
											<div className='flex items-center'>
												<Euro className='h-5 w-5' />
												<span className='ml-2 text-sm'>327</span>
											</div>
										</div>
									</Card>
									{/* 3-й столбец */}
									<Card
										key='1'
										className='animate-fade-in p-4 opacity-0 transition-all duration-300 [animation-delay:var(--delay)] hover:shadow-md dark:bg-white'
										style={
											{
												'--delay': `${(4 * timeRanges.length + 15) * 100}ms`
											} as React.CSSProperties
										}
									>
										<div className='flex justify-between'>
											<span className='font-semibold text-black'>Ушедшие</span>
											<button className='text-gray-400 transition-colors hover:text-gray-600'>
												<MoreVertical className='h-5 w-5' />
											</button>
										</div>
										<div className='mt-3 flex items-center justify-center text-4xl font-bold text-gray-800'>
											<p>0.0%</p>{' '}
										</div>
										<div className='mt-3 w-full border-t border-t-gray-300'></div>
										<div className='mt-2 flex justify-between text-sm text-gray-500'>
											<div className='flex items-center'>
												<User className='h-5 w-5' />
												<span className='ml-2 text-sm'>10</span>
											</div>
											<div className='flex items-center'>
												<Euro className='h-5 w-5' />
												<span className='ml-2 text-sm'>327</span>
											</div>
										</div>
									</Card>
									{/* 4-й столбец */}
									<Card
										key='1'
										className='animate-fade-in p-4 opacity-0 transition-all duration-300 [animation-delay:var(--delay)] hover:shadow-md dark:bg-white'
										style={
											{
												'--delay': `${(4 * timeRanges.length + 16) * 100}ms`
											} as React.CSSProperties
										}
									>
										<div className='flex justify-between'>
											<span className='font-semibold text-black'>Потерянные</span>
											<button className='text-gray-400 transition-colors hover:text-gray-600'>
												<MoreVertical className='h-5 w-5' />
											</button>
										</div>
										<div className='mt-3 flex items-center justify-center text-4xl font-bold text-gray-800'>
											<p>0.0%</p>{' '}
										</div>
										<div className='mt-3 w-full border-t border-t-gray-300'></div>
										<div className='mt-2 flex justify-between text-sm text-gray-500'>
											<div className='flex items-center'>
												<User className='h-5 w-5' />
												<span className='ml-2 text-sm'>10</span>
											</div>
											<div className='flex items-center'>
												<Euro className='h-5 w-5' />
												<span className='ml-2 text-sm'>327</span>
											</div>
										</div>
									</Card>
								</div>
							</div>
						</div>

						{/* Right Sidebar */}
						<div className='lg:w-80'>
							<Card className='border border-gray-500/15 bg-white p-6 shadow-sm dark:border-white/15 dark:bg-gray-400/15'>
								<h2 className='mb-6 text-xl font-bold text-black dark:text-white'>
									ВИДЫ ГОСТЕЙ
								</h2>
								<div className='space-y-4'>
									{guestTypes.map(guest => (
										<div
											key={guest.type}
											className='group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-300 dark:hover:bg-gray-50/25'
										>
											<span className='text-black dark:text-white'>{guest.type}</span>
											<div className='flex items-center gap-3'>
												<span className={`${guest.color} font-medium`}>
													{guest.percentage}%
												</span>
												<button className='text-gray-400 opacity-0 transition-opacity hover:text-gray-600 group-hover:opacity-100'>
													<MoreVertical className='h-4 w-4' />
												</button>
											</div>
										</div>
									))}
								</div>
							</Card>
						</div>
					</div>
				</main>
			</div>
		</ScrollArea>
	)
}
