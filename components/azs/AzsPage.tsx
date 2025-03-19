import {
	Box,
	CircularProgress,
	Container,
	InputAdornment,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
	useMediaQuery,
	useTheme
} from '@mui/material'
import axios from 'axios'
import { Search } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '../ui/button'

import { ScrollArea } from '@/components/ui/scroll-area'

const AzsPage: React.FC = () => {
	const theme = useTheme()
	const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
	const primaryColor = '#171717'
	const textColor = isDarkMode ? '#ffffff' : primaryColor
	const backgroundColor = isDarkMode ? primaryColor : '#ffffff'
	const paperBgColor = isDarkMode ? '#222222' : '#ffffff'

	const [loading, setLoading] = useState(false)
	const [updateLoading, setUpdateLoading] = useState(false)
	const [addLoading, setAddLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [goods, setGoods] = useState<any[]>([])
	const [searchTerm, setSearchTerm] = useState('')

	const fetchData = async () => {
		setLoading(true)
		setError(null)

		try {
			// Using Next.js API route to bypass CORS
			const authResponse = await axios.post('/api/azs/login', {
				username: 'real2_kafe@mail.ru',
				password: '0771f8e576e812c0811d21055799e82a'
			})

			const token = authResponse.data.token
			console.log('Authentication successful, token:', token)

			// Fetch goods data
			const goodsResponse = await axios.get('/api/azs/goods', {
				params: {
					storeId: '1856251011547533312',
					token: token
				}
			})

			console.log('Goods data response:', goodsResponse.data)

			// Check if data exists and set it to state
			if (Array.isArray(goodsResponse.data)) {
				setGoods(goodsResponse.data)
				console.log('Setting goods array directly:', goodsResponse.data)
			} else if (
				goodsResponse.data &&
				goodsResponse.data.items &&
				Array.isArray(goodsResponse.data.items)
			) {
				setGoods(goodsResponse.data.items)
				console.log('Setting goods from items:', goodsResponse.data.items)
			} else {
				// Try to extract data in a different way or use an empty array
				const dataToUse = Array.isArray(goodsResponse.data)
					? goodsResponse.data
					: goodsResponse.data && typeof goodsResponse.data === 'object'
						? [goodsResponse.data]
						: []

				console.log('Using fallback data approach:', dataToUse)
				setGoods(dataToUse)

				if (dataToUse.length === 0) {
					setError('No data received from server')
				}
			}
		} catch (err) {
			console.error('Error fetching data:', err)
			setError('Failed to fetch data. Please check console for details.')
		} finally {
			setLoading(false)
		}
	}

	// Function to update store prices
	const updateStorePrices = async () => {
		setUpdateLoading(true)
		setError(null)

		try {
			const response = await axios.post('/api/azs/update-store-prices')
			console.log('Update store prices response:', response.data)
			// Show success message or refresh data
			fetchData() // Refresh data after update
		} catch (err) {
			console.error('Error updating store prices:', err)
			setError('Failed to update store prices. Please check console for details.')
		} finally {
			setUpdateLoading(false)
		}
	}

	// Function to add positions
	const addPositions = async () => {
		setAddLoading(true)
		setError(null)

		try {
			const response = await axios.get('/api/azs/nomenclature')
			console.log('Add positions response:', response.data)
			// Show success message or refresh data
			fetchData() // Refresh data after adding positions
		} catch (err) {
			console.error('Error adding positions:', err)
			setError('Failed to add positions. Please check console for details.')
		} finally {
			setAddLoading(false)
		}
	}

	// Filter goods based on search term
	const filteredGoods = goods.filter(
		item =>
			item.base_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.base_price?.toString().includes(searchTerm) ||
			item.id?.toString().includes(searchTerm)
	)

	return (
		<Container maxWidth='lg'>
			<Box
				className='rounded-md bg-white p-4 shadow-md dark:bg-gray-50/15'
				sx={{
					my: 4,
					padding: 3,
					borderRadius: 2
				}}
			>
				<Typography
					variant='h4'
					component='h1'
					gutterBottom
					className='color-foreground'
				>
					Панель управления
				</Typography>

				<div className='mb-4 flex flex-wrap gap-2'>
					<Button onClick={fetchData} disabled={loading} className='mr-2'>
						{loading ? (
							<CircularProgress size={24} color='inherit' />
						) : (
							'Загрузить данные'
						)}
					</Button>

					<Button
						onClick={updateStorePrices}
						disabled={updateLoading}
						className='mr-2'
					>
						{updateLoading ? (
							<CircularProgress size={24} color='inherit' />
						) : (
							'Обновить цены'
						)}
					</Button>

					<Button onClick={addPositions} disabled={addLoading}>
						{addLoading ? (
							<CircularProgress size={24} color='inherit' />
						) : (
							'Добавить позиции'
						)}
					</Button>
				</div>

				{error && (
					<Typography color='error' sx={{ mt: 2 }}>
						{error}
					</Typography>
				)}

				{goods.length > 0 && (
					<>
						<Typography sx={{ mt: 2, mb: 2 }} className='text-foreground'>
							Загружено товаров: {goods.length}
						</Typography>

						<TextField
							fullWidth
							variant='outlined'
							placeholder='Поиск по названию, цене или ID'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							className='mb-3 border border-gray-50/15 bg-white text-foreground focus:border-gray-50/15 dark:bg-gray-50/15 dark:focus:border-gray-50/15'
							InputProps={{
								startAdornment: (
									<InputAdornment position='start'>
										<Search size={20} />
									</InputAdornment>
								)
							}}
						/>

						<ScrollArea className='h-[600px]'>
							<TableContainer
								component={Paper}
								className='bg-white text-foreground dark:bg-gray-50/15'
							>
								<Table sx={{ minWidth: 650 }} aria-label='goods table'>
									<TableHead>
										<TableRow className='bg-white text-foreground dark:bg-gray-50/15'>
											<TableCell className='bg-white text-foreground dark:bg-gray-50/15'>
												ID
											</TableCell>
											<TableCell className='bg-white text-foreground dark:bg-gray-50/15'>
												Название
											</TableCell>
											<TableCell
												align='right'
												className='bg-white text-foreground dark:bg-gray-50/15'
											>
												Цена
											</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{filteredGoods.map(item => (
											<TableRow
												key={item.id}
												className='border border-gray-50/15 bg-white text-foreground dark:bg-gray-50/15'
											>
												<TableCell component='th' scope='row' className='text-foreground'>
													{item.id}
												</TableCell>
												<TableCell className='text-foreground'>{item.base_name}</TableCell>
												<TableCell align='right' className='text-foreground'>
													{item.base_price} ₽
												</TableCell>
											</TableRow>
										))}
										{filteredGoods.length === 0 && (
											<TableRow>
												<TableCell colSpan={3} align='center' className='text-foreground'>
													Товары не найдены
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</TableContainer>
						</ScrollArea>
					</>
				)}
			</Box>
		</Container>
	)
}

export default AzsPage
