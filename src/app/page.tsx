'use client'

import { FeaturesSection } from '@/components/main/features-section'
import { HeroSection } from '@/components/main/hero-section'
import { SidebarDemo } from '@/components/main/mailbar'
import { Navbar } from '@/components/main/navbar'
import { Dashboard } from '@/components/main/rightbar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ShootingStars } from '@/components/ui/shooting-stars'
import { StarsBackground } from '@/components/ui/stars-background'

export default function Home() {
	return (
		<div className='h-screen w-screen'>
			<SidebarDemo>
				<Dashboard>
					<ScrollArea className='h-full w-full'>
						<main className='min-h-screen'>
							<ShootingStars />
							<StarsBackground />
							<Navbar />
							<HeroSection />
							{/* <FeaturesSection /> */}
						</main>
						<ScrollBar orientation='vertical' />
					</ScrollArea>
				</Dashboard>
			</SidebarDemo>
		</div>
	)
}
