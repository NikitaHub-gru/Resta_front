'use client'

import { motion } from 'framer-motion'
import { FrownIcon, MehIcon, SmileIcon } from 'lucide-react'

interface DeliveryEmojiProps {
	size: 'small' | 'big' | 'large'
	duration: number
	index?: number
	total?: number
	color?: string
	mood?: 'happy' | 'neutral' | 'sad'
}

export function DeliveryEmoji({
	size,
	duration,
	color = '#4CAF50',
	mood = 'happy'
}: DeliveryEmojiProps) {
	const scale = size === 'big' ? 2 : size === 'large' ? 1.5 : 1
	const baseSize = size === 'big' ? 4 : size === 'large' ? 3 : 2

	const getEmoji = () => {
		switch (mood) {
			case 'sad':
				return <FrownIcon style={{ color, opacity: 1 }} />
			case 'neutral':
				return <MehIcon style={{ color, opacity: 1 }} />
			default:
				return <SmileIcon style={{ color, opacity: 1 }} />
		}
	}

	return (
		<motion.div
			initial={{ scale: 0, opacity: 0 }}
			animate={{ scale, opacity: 1 }}
			transition={{ duration: 0.3, ease: 'easeOut' }}
			className='inline-flex items-center justify-center'
			style={{ fontSize: `${Math.max(1, scale * baseSize)}rem` }}
		>
			{getEmoji()}
		</motion.div>
	)
}
