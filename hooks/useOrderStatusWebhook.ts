import { useEffect, useState } from 'react'

import { toast } from './use-toast'
import { supabase } from '@/lib/supabaseClient'

interface OrderStatus {
	order_id: string
	status: string
	timestamp: string
	courier_name?: string
	comment?: string
}

export const useOrderStatusWebhook = (orderId: string) => {
	const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null)

	useEffect(() => {
		// Подписываемся на обновления в реальном времени
		const channel = supabase
			.channel(`order-${orderId}`)
			.on('broadcast', { event: 'status_update' }, payload => {
				const newStatus = payload.payload as OrderStatus
				if (newStatus.order_id === orderId) {
					setOrderStatus(newStatus)

					toast({
						title: 'Статус заказа обновлен',
						description: `Новый статус: ${newStatus.status}`,
						variant: 'default'
					})
				}
			})
			.subscribe()

		return () => {
			channel.unsubscribe()
		}
	}, [orderId])

	return { orderStatus }
}
