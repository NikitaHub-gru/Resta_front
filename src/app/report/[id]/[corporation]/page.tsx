'use client'

import DoccumentationPage from '@/components/main/DoccumentationP'
import ReportTable from '@/components/main/ReportTable'
import { SidebarDemo } from '@/components/main/mailbar'
import { Dashboard } from '@/components/main/rightbar'

export default function ReportPage({
	params
}: {
	params: { id: string; corporation: string }
}) {
	return (
		<div className='h-screen w-screen bg-neutral-950'>
			<SidebarDemo>
				<Dashboard>
					<ReportTable id={params.id} corporation={params.corporation} />
				</Dashboard>
			</SidebarDemo>
		</div>
	)
}
