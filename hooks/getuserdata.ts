import { getAuthUser } from './getauthuser'
import { supabase } from '@/lib/supabaseClient'

export interface UserData {
	email: string | undefined
	reports_id: string
	corporation: any
	role: string
}

export const getUserreport = async (
	email: string | undefined
): Promise<UserData | null> => {
	try {
		const { data, error } = await supabase
			.from('UsersReports')
			.select('*')
			.eq('email', email)

		if (error) throw error
		if (data && data.length > 0) {
			return data[0] as UserData
		} else {
			console.warn('Отчет не найден или неактивен')
			return null
		}
	} catch (error) {
		console.error('Ошибка при получении отчета:', error)
		return null
	}
}

// Пример использования
export const loadUserReport = async (): Promise<UserData | null> => {
	const authUser = await getAuthUser()
	if (authUser) {
		return await getUserreport(authUser.email)
	}
	return null
}
