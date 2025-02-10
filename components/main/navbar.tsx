'use client'

import { ChartBar, Globe, Mail, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

export function Navbar() {
	const [showButton, setShowButton] = useState(false)

	useEffect(() => {
		const handleScroll = () => {
			const featuresSection = document.getElementById('features-section')
			if (featuresSection) {
				const rect = featuresSection.getBoundingClientRect()
				setShowButton(rect.top <= window.innerHeight)
			}
		}

		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	return (
		<div className='flex items-center justify-center'>
			<nav className='fixed w-[80vw] items-center bg-white backdrop-blur dark:supports-[backdrop-filter]:bg-[#171717]/60'>
				<div className='mx-auto max-w-7xl px-4 sm:px-4 lg:px-8'>
					<div className='flex h-16 items-center justify-between'>
						<div className='flex shrink-0 items-center'>
							<ChartBar className='h-8 w-8 text-primary' />
							<span className='ml-2 text-xl font-bold'>RestaLabs</span>
						</div>

						<div className='flex items-center gap-6 overflow-x-auto'>
							<div className='hidden shrink-0 items-center gap-2 md:flex'>
								<Phone className='h-5 w-5' />
								<span className='whitespace-nowrap'>+7 (923) 008-45-72</span>
							</div>
							<div className='hidden shrink-0 items-center gap-2 md:flex'>
								<Mail className='h-5 w-5' />
								<span className='whitespace-nowrap'>restalabs22brn@yandex.ru</span>
							</div>

							{showButton && <Button className='shrink-0'>Начать</Button>}
						</div>
					</div>
				</div>
			</nav>
		</div>
	)
}
