'use client'

import { motion } from 'framer-motion'

interface WaveProgressBarProps {
	progress: number
	isLoading?: boolean
}

export function WaveProgressBar({ progress, isLoading }: WaveProgressBarProps) {
	const waveVariants = {
		animate: {
			x: ['-100%', '100%'],
			transition: {
				repeat: Infinity,
				duration: 2,
				ease: 'linear'
			}
		}
	}

	return (
		<div className='relative h-8 w-full overflow-hidden rounded-full bg-gray-100'>
			<motion.div
				className='absolute inset-0 bg-gradient-to-r from-green-500 to-green-600'
				initial={{ width: '0%' }}
				animate={{ width: `${progress}%` }}
				transition={{ duration: 0.5 }}
			>
				{!isLoading && (
					<motion.div
						className='absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-20'
						variants={waveVariants}
						animate='animate'
					/>
				)}
			</motion.div>
			<div className='absolute inset-0 flex items-center justify-center text-sm font-medium text-foreground dark:text-black'>
				{isLoading ? 'Loading...' : `${Math.round(progress)}%`}
			</div>
		</div>
	)
}
