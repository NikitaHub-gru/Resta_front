'use client'

import { useEffect, useState } from 'react'

import { SidebarDemo } from '@/components/main/mailbar'
import { Dashboard } from '@/components/main/rightbar'
import { UserData, loadUserReport } from '@/hooks/getuserdata'

export default function ReportsPage() {
	const [selectedReport, setSelectedReport] = useState<UserData | null>(null)

	useEffect(() => {
		const loadReport = async () => {
			const report = await loadUserReport()
			if (report) {
				setSelectedReport(report)
			} else {
				console.warn('Отчет не найден или неактивен')
			}
		}
		loadReport()
	}, [])

	return (
		<div className='h-screen w-screen bg-neutral-950'>
			<SidebarDemo>
				<Dashboard>
					{selectedReport ? (
						selectedReport.role === 'User' ? (
							<div>{selectedReport.reports_id}</div>
						) : null
					) : (
						'Загрузка...'
					)}
				</Dashboard>
			</SidebarDemo>
		</div>
	)
}
