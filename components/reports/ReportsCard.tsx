'use client'

import { createClient } from '@supabase/supabase-js'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
	Building,
	ChevronDown,
	CircleDollarSign,
	FileText,
	Truck
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Card, CardContent, CardHeader } from '../ui/card'
import { ReportInfoModal } from '../ui/report-info-modal'
import { ScrollArea } from '../ui/scroll-area'

import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from '@/components/ui/sheet'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import { getAuthUser } from '@/hooks/getauthuser'
import { UserData, loadUserReport } from '@/hooks/getuserdata'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'

const ALL_COMPANIES = 'all_companies'

interface ReportData {
	id: string
	corporation: string
	tb_name: string
	descript: string
	data: any
	created_at: string
	report_type: string
	is_active: boolean
	description_info: string
}

export default function Home() {
	const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
	const [selectedType, setSelectedType] = useState<string | null>(null)
	const [expandedId, setExpandedId] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState('')

	const { toast } = useToast()
	const [selectedReport, setSelectedReport] = useState<Report | null>(null)
	const [activeFilters, setActiveFilters] = useState<{
		[key: string]: string[]
	}>({})
	const [filterSearchTerms, setFilterSearchTerms] = useState<{
		[key: string]: string
	}>({})
	const [report, setReports] = useState<ReportData[]>([])
	const [session, setSession] = useState<any>(null)
	const [companies, setCompanies] = useState<string[]>([])
	const uniqueCompanies = Array.from(
		new Set(report.map(report => report.corporation))
	)
	const handleCompanySelect = (company: string) => {
		setSelectedCompany(company === ALL_COMPANIES ? null : company)
		setSelectedType(null) // Сбрасываем фильтр по названию отчёта при смене компании
	}
	const router = useRouter()

	const handleViewReport = (id: string, corporation: string) => {
		router.push(`/report/${id}/${corporation}`)
	}

	// Обработчик выбора отчета
	const handleReportSelect = (report: Report) => {
		setSelectedReport(report)
		// Clear all active filters when selecting a new report
		setActiveFilters({})
		setFilterSearchTerms({})
		setSearchTerm('')
	}
	const fetchUser = async () => {
		const authdata = await getAuthUser()
		return authdata
	}

	const fetchReports = async () => {
		try {
			const {
				data: { session },
				error: sessionError
			} = await supabase.auth.getSession()
			const authdata = await fetchUser()
			if (sessionError) {
				throw new Error('Ошибка авторизации')
			}

			if (!session) {
				throw new Error('Необходима авторизация')
			}

			// Вызываем getUserReports, чтобы получить role и reports_id
			const userData = await loadUserReport()

			let userReports = []
			if (userData?.role === 'User') {
				// Преобразуем reports_id в массив
				const reportIds = userData.reports_id.split(',').map(id => id.trim())
				// Фильтруем отчеты, оставляя только те, которые есть в reports_id
				const { data, error } = await supabase
					.from('Reports')
					.select('*')
					.in('id', reportIds)
					.eq('corporation', authdata.corporation)
					.eq('is_active', true)
					.order('created_at', { ascending: false })

				if (error) {
					console.error('Supabase error:', error)
					throw new Error(error.message)
				}

				userReports = data || []
			} else {
				// Если не User, проверяем corporation
				let query
				if (authdata.corporation === 'RestaLabs') {
					query = supabase
						.from('Reports')
						.select('*')
						.eq('is_active', true)
						.order('created_at', { ascending: false })
				} else {
					// Запрос для других корпораций
					query = supabase
						.from('Reports')
						.select('*')
						.eq('is_active', true)
						.eq('corporation', authdata.corporation)
						.order('created_at', { ascending: false })
				}

				const { data, error } = await query

				if (error) {
					console.error('Supabase error:', error)
					throw new Error(error.message)
				}

				userReports = data || []
			}

			setReports(userReports)
		} catch (error) {
			console.error('Ошибка при загрузке отчетов:', error)
			toast({
				title: 'Ошибка',
				description:
					error instanceof Error ? error.message : 'Не удалось загрузить отчеты',
				variant: 'destructive'
			})
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchReports()
	}, [])

	useEffect(() => {
		const getSession = async () => {
			const {
				data: { session: currentSession }
			} = await supabase.auth.getSession()
			setSession(currentSession)
		}

		getSession()
	}, [])

	const filteredReports = report.filter(report => {
		// Фильтрация по компании
		if (
			selectedCompany &&
			selectedCompany !== ALL_COMPANIES &&
			report.corporation !== selectedCompany
		) {
			return false
		}
		// Фильтрация по названию отчета
		if (
			selectedType &&
			selectedType !== 'all' &&
			report.tb_name !== selectedType
		) {
			return false
		}
		return true
	})

	const handleExpand = (id: string) => {
		setExpandedId(id === expandedId ? null : id)
	}

	const getIcon = (type: string) => {
		switch (type) {
			case 'SALES':
				return <CircleDollarSign className='h-6 w-6' />
			case 'DELIVERY':
				return <Truck className='h-6 w-6' />
			case 'analytics':
				return <Building className='h-6 w-6' />
			default:
				return <FileText className='h-6 w-6' />
		}
	}

	return (
		<ScrollArea className='h-[calc(100vh-2rem)] w-full'>
			<div className='container mx-auto space-y-8 py-8'>
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className='mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row'
				>
					<h1 className='text-3xl font-bold'>Панель отчетов</h1>
					<div className='flex flex-col gap-4 sm:flex-row'>{/* ... */}</div>
					<div className='flex flex-col gap-4 sm:flex-row'>
						<Select
							value={selectedCompany || ALL_COMPANIES}
							onValueChange={handleCompanySelect}
						>
							<SelectTrigger className='w-[200px] bg-white dark:bg-neutral-900'>
								<SelectValue placeholder='Все компании' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={ALL_COMPANIES}>Все компании</SelectItem>
								{uniqueCompanies.map(company => (
									<SelectItem key={company} value={company}>
										{company}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={selectedType || 'all'}
							onValueChange={value => setSelectedType(value !== 'all' ? value : null)}
						>
							<SelectTrigger className='w-[200px]'>
								<SelectValue placeholder='Название отчета' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>Все отчёты</SelectItem>
								{[
									...new Set(
										report
											.filter(
												r =>
													!selectedCompany ||
													selectedCompany === ALL_COMPANIES ||
													r.corporation === selectedCompany
											)
											.map(r => r.tb_name)
									)
								].map(tbName => (
									<SelectItem key={tbName} value={tbName}>
										{tbName}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className='rounded-lg bg-card dark:bg-transparent'
				>
					<div className='grid grid-cols-4 gap-4'>
						{filteredReports.map(report => (
							<AnimatePresence key={report.id} mode='wait'>
								<Card className='group flex flex-col transition-colors dark:bg-black/20'>
									<CardHeader>
										<div className='flex justify-between'>
											<span className='text-muted-foreground'>{report.corporation} </span>
											{getIcon(report.report_type)}
										</div>
										<div className='flex items-center justify-between'>
											<div className='flex items-center'>
												<span className='ml-2 text-lg font-medium'>{report.tb_name}</span>
											</div>
										</div>
									</CardHeader>
									<CardContent className='flex-grow'>
										<p className='text-sm text-muted-foreground'>{report.descript}</p>
									</CardContent>
									<div className='flex items-center justify-center'>
										<CardContent>
											<Button
												onClick={() => handleViewReport(report.id, report.corporation)}
											>
												Открыть отчет
											</Button>
										</CardContent>
									</div>
								</Card>
							</AnimatePresence>
						))}
					</div>
				</motion.div>
			</div>
		</ScrollArea>
	)
}
