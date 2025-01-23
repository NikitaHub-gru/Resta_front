'use client'

import {
	IconArrowLeft,
	IconCalendarStar,
	IconFileTypeDoc,
	IconGitPullRequestDraft,
	IconHome,
	IconLayoutDashboardFilled,
	IconReportAnalytics,
	IconSettings,
	IconShoppingCartSearch,
	IconUserBolt,
	IconUsers
} from '@tabler/icons-react'
import { motion } from 'framer-motion'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { Sidebar, SidebarBody, useSidebar } from '../ui/sidebar'

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
}

export function SidebarDemo({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [userData, setUserData] = useState<UserData>({
		name: '',
		email: '',
		corporation: '',
		role: ''
	})
	const [isCollapsed, setIsCollapsed] = useState(false)

	useEffect(() => {
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
		},
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
						</div>
						{userData.role === 'Admin' && (
							<div className='mt-8 flex flex-col justify-start gap-2'>
								{adminLinks.map((link, idx) => (
									<SidebarLink key={idx} link={link} />
								))}
							</div>
						)}
						{(userData.role === 'Engineer' ||
							userData.role === 'Admin') && (
							<div className='mt-8 flex flex-col justify-start gap-2'>
								{Engineerlinks.map((link, idx) => (
									<SidebarLink key={idx} link={link} />
								))}
							</div>
						)}
					</div>

					<div>
						<div className='ml-[12.4px] flex flex-col justify-start gap-2 pb-4'>
							{renderThemeChanger()}
						</div>
						<SidebarLink
							link={{
								label: userData.name,
								href: '#',
								icon: (
									<IconUserBolt className='h-6 w-6 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
								)
							}}
						/>
					</div>

					<div className='flex flex-col justify-end gap-2'>
						<SidebarLink
							link={{
								label: 'Logout',
								href: '#',
								icon: (
									<IconArrowLeft className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
								),
								onClick: handleLogout
							}}
						/>
					</div>
				</SidebarBody>
			</Sidebar>
			{children}
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
