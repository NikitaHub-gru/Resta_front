'use client'

import { Loader2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useOrderStatusWebhook } from '@/hooks/useOrderStatusWebhook'
import { Order, useOrders } from '@/src/hooks/useOrders'

export default function TestOrderPage() {
	const { orders, isLoading, error } = useOrders()

	if (isLoading) {
		return (
			<div className='flex h-[50vh] items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
			</div>
		)
	}

	if (error) {
		return (
			<div className='container mx-auto p-4'>
				<p className='text-center text-red-500'>
					Ошибка загрузки заказов: {error.message}
				</p>
			</div>
		)
	}

	return (
		<div className='container mx-auto p-4'>
			<h1 className='mb-6 text-2xl font-bold'>Тестовые заказы</h1>
			<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{orders?.map(order => <OrderCard key={order.ord_id} order={order} />)}
			</div>
		</div>
	)
}

function OrderCard({ order }: { order: Order }) {
	const { orderStatus } = useOrderStatusWebhook(order.ord_id)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Заказ #{order.externalNumber || order.ord_id}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-2'>
					<div>
						<p className='text-sm text-muted-foreground'>
							Статус: {orderStatus?.status || order.status}
						</p>
						{orderStatus?.courier_name && (
							<p className='text-sm text-muted-foreground'>
								Курьер: {orderStatus.courier_name}
							</p>
						)}
						<p className='text-sm text-muted-foreground'>
							Создан: {new Date(order.created_at).toLocaleString()}
						</p>
						{order.whenSended && (
							<p className='text-sm text-muted-foreground'>
								Отправлен: {new Date(order.whenSended).toLocaleString()}
							</p>
						)}
						{order.whenDelivered && (
							<p className='text-sm text-muted-foreground'>
								Доставлен: {new Date(order.whenDelivered).toLocaleString()}
							</p>
						)}
						{orderStatus?.timestamp && (
							<p className='text-sm text-muted-foreground'>
								Последнее обновление: {new Date(orderStatus.timestamp).toLocaleString()}
							</p>
						)}
					</div>
					<div>
						<p className='text-sm font-medium'>ID организации: {order.org_id}</p>
						{order.completeBefore && (
							<p className='text-sm text-muted-foreground'>
								Доставить до: {new Date(order.completeBefore).toLocaleString()}
							</p>
						)}
					</div>
					{orderStatus?.comment && (
						<p className='text-sm text-muted-foreground'>
							Комментарий: {orderStatus.comment}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	)
}
