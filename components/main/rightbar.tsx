'use client'

interface DashboardProps {
	children: React.ReactNode
}

export function Dashboard({ children }: DashboardProps) {
	return (
		<div className='flex flex-1'>
			<div className='flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-[#171717] md:p-10'>
				{children}
			</div>
		</div>
	)
}
