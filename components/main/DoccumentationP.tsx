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
import { useEffect, useState } from 'react'

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
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'

// Mock data
const companies = [
	{ id: '1', name: 'Акме Корп' },
	{ id: '2', name: 'Глобекс Корпорация' },
	{ id: '3', name: 'Сойлент Корп' }
]

const reportTypes = [
	{ id: 'financial', name: 'Финансовые отчеты' },
	{ id: 'performance', name: 'Отчеты о производительности' },
	{ id: 'analytics', name: 'Аналитические отчеты' }
]
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

	// Обработчик выбора отчета
	const handleReportSelect = (report: Report) => {
		setSelectedReport(report)
		// Clear all active filters when selecting a new report
		setActiveFilters({})
		setFilterSearchTerms({})
		setSearchTerm('')
	}

	const fetchReports = async () => {
		try {
			const {
				data: { session },
				error: sessionError
			} = await supabase.auth.getSession()

			if (sessionError) {
				throw new Error('Ошибка авторизации')
			}

			if (!session) {
				throw new Error('Необходима авторизация')
			}

			const userCorporation = session.user.user_metadata.corporation

			let query = supabase
				.from('Reports')
				.select(
					`
          id,
          corporation,
          tb_name,
          descript,
          data,
          created_at,
          report_type,
          is_active,
          description_info
        `
				)
				.order('created_at', { ascending: false })

			// Если пользователь не из RestaLabs, фильтруем по его корпорации
			if (userCorporation !== 'RestaLabs') {
				query = query.eq('corporation', userCorporation)
			}

			const { data, error } = await query

			if (error) {
				console.error('Supabase error:', error)
				throw new Error(error.message)
			}

			setReports(data || [])
		} catch (error) {
			console.error('Ошибка при загрузке очетов:', error)
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

	const getIcon = (type: string) => {
		switch (type) {
			case 'SALES':
				return <CircleDollarSign className='h-5 w-5' />
			case 'DELIVERY':
				return <Truck className='h-5 w-5' />
			case 'analytics':
				return <Building className='h-5 w-5' />
			default:
				return <FileText className='h-5 w-5' />
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
					className='rounded-lg border bg-card'
				>
					<Table className='bg-white dark:bg-neutral-900'>
						<TableHeader>
							<TableRow>
								<TableHead className='w-[40px]'></TableHead>
								<TableHead>Название</TableHead>
								<TableHead>Компания</TableHead>
								<TableHead>Тип</TableHead>
								<TableHead>Дата</TableHead>
								<TableHead className='text-right'>Действия</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredReports.map(report => (
								<AnimatePresence key={report.id} mode='wait'>
									<>
										<TableRow className='group transition-colors'>
											<TableCell>{getIcon(report.report_type)}</TableCell>
											<TableCell className='font-medium'>{report.tb_name}</TableCell>
											<TableCell>{report.corporation}</TableCell>
											<TableCell>{report.report_type}</TableCell>
											<TableCell>
												{format(new Date(report.created_at), 'dd.MM.yyyy HH:mm')}
											</TableCell>
											<TableCell className='text-right'>
												<Button
													variant='ghost'
													size='sm'
													onClick={() =>
														setExpandedId(expandedId === report.id ? null : report.id)
													}
												>
													Подробнее
													<ChevronDown
														className={`ml-2 h-4 w-4 transition-transform duration-200 ${
															expandedId === report.id ? 'rotate-180' : ''
														}`}
													/>
												</Button>
											</TableCell>
										</TableRow>
										{expandedId === report.id && (
											<TableRow className='hover:bg-transparent'>
												<TableCell colSpan={6} className='p-0'>
													<motion.div
														initial={{
															opacity: 0,
															maxHeight: 0
														}}
														animate={{
															opacity: 1,
															maxHeight: 300,
															transition: {
																duration: 0.4,
																ease: 'easeInOut'
															}
														}}
														exit={{
															opacity: 0,
															maxHeight: 0,
															transition: {
																duration: 0.3,
																ease: 'easeInOut'
															}
														}}
														className='overflow-hidden p-4'
													>
														<p className='text-sm text-muted-foreground'>{report.descript}</p>
														<div className='mt-4 flex justify-end'>
															<Sheet>
																<SheetTrigger>
																	<Button>Информация об отчете</Button>
																</SheetTrigger>
																<SheetContent side='top'>
																	<SheetHeader>
																		<SheetDescription>
																			<div className='mt-1'>
																				<h4 className='mb-4 text-center text-lg'>
																					Информация о отчете:
																				</h4>
																				<div
																					className='relative w-full'
																					style={{
																						height: 'calc(70vh - 100px)'
																					}}
																				>
																					<div className='justify-center px-8 pt-4 text-sm text-foreground'>
																						{report.description_info
																							.split('\n\n')
																							.map((paragraph, index) => (
																								<p key={index} className='whitespace-pre-line'>
																									{paragraph}
																								</p>
																							))}
																					</div>
																				</div>
																			</div>
																		</SheetDescription>
																	</SheetHeader>
																</SheetContent>
															</Sheet>
														</div>
													</motion.div>
												</TableCell>
											</TableRow>
										)}
									</>
								</AnimatePresence>
							))}
						</TableBody>
					</Table>
				</motion.div>
			</div>
		</ScrollArea>
	)
}
