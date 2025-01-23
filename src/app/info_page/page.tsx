'use client'

import ReportsTable from '@/components/main/ReportTableInfo'
import { SidebarDemo } from '@/components/main/mailbar'
import { Dashboard } from '@/components/main/rightbar'

export default function ReportsPage() {
	return (
		<div className='h-screen w-screen bg-neutral-950'>
			<SidebarDemo>
				<Dashboard>
					<ReportsTable />
				</Dashboard>
			</SidebarDemo>
		</div>
	)
}
