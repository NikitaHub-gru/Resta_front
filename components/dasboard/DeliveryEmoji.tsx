'use client'

import { motion } from 'framer-motion'
import { BoomBox, Frown, Smile } from 'lucide-react'

interface DeliveryEmojiProps {
	duration: number
	index: number
	total: number
	size?: 'normal' | 'large' | 'big'
}

export function DeliveryEmoji({
	duration,
	index,
	total,
	size = 'normal'
}: DeliveryEmojiProps) {
	const isOnTime = duration <= 40
	const scale = size === 'big' ? 2 : size === 'large' ? 1 : 1 - index * 5
	const opacity = 100
	const baseSize = size === 'big' ? 4 : size === 'large' ? 3 : 2

	return (
		<motion.div
			initial={{ scale: 0, opacity: 0 }}
			animate={{ scale, opacity }}
			transition={{ duration: 0.3, ease: 'easeOut' }}
			className={`inline-flex items-center justify-center ${isOnTime ? 'text-green-500' : 'text-red-500'}`}
			style={{ fontSize: `${Math.max(1, scale * baseSize)}rem` }}
		>
			{isOnTime ? <Smile /> : <Frown />}
		</motion.div>
	)
}
