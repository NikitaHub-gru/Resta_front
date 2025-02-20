'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useOrderStatusWebhook } from '@/hooks/useOrderStatusWebhook'

// Генерируем 20 тестовых заказов
const testOrders = Array.from({ length: 20 }, (_, i) => ({
	order_id: `ORDER-${String(i + 1).padStart(3, '0')}`,
	initial_status: 'pending',
	courier_name: `Курьер ${i + 1}`,
	created_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
	delivery_address: `ул. Примерная, д. ${i + 1}`,
	customer_name: `Клиент ${i + 1}`,
	price: Math.floor(Math.random() * 2000 + 500)
}))

export default function TestOrderPage() {
	return (
		<div className='container mx-auto p-4'>
			<h1 className='mb-6 text-2xl font-bold'>Тестовые заказы</h1>
			<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{testOrders.map(order => (
					<OrderCard key={order.order_id} order={order} />
				))}
			</div>
		</div>
	)
}

function OrderCard({ order }: { order: any }) {
	const { orderStatus } = useOrderStatusWebhook(order.order_id)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Заказ #{order.order_id}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-2'>
					<div>
						<p className='text-sm font-medium'>
							Курьер: {orderStatus?.courier_name || order.courier_name}
						</p>
						<p className='text-sm text-muted-foreground'>
							Статус: {orderStatus?.status || order.initial_status}
						</p>
						<p className='text-sm text-muted-foreground'>
							Создан: {new Date(order.created_at).toLocaleString()}
						</p>
					</div>
					<div>
						<p className='text-sm font-medium'>Клиент: {order.customer_name}</p>
						<p className='text-sm text-muted-foreground'>
							Адрес: {order.delivery_address}
						</p>
						<p className='text-sm text-muted-foreground'>Сумма: {order.price} ₽</p>
					</div>
					{orderStatus?.comment && (
						<p className='text-sm text-muted-foreground'>
							Комментарий: {orderStatus.comment}
						</p>
					)}
					{orderStatus?.timestamp && (
						<p className='text-sm text-muted-foreground'>
							Обновлено: {new Date(orderStatus.timestamp).toLocaleString()}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	)
}
