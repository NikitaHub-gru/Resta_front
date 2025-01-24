import { Info } from 'lucide-react'
import { useEffect, useState } from 'react'

import { BorderBeam } from './border-beam'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getAuthUser } from '@/hooks/getauthuser'

interface ReportInfoModalProps {
	title: string
	description: string
	description_info?: string
}

export function ReportInfoModal({
	title,
	description,
	description_info
}: ReportInfoModalProps) {
	const [userCorporation, setUserCorporation] = useState<string>('')

	useEffect(() => {
		const fetchUserData = async () => {
			const userData = await getAuthUser()
			setUserCorporation(userData.corporation || '')
		}
		fetchUserData()
	}, [])

	if (userCorporation !== 'RestaLabs') {
		return null
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size='icon' className='h-[30px]'>
					<Info className='h-[30px] w-[30px]' />
				</Button>
			</DialogTrigger>
			<DialogContent className='max-h-[90vh] w-full border-collapse overflow-hidden bg-white dark:bg-neutral-900 sm:max-w-[800px]'>
				<BorderBeam size={250} duration={12} delay={9} />
				<DialogHeader>
					<DialogDescription>
						{description_info && (
							<div className='mt-1 w-full'>
								<h4 className='mb-4 text-center text-lg'>
									Информация о отчете:
								</h4>
								<div
									className='relative w-full'
									style={{ height: 'calc(70vh - 100px)' }}
								>
									<ScrollArea className='absolute inset-0 h-full w-full'>
										<div className='justify-center px-8 py-4 text-sm text-foreground'>
											{description_info
												.split('\n\n')
												.map((paragraph, index) => (
													<p
														key={index}
														className='mb-4 whitespace-pre-line'
													>
														{paragraph}
													</p>
												))}
										</div>
									</ScrollArea>
								</div>
							</div>
						)}
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	)
}
