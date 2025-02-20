import { useCallback, useState } from 'react'

import { toast } from './use-toast'
import { supabase } from '@/lib/supabaseClient'

interface OrderStatus {
	order_id: string
	status: string
	updated_at: string
	courier_name?: string
	comment?: string
}

interface UpdateResponse {
	success: boolean
	message: string
	data?: any
}

export const useOrderStatusUpdate = () => {
	const [isUpdating, setIsUpdating] = useState(false)

	const updateOrderStatus = useCallback(
		async (orderData: OrderStatus): Promise<UpdateResponse> => {
			setIsUpdating(true)

			try {
				// Обновляем статус заказа в базе данных
				const { data, error } = await supabase
					.from('orders')
					.update({
						status: orderData.status,
						updated_at: orderData.updated_at,
						courier_name: orderData.courier_name,
						comment: orderData.comment
					})
					.eq('order_id', orderData.order_id)
					.select()

				if (error) {
					throw error
				}

				// Показываем уведомление об успешном обновлении
				toast({
					title: 'Статус заказа обновлен',
					description: `Заказ №${orderData.order_id} успешно обновлен`,
					variant: 'default'
				})

				return {
					success: true,
					message: 'Статус заказа успешно обновлен',
					data
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Произошла ошибка при обновлении статуса'

				// Показываем уведомление об ошибке
				toast({
					title: 'Ошибка обновления',
					description: errorMessage,
					variant: 'destructive'
				})

				return {
					success: false,
					message: errorMessage
				}
			} finally {
				setIsUpdating(false)
			}
		},
		[]
	)

	return {
		updateOrderStatus,
		isUpdating
	}
}
