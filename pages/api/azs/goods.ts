import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		return res.status(405).json({ message: 'Method not allowed' })
	}

	try {
		const { storeId, token, size = '500' } = req.query

		if (!token || typeof token !== 'string') {
			return res.status(400).json({ message: 'Token is required' })
		}

		// Fetch data from pages 1 to 3 and combine the results
		const allData = []

		for (let page = 1; page <= 2; page++) {
			const response = await axios.get(
				`https://cloud.minewtag.com/apis/esl/goods/getByStoreId?=&page=${page}&size=${size}&storeId=${storeId}`,
				{
					headers: {
						token: token
					}
				}
			)

			// Check if response.data.items exists and is an array
			if (
				response.data &&
				response.data.items &&
				Array.isArray(response.data.items)
			) {
				allData.push(...response.data.items)
			}

			// If we get fewer items than the requested size, we've reached the end
			if (
				!response.data ||
				!response.data.items ||
				response.data.items.length < Number(size)
			) {
				break
			}
		}

		return res.status(200).json(allData)
	} catch (error: any) {
		console.error('Goods API error:', error.response?.data || error.message)
		return res.status(500).json({
			message: 'Error fetching goods',
			error: error.response?.data || error.message
		})
	}
}
