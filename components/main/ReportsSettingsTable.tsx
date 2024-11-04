"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PencilIcon, TrashIcon } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"
import { AddReportDialog } from "./AddReportDialog"

interface Report {
  id: number
  corporation: string
  user_id: string
  tb_name: string
  descript: string
  data: any
  created_at: string
  report_type: string
  is_active: boolean
}

export function ReportsSettingsTable() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw new Error('Ошибка авторизации')
      }

      if (!session) {
        throw new Error('Необходима авторизация')
      }

      const userCorporation = session.user.user_metadata.corporation

      let query = supabase
        .from('Reports')
        .select(`
          id,
          corporation,
          user_id,
          tb_name,
          descript,
          data,
          created_at,
          report_type,
          is_active
        `)
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
      console.error('Ошибка при загрузке отчетов:', error)
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось загрузить отчеты",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Необходима авторизация')

      const userCorporation = session.user.user_metadata.corporation
      const reportToDelete = reports.find(report => report.id === id)

      // Проверяем права на удаление
      if (userCorporation !== 'RestaLabs' && reportToDelete?.corporation !== userCorporation) {
        throw new Error('Нет прав на удаление этого отчета')
      }

      const { error } = await supabase
        .from('Reports')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(error.message)
      }

      setReports(reports.filter(report => report.id !== id))
      
      toast({
        title: "Успешно",
        description: "Отчет удален",
      })
    } catch (error) {
      console.error('Ошибка при удалении отчета:', error)
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось удалить отчет",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-center p-4">Загрузка...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Настройка отчётов</h1>
        <AddReportDialog onSuccess={fetchReports} />
      </div>
      <div className="rounded-md border border-neutral-800">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-900">
              <TableHead>ID</TableHead>
              <TableHead>Корпорация</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead>Тип отчета</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Создан</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.id}</TableCell>
                <TableCell>{report.corporation}</TableCell>
                <TableCell>{report.tb_name}</TableCell>
                <TableCell>{report.descript}</TableCell>
                <TableCell>{report.report_type}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    report.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {report.is_active ? 'Активен' : 'Неактивен'}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(report.created_at).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(report.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {reports.length === 0 && (
          <div className="text-center p-4 text-neutral-500">
            Нет доступных отчетов
          </div>
        )}
      </div>
    </div>
  )
} 