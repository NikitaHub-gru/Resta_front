'use client'

import DoccumentationPage from '@/components/main/DoccumentationP'
import ReportTable from '@/components/main/ReportTable'
import { SidebarDemo } from '@/components/main/mailbar'
import { Dashboard } from '@/components/main/rightbar'

export default function ReportPage({
	params
}: {
	params: { id: number; corporation: string }
}) {
	return (
		<div className='h-screen w-screen bg-neutral-950'>
			<SidebarDemo>
				<div className='h-full w-full rounded-tl-2xl border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-[#171717]'>
					<ReportTable id={params.id} corporation={params.corporation} />
				</div>
			</SidebarDemo>
		</div>
	)
}
