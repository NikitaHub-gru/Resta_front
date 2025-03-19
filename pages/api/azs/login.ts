import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		return res.status(405).json({ message: 'Method not allowed' })
	}

	try {
		const { username, password } = req.body

		const response = await axios.post(
			'https://cloud.minewtag.com/apis/action/login',
			{ username, password }
		)

		return res.status(200).json(response.data.data)
	} catch (error: any) {
		console.error('Login API error:', error.response?.data || error.message)
		return res.status(500).json({
			message: 'Error authenticating',
			error: error.response?.data || error.message
		})
	}
}
