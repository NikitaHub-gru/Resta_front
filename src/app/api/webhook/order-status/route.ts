import { NextResponse } from 'next/server'

import { supabase } from '@/lib/supabaseClient'

// Секретный ключ для верификации webhook
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

export async function POST(request: Request) {
	try {
		// Проверяем подпись webhook
		const signature = request.headers.get('x-webhook-signature')
		if (!signature || signature !== WEBHOOK_SECRET) {
			return NextResponse.json(
				{ success: false, message: 'Неверная подпись webhook' },
				{ status: 401 }
			)
		}

		// Получаем данные от внешнего бэкенда
		const orderData = await request.json()

		// Проверяем существование заказа
		const { data: existingOrder } = await supabase
			.from('Orders')
			.select('ord_id')
			.eq('ord_id', orderData.order_id)
			.single()

		if (!existingOrder) {
			// Создаем новую запись, если заказ не найден
			const { error: insertError } = await supabase.from('Orders').insert({
				ord_id: orderData.order_id,
				whenClosed: orderData?.whenClosed,
				whenCreated: orderData.whenCreated,
				status: orderData.status,
				whenDelivered: orderData.whenDelivered,
				whenSended: orderData.whenSended,
				org_id: orderData.org_id,
				externalNumber: orderData.externalNumber,
				completeBefore: orderData.completeBefore,
				created_at: new Date().toISOString()
			})

			if (insertError) throw insertError
		} else {
			// Обновляем существующую запись
			const { error: updateError } = await supabase
				.from('Orders')
				.update({
					status: orderData.status,
					whenDelivered: orderData.whenDelivered,
					whenSended: orderData.whenSended,
					whenClosed: orderData?.whenClosed,
					whenCreated: orderData.whenCreated
				})
				.eq('ord_id', orderData.order_id)

			if (updateError) throw updateError
		}

		// Отправляем событие через broadcast канал
		await supabase.channel('order-' + orderData.order_id).send({
			type: 'broadcast',
			event: 'status_update',
			payload: {
				order_id: orderData.order_id,
				whenClosed: orderData?.whenClosed,
				whenCreated: orderData.whenCreated,
				status: orderData.status,
				courier_name: orderData.courier_name,
				comment: orderData.comment,
				timestamp: new Date().toISOString()
			}
		})

		return NextResponse.json(
			{ success: true, message: 'Статус заказа обновлен' },
			{ status: 200 }
		)
	} catch (error) {
		console.error('Webhook error:', error)
		return NextResponse.json(
			{ success: false, message: 'Ошибка обработки webhook' },
			{ status: 500 }
		)
	}
}
