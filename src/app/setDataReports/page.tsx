'use client'

import { ReportsSettingsTable } from '@/components/main/ReportsSettingsTable'
import StaticReports from '@/components/main/StaticReports'
import { SidebarDemo } from '@/components/main/mailbar'
import { Dashboard } from '@/components/main/rightbar'

export default function ReportsSettingsPage() {
	return (
		<div className='h-screen w-screen bg-neutral-950'>
			<SidebarDemo>
				<Dashboard>
					<StaticReports />
				</Dashboard>
			</SidebarDemo>
		</div>
	)
}
