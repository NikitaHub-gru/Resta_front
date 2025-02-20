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

		// Отправляем событие через broadcast канал
		await supabase.channel('order-' + orderData.order_id).send({
			type: 'broadcast',
			event: 'status_update',
			payload: {
				order_id: orderData.order_id,
				status: orderData.status,
				courier_name: orderData.courier_name,
				comment: orderData.comment,
				timestamp: new Date().toISOString()
			}
		})

		return NextResponse.json(
			{ success: true, message: 'Уведомление отправлено' },
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
