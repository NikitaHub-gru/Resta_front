'use client'

import ReportTable from '@/components/main/ReportTable'
import { SidebarDemo } from '@/components/main/mailbar'
import { Dashboard } from '@/components/main/rightbar'
import ReportsCard from '@/components/reports/ReportsCard'

export default function ReportsPage() {
	return (
		<div className='h-screen w-screen bg-neutral-950'>
			<SidebarDemo>
				<Dashboard>
					<ReportTable />
					{/* <ReportsCard /> */}
				</Dashboard>
			</SidebarDemo>
		</div>
	)
}
