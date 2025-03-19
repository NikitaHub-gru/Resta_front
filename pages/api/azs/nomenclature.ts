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
    const response = await axios.get(
      'https://nikitahub-gru-resta-back-c88a.twc1.net/azs_nomenclature'
    )

    return res.status(200).json(response.data)
  } catch (error: any) {
    console.error('Nomenclature API error:', error.response?.data || error.message)
    return res.status(500).json({
      message: 'Error fetching nomenclature',
      error: error.response?.data || error.message
    })
  }
}