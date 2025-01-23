'use client'

import { IconMenu2, IconX } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import React, { createContext, useContext, useState } from 'react'

import { cn } from '@/lib/utils'

interface SidebarContextProps {
	open: boolean
	setOpen: React.Dispatch<React.SetStateAction<boolean>>
	animate: boolean
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined)

export const useSidebar = () => {
	const context = useContext(SidebarContext)
	if (!context) {
		throw new Error('useSidebar must be used within a SidebarProvider')
	}
	return context
}

export const SidebarProvider = ({
	children,
	open: openProp,
	setOpen: setOpenProp,
	animate = true
}: {
	children: React.ReactNode
	open?: boolean
	setOpen?: React.Dispatch<React.SetStateAction<boolean>>
	animate?: boolean
}) => {
	const [openState, setOpenState] = useState(false)

	const open = openProp !== undefined ? openProp : openState
	const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState

	return (
		<SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
			{children}
		</SidebarContext.Provider>
	)
}

export const Sidebar = ({
	children,
	open,
	setOpen,
	animate
}: {
	children: React.ReactNode
	open?: boolean
	setOpen?: React.Dispatch<React.SetStateAction<boolean>>
	animate?: boolean
}) => {
	return (
		<SidebarProvider open={open} setOpen={setOpen} animate={animate}>
			{children}
		</SidebarProvider>
	)
}

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
	return (
		<>
			<DesktopSidebar {...props} />
			<MobileSidebar {...(props as React.ComponentProps<'div'>)} />
		</>
	)
}

export const DesktopSidebar = ({
	className,
	children,
	...props
}: React.ComponentProps<typeof motion.div>) => {
	const { open, setOpen, animate } = useSidebar()
	return (
		<>
			<motion.div
				className={cn(
					'hidden h-full w-[300px] flex-shrink-0 bg-neutral-100 px-4 py-4 dark:bg-neutral-800 md:flex md:flex-col',
					className
				)}
				animate={{
					width: animate ? (open ? '300px' : '70px') : '300px'
				}}
				transition={{ duration: 0.3 }}
				onMouseEnter={() => setOpen(true)}
				onMouseLeave={() => setOpen(false)}
				{...props}
			>
				{children}
			</motion.div>
		</>
	)
}

export const MobileSidebar = ({
	className,
	children,
	...props
}: React.ComponentProps<'div'>) => {
	const { open, setOpen } = useSidebar()
	return (
		<>
			<div
				className={cn(
					'flex h-10 w-full flex-row items-center justify-between bg-neutral-100 px-4 py-4 dark:bg-neutral-800 md:hidden'
				)}
				{...props}
			>
				<div className='z-20 flex w-full justify-end'>
					<IconMenu2
						className='text-neutral-800 dark:text-neutral-200'
						onClick={() => setOpen(!open)}
					/>
				</div>
				<AnimatePresence>
					{open && (
						<motion.div
							initial={{ x: '-100%', opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: '-100%', opacity: 0 }}
							transition={{
								duration: 0.3,
								ease: 'easeInOut'
							}}
							className={cn(
								'fixed inset-0 z-[100] flex h-full w-full flex-col justify-between bg-white p-10 dark:bg-neutral-900',
								className
							)}
						>
							<div
								className='absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200'
								onClick={() => setOpen(!open)}
							>
								<IconX />
							</div>
							{children}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</>
	)
}

interface SidebarLinkProps {
	link: {
		label: string
		href: string
		icon: React.ReactNode
		onClick?: () => void
	}
}

export const SidebarLink = ({ link }: SidebarLinkProps) => {
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
			<span className='text-sm font-medium'>{link.label}</span>
		</Link>
	)
}
