'use client'

import {
	IconArrowLeft,
	IconCalendarStar,
	IconFileTypeDoc,
	IconGitPullRequestDraft,
	IconGlobe,
	IconHome,
	IconKey,
	IconLanguage,
	IconLayoutDashboardFilled,
	IconLogout,
	IconReportAnalytics,
	IconSettings,
	IconShoppingCartSearch,
	IconUserBolt,
	IconUsers
} from '@tabler/icons-react'
import { motion } from 'framer-motion'
import { MoonIcon, Settings2, SquareChartGantt, SunIcon } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Tooltip } from 'react-tooltip'

import { Button } from '../ui/button'
import { Sidebar, SidebarBody, useSidebar } from '../ui/sidebar'

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger
} from '@/components/ui/collapsible'
import { getAuthUser } from '@/hooks/getauthuser'
import { supabase } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils'

interface SidebarLinkProps {
	link: {
		label: string
		href: string
		icon?: React.ReactNode
		onClick?: () => void
	}
}

interface UserData {
	name: string
	email: string
	corporation: string
	role: string
	first_name: string
}

export function SidebarDemo({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [isProfileOpen, setIsProfileOpen] = useState(false)
	const [userData, setUserData] = useState<UserData>({
		name: '',
		email: '',
		corporation: '',
		role: '',
		first_name: ''
	})
	const [isCollapsed, setIsCollapsed] = useState(false)

	useEffect(() => {
		const fetchUser = async () => {
			const user = (await getAuthUser()) as {
				email: string | undefined
				name: any
				full_name: string
				corporation: any
				role: string
			}
			setUserData({
				name: user?.name || '',
				email: user?.email || '',
				corporation: user?.corporation || 'RestaLabs',
				role: user?.role || '',
				first_name: user?.full_name || '' // Map full_name to first_name
			})
		}
		fetchUser()
	}, [])

	const { systemTheme, theme, setTheme } = useTheme()
	const renderThemeChanger = () => {
		const currentTheme = theme === 'system' ? systemTheme : theme

		if (currentTheme === 'dark') {
			return (
				<SunIcon
					className='h-5 w-5 flex-shrink-0 justify-start text-neutral-700 dark:text-neutral-200'
					role='button'
					onClick={() => setTheme('light')}
				/>
			)
		} else {
			return (
				<MoonIcon
					className='h-5 w-5 flex-shrink-0 justify-start text-neutral-700 dark:text-neutral-200'
					role='button'
					onClick={() => setTheme('dark')}
				/>
			)
		}
	}

	const handleProfileClick = () => {
		setIsProfileOpen(true)
	}

	const handleLogout = async () => {
		const { error } = await supabase.auth.signOut()
		if (error) {
			console.error('Error logging out:', error)
		} else {
			router.push('/login')
		}
	}

	const links = [
		{
			label: 'Главная',
			href: '/',
			icon: (
				<IconHome className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
			)
		}
	]

	const mainSection = {
		title: 'Основное',
		items: [
			...(userData.corporation === 'RestaLabs'
				? [
						{
							label: 'Поиск заказов',
							href: '/orders',
							icon: (
								<IconShoppingCartSearch className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
							)
						},
						{
							label: 'Отчеты',
							href: '/reports',
							icon: (
								<IconLayoutDashboardFilled className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
							)
						},
						{
							label: 'История',
							href: '/history',
							icon: (
								<IconCalendarStar className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
							)
						},
						{
							label: 'Настройка отчетов',
							href: '/setDataReports',
							icon: (
								<Settings2 className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
							)
						},
						{
							label: 'Мини дашбоард',
							href: '/mini_dashboard',
							icon: (
								<SquareChartGantt className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
							)
						}
					]
				: userData.corporation === 'Grill№1'
					? [
							{
								label: 'Поиск заказов',
								href: '/orders',
								icon: (
									<IconShoppingCartSearch className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
								)
							}
						]
					: userData.corporation === 'DimmiYammi'
						? [
								{
									label: 'Мини дашбоард',
									href: '/mini_dashboard',
									icon: (
										<SquareChartGantt className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
									)
								}
							]
						: userData.corporation === 'Грильница'
							? [
									{
										label: 'Отчеты',
										href: '/reports',
										icon: (
											<IconLayoutDashboardFilled className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
										)
									},
									{
										label: 'История',
										href: '/history',
										icon: (
											<IconCalendarStar className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
										)
									},
									{
										label: 'Настройка отчетов',
										href: '/setDataReports',
										icon: (
											<Settings2 className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
										)
									}
								]
							: [
									{
										label: 'Отчеты',
										href: '/reports',
										icon: (
											<IconLayoutDashboardFilled className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
										)
									}
								]),

			{
				label: 'Dashboard',
				href: '/dashboard',
				icon: (
					<IconReportAnalytics className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
				)
			}
		]
	}

	const adminLinks = [
		{
			label: 'Админка',
			href: '#',
			className: 'py-4 gap-2 '
		},
		{
			label: 'Настройки',
			href: '/reportsSettings',
			icon: (
				<IconSettings className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
			)
		},
		{
			label: 'Пользователи',
			href: '/users',
			icon: (
				<IconUsers className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
			)
		},
		{
			label: 'Документация',
			href: '/docs',
			icon: (
				<IconFileTypeDoc className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
			)
		}
	]
	const Engineerlinks = [
		{
			label: 'Инженеры',
			href: '#',
			className: 'py-4 gap-2 '
		},
		{
			label: 'API',
			href: '/request',
			icon: (
				<IconGitPullRequestDraft className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
			)
		}
	]

	return (
		<div
			className={cn(
				'flex w-full flex-col overflow-hidden border border-neutral-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800 md:flex-row',
				'h-screen'
			)}
		>
			<Sidebar open={open} setOpen={setOpen}>
				<SidebarBody className='justify-between gap-2'>
					<div className='flex flex-1 flex-col overflow-y-auto overflow-x-hidden'>
						{open ? <Logo userData={userData} /> : <LogoIcon />}
						<div className='mt-8 flex flex-col gap-2'>
							{links.map((link, idx) => (
								<SidebarLink key={idx} link={link} />
							))}

							<Collapsible>
								<CollapsibleTrigger className='flex w-full items-center justify-between rounded-lg px-3 py-2 text-neutral-700 transition-all duration-150 hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-700'>
									<div className='flex items-center gap-2'>
										<IconLayoutDashboardFilled className='h-5 w-5' />
										{open && (
											<span className='text-sm font-medium'>{mainSection.title}</span>
										)}
									</div>
									{open && <ChevronDown className='h-4 w-4' />}
								</CollapsibleTrigger>
								<CollapsibleContent>
									<div className='ml-2 flex flex-col gap-1'>
										{mainSection.items.map((item, idx) => (
											<SidebarLink key={idx} link={item} />
										))}
									</div>
								</CollapsibleContent>
							</Collapsible>

							{userData.role === 'Admin' && (
								<Collapsible>
									<CollapsibleTrigger className='flex w-full items-center justify-between rounded-lg px-3 py-2 text-neutral-700 transition-all duration-150 hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-700'>
										<div className='flex items-center gap-2'>
											<IconSettings className='h-5 w-5' />
											{open && <span className='text-sm font-medium'>Админка</span>}
										</div>
										{open && <ChevronDown className='h-4 w-4' />}
									</CollapsibleTrigger>
									<CollapsibleContent>
										<div className='ml-2 flex flex-col gap-1'>
											{adminLinks.slice(1).map((link, idx) => (
												<SidebarLink key={idx} link={link} />
											))}
										</div>
									</CollapsibleContent>
								</Collapsible>
							)}

							{(userData.role === 'Engineer' || userData.role === 'Admin') && (
								<Collapsible>
									<CollapsibleTrigger className='flex w-full items-center justify-between rounded-lg px-3 py-2 text-neutral-700 transition-all duration-150 hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-700'>
										<div className='flex items-center gap-2'>
											<IconGitPullRequestDraft className='h-5 w-5' />
											{open && <span className='text-sm font-medium'>Инженеры</span>}
										</div>
										{open && <ChevronDown className='h-4 w-4' />}
									</CollapsibleTrigger>
									<CollapsibleContent>
										<div className='ml-2 flex flex-col gap-1'>
											{Engineerlinks.slice(1).map((link, idx) => (
												<SidebarLink key={idx} link={link} />
											))}
										</div>
									</CollapsibleContent>
								</Collapsible>
							)}
						</div>
					</div>

					<div>
						<div className='ml-[12.4px] flex flex-col justify-start gap-2 pb-4'></div>
						<SidebarLink
							link={{
								label: userData.name,
								href: '#',
								icon: (
									<IconUserBolt className='h-6 w-6 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
								),
								onClick: handleProfileClick
							}}
						/>
					</div>
				</SidebarBody>
			</Sidebar>
			{children}
			{isProfileOpen && (
				<motion.div
					className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3, ease: 'easeInOut' }}
				>
					<motion.div
						className='w-96 rounded-2xl border border-black/20 bg-white p-6 shadow-2xl dark:border-white/15 dark:bg-neutral-900'
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.8, opacity: 0 }}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
					>
						<h2 className='mb-6 text-center text-2xl font-bold text-neutral-800 dark:text-neutral-100'>
							Настройки профиля
						</h2>
						<div className='mb-6 space-y-4'>
							<div className='rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800'>
								<p className='text-neutral-700 dark:text-neutral-200'>
									<strong className='font-semibold'>Имя:</strong>{' '}
									{`${userData.first_name} ${userData.name}`}
								</p>
							</div>
							<div className='rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800'>
								<p className='text-neutral-700 dark:text-neutral-200'>
									<strong className='font-semibold'>Email:</strong> {userData.email}
								</p>
							</div>
							<div className='rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800'>
								<p className='text-neutral-700 dark:text-neutral-200'>
									<strong className='font-semibold'>Подразделение:</strong>{' '}
									{userData.corporation}
								</p>
							</div>
							<div className='rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800'>
								<p className='text-neutral-700 dark:text-neutral-200'>
									<strong className='font-semibold'>Роль:</strong> {userData.role}
								</p>
							</div>
							<div className='rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800'>
								<p className='flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-200'>
									Действия с профилем
								</p>
							</div>
							<div className='flex justify-center gap-4'>
								{/* Кнопка выхода */}
								<button
									className='flex items-center justify-between rounded-lg bg-neutral-100 px-4 dark:bg-neutral-800'
									data-tooltip-id='tooltip'
									data-tooltip-content='Завершение текущей сессии'
									onClick={handleLogout}
								>
									<IconLogout className='my-3 h-5 w-5' />
								</button>

								{/* Кнопка смены пароля */}
								<button
									className='flex items-center justify-between rounded-lg bg-neutral-100 px-4 dark:bg-neutral-800'
									data-tooltip-id='tooltip'
									data-tooltip-content='Обновление пароля аккаунта'
								>
									<IconKey className='h-5 w-5' />
								</button>

								{/* Кнопка смены языка */}
								<button
									className='flex items-center justify-between rounded-lg bg-neutral-100 px-4 dark:bg-neutral-800'
									data-tooltip-id='tooltip'
									data-tooltip-content='Изменение языка интерфейса'
								>
									<IconLanguage className='h-5 w-5' />
								</button>

								{/* Кнопка смены темы */}
								<div
									className='flex items-center justify-between rounded-lg bg-neutral-100 px-4 dark:bg-neutral-800'
									data-tooltip-id='tooltip'
									data-tooltip-content='Изменение темы интерфейса'
								>
									{renderThemeChanger()}
								</div>

								<Tooltip
									id='tooltip'
									className='!bg-neutral-800 !text-neutral-100 !opacity-95'
									place='top'
								/>
							</div>
						</div>
						<Button
							onClick={() => setIsProfileOpen(false)}
							className='w-full rounded-lg'
						>
							Закрыть
						</Button>
					</motion.div>
				</motion.div>
			)}
		</div>
	)
}
export const Logo = ({
	userData
}: {
	userData: { name: string; email: string; corporation: string }
}) => {
	return (
		<Link
			href='#'
			className='relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black'
		>
			<div className='h-5 w-6 flex-shrink-0 rounded-bl-sm rounded-br-lg rounded-tl-lg rounded-tr-sm bg-black dark:bg-white' />
			<motion.span
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className='whitespace-pre font-medium text-black dark:text-white'
			>
				{userData.corporation}
			</motion.span>
		</Link>
	)
}
export const LogoIcon = () => {
	return (
		<Link
			href='#'
			className='relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black'
		>
			<div className='h-5 w-6 flex-shrink-0 rounded-bl-sm rounded-br-lg rounded-tl-lg rounded-tr-sm bg-black dark:bg-white' />
		</Link>
	)
}

// Dummy dashboard component with content

const SidebarLink = ({ link }: SidebarLinkProps) => {
	const { open } = useSidebar()
	const handleClick = (e: React.MouseEvent) => {
		if (link.onClick) {
			e.preventDefault()
			link.onClick()
		}
	}

	return (
		<Link
			href={link.href}
			onClick={handleClick}
			className='flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-700 transition-all duration-150 hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-700'
		>
			{link.icon}
			{open && (
				<motion.span
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className='text-sm font-medium'
				>
					{link.label}
				</motion.span>
			)}
		</Link>
	)
}
