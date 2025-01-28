'use client'

import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Pencil, PlusCircle, Search, Trash2 } from 'lucide-react'
import { Check } from 'lucide-react'
import { CheckCircle2 } from 'lucide-react'
import { CircleX } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { EditUserDialog } from '@/components/ui/edit-user-dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'

interface UserData {
	id: string
	email: string
	role?: string
	created_at: string
	corporation: string
	first_name?: string
	name?: string
	password?: string
}

export function UserTable() {
	const [users, setUsers] = useState<UserData[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [loading, setLoading] = useState(true)
	const { toast } = useToast()
	const [userToDelete, setUserToDelete] = useState<UserData | null>(null)
	const [editingUser, setEditingUser] = useState<UserData | null>(null)
	const [currentUserCorporation] = useState<string>('RestaLabs')
	const [isAddingUser, setIsAddingUser] = useState(false)

	const fetchUsers = async () => {
		try {
			let url =
				'https://nikitahub-gru-resta-back-f1fb.twc1.net/olap/users'

			if (
				currentUserCorporation &&
				currentUserCorporation !== 'RestaLabs'
			) {
				url += `?corporation=${currentUserCorporation}`
			}

			const response = await fetch(url)
			if (!response.ok) throw new Error('Failed to fetch users')

			const { data } = await response.json()
			setUsers(data)
		} catch (error) {
			console.error('Ошибка при загрузке пользователей:', error)
			toast({
				title: 'Ошибка',
				description: 'Не удалоь загрузить список поьзователей',
				variant: 'destructive'
			})
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchUsers()
	}, [])

	const filteredUsers = users.filter(user => {
		const searchLower = searchTerm.toLowerCase()
		return user.email?.toLowerCase().includes(searchLower)
	})

	const formatDate = (dateString: string): string => {
		try {
			const date = new Date(dateString)
			return format(date, 'd MMMM yyyy HH:mm', { locale: ru })
		} catch {
			return dateString
		}
	}

	const handleDeleteUser = async (user: UserData) => {
		try {
			if (
				currentUserCorporation !== 'RestaLabs' &&
				user.corporation !== currentUserCorporation
			) {
				throw new Error(
					'У вас нет прав для удаления этого пользователя'
				)
			}

			const response = await fetch(
				`https://nikitahub-gru-resta-back-f1fb.twc1.net/olap/delete_users/${user.id}`,
				{
					method: 'POST'
				}
			)

			const result = await response.json()
			console.log('Server response:', result)

			if (result.toString() === 'True') {
				toast({
					title: '',
					description: (
						<div>
							<Alert className='border-0 bg-transparent'>
								<div className='flex items-center'>
									<CheckCircle2 className='ml-1 h-4 w-4 text-green-500' />
									<AlertTitle className='ml-2 text-green-500'>
										Успешно
									</AlertTitle>
								</div>
								<AlertDescription className='ml-2 text-muted-foreground'>
									Пользователь {user.email} был успешно удален
								</AlertDescription>
							</Alert>
						</div>
					),
					variant: 'default',
					duration: 4000,
					className: 'slide-in-out'
				})

				await fetchUsers()
			} else {
				toast({
					title: '',
					description: (
						<div>
							<Alert className='border-0 bg-transparent'>
								<div className='flex items-center'>
									<CircleX className='ml-1 h-4 w-4 text-red-600' />
									<AlertTitle className='ml-2 text-[1.2rem] text-red-600'>
										Ошибка
									</AlertTitle>
								</div>
								<AlertDescription className='ml-2 text-muted-foreground'>
									Не удалось удалить пользователя {user.email}
								</AlertDescription>
							</Alert>
						</div>
					),
					variant: 'default',
					duration: 4000,
					className: 'slide-in-out'
				})
			}
		} catch (error) {
			console.error('Error during delete:', error)
			toast({
				title: '',
				description: (
					<Alert className='border-0 bg-transparent'>
						<div className='flex items-center'>
							<CircleX className='ml-1 h-4 w-4 text-red-600' />
							<AlertTitle className='ml-2 text-red-600'>
								Ошибка
							</AlertTitle>
						</div>
						<AlertDescription className='ml-2 text-muted-foreground'>
							{error instanceof Error
								? error.message
								: 'Не удалось удалить пользователя'}
						</AlertDescription>
					</Alert>
				),
				variant: 'default'
			})
		} finally {
			setUserToDelete(null)
		}
	}

	const handleSaveUser = async (userData: UserData) => {
		try {
			if (!editingUser) return

			if (
				currentUserCorporation !== 'RestaLabs' &&
				editingUser.corporation !== currentUserCorporation
			) {
				throw new Error(
					'У вас нет прав для редактирвания этого пользователя'
				)
			}

			if (currentUserCorporation !== 'RestaLabs') {
				userData.corporation = currentUserCorporation
			}

			const numericId = editingUser.id.replace(/-/g, '')

			const queryParams = new URLSearchParams()
			if (userData.email) queryParams.set('email', userData.email)
			if (userData.first_name)
				queryParams.set('first_name', userData.first_name)
			if (userData.name) queryParams.set('name', userData.name)
			if (userData.corporation)
				queryParams.set('corporation', userData.corporation)
			if (userData.role) queryParams.set('role', userData.role)
			if (userData.password)
				queryParams.set('password', userData.password)

			const response = await fetch(
				`https://nikitahub-gru-resta-back-f1fb.twc1.net/olap/edit_user/${numericId}?${queryParams}`,
				{ method: 'PUT' }
			)

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.detail || 'Failed to update user')
			}

			toast({
				title: '',
				description: (
					<Alert className='border-0 bg-transparent'>
						<div className='flex items-center'>
							<CheckCircle2 className='ml-1 h-4 w-4 text-green-500' />
							<AlertTitle className='ml-2 text-green-500'>
								Успешно
							</AlertTitle>
						</div>
						<AlertDescription className='ml-2 text-muted-foreground'>
							Пользователь {userData.email} успешно обновлен
						</AlertDescription>
					</Alert>
				),
				variant: 'default'
			})

			await fetchUsers()
		} catch (error) {
			console.error('Error updating user:', error)
			toast({
				title: '',
				description: (
					<Alert className='border-0 bg-transparent'>
						<div className='flex items-center'>
							<CircleX className='ml-1 h-4 w-4 text-red-600' />
							<AlertTitle className='ml-2 text-red-600'>
								Ошибка
							</AlertTitle>
						</div>
						<AlertDescription className='ml-2 text-muted-foreground'>
							{error instanceof Error
								? error.message
								: 'Не удалось обновить пользователя'}
						</AlertDescription>
					</Alert>
				),
				variant: 'default'
			})
		} finally {
			setEditingUser(null)
		}
	}

	const handleCreateUser = async (userData: UserData) => {
		try {
			console.log('Creating user with data:', userData)

			// Формируем URL в правильном формате
			const url = `https://nikitahub-gru-resta-back-f1fb.twc1.net/olap/create_user/${userData.email}/${userData.password}/${userData.role}/${userData.name}/${userData.first_name}/${currentUserCorporation !== 'RestaLabs' ? currentUserCorporation : userData.corporation}`

			console.log('Request URL:', url)

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(
					errorData.detail || 'Не удалось создать пользователя'
				)
			}

			toast({
				title: '',
				description: (
					<Alert className='border-0 bg-transparent'>
						<div className='flex items-center'>
							<CheckCircle2 className='ml-1 h-4 w-4 text-green-500' />
							<AlertTitle className='ml-2 text-green-500'>
								Успешно
							</AlertTitle>
						</div>
						<AlertDescription className='ml-2 text-muted-foreground'>
							Пользователь {userData.email} успешно создан
						</AlertDescription>
					</Alert>
				),
				variant: 'default'
			})

			// Закрываем диалог
			setIsAddingUser(false)
			// Обновляем список пользователей
			await fetchUsers()
		} catch (error) {
			console.error('Error creating user:', error)
			toast({
				title: '',
				description: (
					<Alert className='border-0 bg-transparent'>
						<div className='flex items-center'>
							<CircleX className='ml-1 h-4 w-4 text-red-600' />
							<AlertTitle className='ml-2 text-red-600'>
								Ошибка
							</AlertTitle>
						</div>
						<AlertDescription className='ml-2 text-muted-foreground'>
							{error instanceof Error
								? error.message
								: 'Не удалось создать пользователя'}
						</AlertDescription>
					</Alert>
				),
				variant: 'default'
			})
		}
	}

	return (
		<ScrollArea className='h-[calc(100vh-2rem)] w-full'>
			<div className='space-y-4'>
				<div className='flex items-center space-x-4'>
					<div className='relative flex-1'>
						<Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
						<Input
							placeholder='Поиск пользователей...'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							className='bg-white pl-8 dark:bg-transparent'
						/>
					</div>
					<Button
						className='flex items-center gap-2'
						onClick={() => setIsAddingUser(true)}
					>
						<PlusCircle className='h-4 w-4' />
						Add User
					</Button>
				</div>

				<div className='rounded-md border'>
					<ScrollArea className='h-[500px] w-full'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>ФИО</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Корпорация</TableHead>
									<TableHead>Роль</TableHead>
									<TableHead>Дата создания</TableHead>
									<TableHead className='w-[100px]'>
										Действия
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loading
									? Array.from({ length: 5 }).map((_, i) => (
											<TableRow key={i}>
												<TableCell>
													<Skeleton className='h-6 w-[150px]' />
												</TableCell>
												<TableCell>
													<Skeleton className='h-6 w-[200px]' />
												</TableCell>
												<TableCell>
													<Skeleton className='h-6 w-[150px]' />
												</TableCell>
												<TableCell>
													<Skeleton className='h-6 w-[100px]' />
												</TableCell>
												<TableCell>
													<Skeleton className='h-6 w-[100px]' />
												</TableCell>
												<TableCell>
													<Skeleton className='h-6 w-[80px]' />
												</TableCell>
											</TableRow>
										))
									: filteredUsers.map(user => (
											<TableRow key={user.id}>
												<TableCell className='font-medium'>
													{[
														user.first_name,
														user.name
													]
														.filter(Boolean)
														.join(' ') ||
														'Не указано'}
												</TableCell>
												<TableCell>
													{user.email || 'Не указано'}
												</TableCell>
												<TableCell>
													{user.corporation ||
														'Не указан'}
												</TableCell>
												<TableCell>
													<span className='inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium'>
														{user.role ||
															'Пользователь'}
													</span>
												</TableCell>
												<TableCell>
													{formatDate(
														user.created_at
													)}
												</TableCell>
												<TableCell>
													<div className='flex items-center gap-2'>
														<Button
															variant='ghost'
															size='icon'
															className='h-8 w-8 p-0'
															onClick={() =>
																setEditingUser(
																	user
																)
															}
														>
															<Pencil className='h-4 w-4' />
														</Button>
														<Button
															variant='ghost'
															size='icon'
															className='h-8 w-8 p-0 text-destructive hover:text-destructive/90'
															onClick={() =>
																setUserToDelete(
																	user
																)
															}
														>
															<Trash2 className='h-4 w-4' />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
								{!loading && filteredUsers.length === 0 && (
									<TableRow>
										<TableCell
											colSpan={5}
											className='py-4 text-center'
										>
											Пользоватеи не найдены
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
						<ScrollBar orientation='horizontal' />
					</ScrollArea>
				</div>
			</div>
			<ScrollBar orientation='vertical' />

			<AlertDialog
				open={!!userToDelete}
				onOpenChange={() => setUserToDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Вы уверены?</AlertDialogTitle>
						<AlertDialogDescription>
							Это действие нельзя отменить. Пользователь{' '}
							{userToDelete?.email} будет удален из системы.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Отмена</AlertDialogCancel>
						<AlertDialogAction
							className='bg-red-600 hover:bg-red-700'
							onClick={() =>
								userToDelete && handleDeleteUser(userToDelete)
							}
						>
							Удалить
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<EditUserDialog
				user={
					editingUser
						? {
								...editingUser,
								first_name: editingUser.first_name || '',
								name: editingUser.name || '',
								role: editingUser.role || '',
								corporation: editingUser.corporation || ''
							}
						: undefined
				}
				isOpen={!!editingUser || isAddingUser}
				onClose={() => {
					setEditingUser(null)
					setIsAddingUser(false)
				}}
				onSave={async userData => {
					if (editingUser?.id) {
						await handleSaveUser(userData)
					} else {
						await handleCreateUser(userData)
					}
				}}
				currentUserCorporation={currentUserCorporation}
			/>
		</ScrollArea>
	)
}
