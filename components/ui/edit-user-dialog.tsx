'use client'

import { CheckCircle2, CircleX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { CORPORATIONS, USER_ROLES } from '@/lib/constants'

interface User {
	id: string
	corporation: string
	email: string
	first_name: string
	name: string
	role: string
	created_at: string
}

interface EditUserDialogProps {
	user?: User
	isOpen: boolean
	onClose: () => void
	onSave: (userData: any) => void
	currentUserCorporation: string
}

interface Corporation {
	id: string
	name: string
}

export function EditUserDialog({
	user,
	isOpen,
	onClose,
	onSave,
	currentUserCorporation = 'RestaLabs'
}: EditUserDialogProps) {
	const { toast } = useToast()
	const hasFullAccess = currentUserCorporation === 'RestaLabs'
	const [corporations, setCorporations] = useState<Corporation[]>([])

	const form = useForm({
		defaultValues: {
			name: '',
			first_name: '',
			email: '',
			password: '',
			corporation: currentUserCorporation,
			role: ''
		}
	})

	useEffect(() => {
		if (user) {
			form.reset({
				name: user.name || '',
				first_name: user.first_name || '',
				email: user.email || '',
				password: '',
				corporation: user.corporation || currentUserCorporation,
				role: user.role || ''
			})
		} else {
			form.reset({
				name: '',
				first_name: '',
				email: '',
				password: '',
				corporation: currentUserCorporation,
				role: ''
			})
		}
	}, [user, currentUserCorporation, form])

	useEffect(() => {
		const fetchCorporations = async () => {
			try {
				const response = await fetch(
					'https://nikitahub-gru-resta-back-c88a.twc1.net/olap/get_corporations',
					{
						method: 'GET',
						headers: {
							'Content-Type': 'application/json'
						}
					}
				)

				if (!response.ok) {
					throw new Error(`Failed to fetch corporations: ${response.status}`)
				}

				const { data } = await response.json()
				console.log('Corporations data received:', data)

				if (Array.isArray(data)) {
					setCorporations(data)
				} else {
					throw new Error('Invalid data format received')
				}
			} catch (error) {
				console.error('Error fetching corporations:', error)
				toast({
					title: 'Ошибка',
					description: 'Не удалось загрузить список корпораций',
					variant: 'destructive'
				})
			}
		}

		if (isOpen) {
			fetchCorporations()
		}
	}, [isOpen])

	const onSubmit = async (data: any) => {
		try {
			onSave(data)
			onClose()
		} catch (error) {
			console.error('Error submitting form:', error)
			toast({
				title: '',
				description: (
					<Alert className='border-0 bg-transparent'>
						<div className='flex items-center'>
							<CircleX className='ml-1 h-4 w-4 text-red-600' />
							<AlertTitle className='ml-2 text-red-600'>Ошибка</AlertTitle>
						</div>
						<AlertDescription className='ml-2 text-muted-foreground'>
							{error instanceof Error ? error.message : 'Не удалось сохранить данные'}
						</AlertDescription>
					</Alert>
				),
				variant: 'default'
			})
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{user?.id ? 'Редактировать пользователя' : 'Добавить пользователя'}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='name'>Фамилия *</Label>
						<Input id='name' {...form.register('name')} required />
					</div>
					<div className='space-y-2'>
						<Label htmlFor='first_name'>Имя</Label>
						<Input id='first_name' {...form.register('first_name')} />
					</div>
					<div className='space-y-2'>
						<Label htmlFor='email'>Email *</Label>
						<Input id='email' type='email' {...form.register('email')} required />
					</div>
					<div className='space-y-2'>
						<Label htmlFor='password'>Пароль {!user && '*'}</Label>
						<Input
							id='password'
							type='password'
							{...form.register('password')}
							required={!user}
							placeholder={
								user ? 'Оставьте пустым, чтобы не менять' : 'Введите пароль'
							}
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='corporation'>Корпорация *</Label>
						<select
							id='corporation'
							{...form.register('corporation')}
							className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
							required
							disabled={!hasFullAccess}
						>
							{hasFullAccess ? (
								<>
									<option value=''>Выберите корпорацию</option>
									{corporations.map(corp => (
										<option key={corp.id} value={corp.name}>
											{corp.name}
										</option>
									))}
								</>
							) : (
								<option value={currentUserCorporation}>{currentUserCorporation}</option>
							)}
						</select>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='role'>Роль *</Label>
						<select
							id='role'
							{...form.register('role')}
							className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
							required
						>
							<option value=''>Выберите роль</option>
							{USER_ROLES.map(role => (
								<option key={role} value={role}>
									{role}
								</option>
							))}
						</select>
					</div>
					<div className='flex justify-end space-x-2'>
						<Button type='button' variant='outline' onClick={onClose}>
							Отмена
						</Button>
						<Button type='submit'>Сохранить</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
