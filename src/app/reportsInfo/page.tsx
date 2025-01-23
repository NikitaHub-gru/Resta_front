'use client'

import ReportNavigation from '@/components/main/ReportNavigation'
import { SidebarDemo } from '@/components/main/mailbar'
import { Dashboard } from '@/components/main/rightbar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { WarpBackground } from '@/components/ui/warp-background'

export default function ReportsSettingsPage() {
	return (
		<div>
			<SidebarDemo>
				<Dashboard>
					<ScrollArea className='w-full'>
						<WarpBackground>
							<div className='flex justify-center px-4'>
								<div className='w-[950px] max-w-[1800px]'>
									<div className='rounded-xl bg-background/50 p-4 backdrop-blur-lg'>
										<ReportNavigation />
									</div>
								</div>
							</div>
						</WarpBackground>
					</ScrollArea>
				</Dashboard>
			</SidebarDemo>
		</div>
	)
}
