'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'

export interface Order {
	id: number
	created_at: string
	org_id: string
	ord_id: string
	status: string
	completeBefore: string
	whenSended: string
	whenDelivered: string
	whenClosed?: string
	whenCreated: string
	externalNumber: string
	time: string
}

export function useOrders() {
	const [orders_db, setOrders] = useState<Order[]>()
	const [isLoadings, setIsLoadings] = useState(true)
	const [errors, setError] = useState<Error | null>(null)

	async function fetchOrders() {
		try {
			const { data, error } = await supabase
				.from('Orders')
				.select(
					'id, created_at, org_id, ord_id, status, completeBefore, whenSended, whenDelivered, whenClosed, whenCreated, externalNumber, time'
				)
				.order('created_at', { ascending: false })

			if (error) throw error
			setOrders(data)
		} catch (e) {
			setError(e as Error)
		} finally {
			setIsLoadings(false)
		}
	}

	useEffect(() => {
		fetchOrders()

		// Подписываемся на изменения в таблице Orders
		const channel = supabase
			.channel('orders_changes')
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'Orders' },
				() => {
					fetchOrders() // Обновляем данные при любых изменениях
				}
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [])

	return { orders_db, isLoadings, errors }
}
