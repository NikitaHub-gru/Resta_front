'use client'

import { Session } from '@supabase/supabase-js'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import LoadingComponent from '@/components/main/loading-page'
import { supabase } from '@/lib/supabaseClient'

// Определяем публичные маршруты, которые не требуют аутентификации
const PUBLIC_ROUTES = ['/reportsInfo', '/', '/dashboard']

export default function AuthWrapper({
	children
}: {
	children: React.ReactNode
}) {
	const [isLoading, setIsLoading] = useState(true)
	const [session, setSession] = useState<Session | null>(null)
	const router = useRouter()
	const pathname = usePathname()

	useEffect(() => {
		const checkSession = async () => {
			const {
				data: { session }
			} = await supabase.auth.getSession()
			setSession(session)
			setIsLoading(false)

			// Если сессия отсутствует и текущий маршрут не является публичным, перенаправляем на страницу входа
			if (!session && !PUBLIC_ROUTES.includes(pathname)) {
				router.push('/login')
			}
		}

		checkSession()

		// Подписка на изменения состояния аутентификации
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session)
			if (!session && !PUBLIC_ROUTES.includes(pathname)) {
				router.push('/login')
			}
		})

		return () => subscription.unsubscribe()
	}, [pathname, router])

	if (isLoading) {
		return <LoadingComponent />
	}

	return <>{children}</>
}
