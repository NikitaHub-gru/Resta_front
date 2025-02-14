import { format } from 'date-fns'
import { useEffect, useState } from 'react'

interface OlapResponse {
	data: any
}

export const useOlapData = (corporation: string) => {
	const [data, setData] = useState<OlapResponse | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchOlapData = async () => {
		setLoading(true)
		setError(null)

		try {
			const today = new Date()
			const formattedDate = format(today, 'yyyy-MM-dd')
			const url = `https://nikitahub-gru-resta-back-f1fb.twc1.net/olap/get_olap_sec?start_date=${formattedDate}&end_date=${formattedDate}&report_id=12&corporation=${encodeURIComponent(corporation)}`

			const response = await fetch(url, { method: 'POST' })

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const result = await response.json()
			setData(result)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch OLAP data')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (corporation) {
			fetchOlapData()
		}
	}, [corporation])

	return { data, loading, error }
}
