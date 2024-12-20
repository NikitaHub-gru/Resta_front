"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PencilIcon, TrashIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { AddReportDialog } from "./AddReportDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CORPORATIONS } from "@/lib/constants";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ReportData {
  id: string;
  corporation: string;
  tb_name: string;
  descript: string;
  data: any;
  created_at: string;
  report_type: string;
  is_active: boolean;
}

interface FetchError {
  message: string;
  status?: number;
}

export function ReportsSettingsTable() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ReportData | null>(null);
  const [editForm, setEditForm] = useState({
    tb_name: "",
    descript: "",
    data: "",
    corporation: "",
    report_type: "",
  });
  const [session, setSession] = useState<any>(null);

  const fetchReports = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error("Ошибка авторизации");
      }

      if (!session) {
        throw new Error("Необходима авторизация");
      }

      const userCorporation = session.user.user_metadata.corporation;

      let query = supabase
        .from("Reports")
        .select(
          `
          id,
          corporation,
          tb_name,
          descript,
          data,
          created_at,
          report_type,
          is_active
        `
        )
        .order("created_at", { ascending: false });

      // Если пользователь не из RestaLabs, фильтруем по его корпорации
      if (userCorporation !== "RestaLabs") {
        query = query.eq("corporation", userCorporation);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message);
      }

      setReports(data || []);
    } catch (error) {
      console.error("Ошибка при загрузке очетов:", error);
      toast({
        title: "Ошибка",
        description:
          error instanceof Error
            ? error.message
            : "Не удалось загрузить отчеты",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);
    };

    getSession();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Необходима авторизация");

      const userCorporation = session.user.user_metadata.corporation;
      const reportToDelete = reports.find((report) => report.id === id);

      // Проверяем права на удаление
      if (
        userCorporation !== "RestaLabs" &&
        reportToDelete?.corporation !== userCorporation
      ) {
        throw new Error("Нет прав на удаление этого отчета");
      }

      const { error } = await supabase.from("Reports").delete().eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      setReports(reports.filter((report) => report.id !== id));

      toast({
        title: "Успешно",
        description: "Отчет удален",
      });
    } catch (error) {
      console.error("Ошибка при удалении отчета:", error);
      toast({
        title: "Ошибка",
        description:
          error instanceof Error ? error.message : "Не удалось удалить отчет",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (report: ReportData) => {
    setEditingReport(report);
    setEditForm({
      tb_name: report.tb_name,
      descript: report.descript,
      data:
        typeof report.data === "object"
          ? JSON.stringify(report.data, null, 2)
          : report.data,
      corporation: report.corporation,
      report_type: report.report_type,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingReport) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Необходима авторизация");

      const userCorporation = session.user.user_metadata.corporation;

      let parsedData;
      try {
        parsedData = JSON.parse(editForm.data);
      } catch (e) {
        throw new Error("Некорректный формат JSON");
      }

      const updates: any = {
        tb_name: editForm.tb_name,
        descript: editForm.descript,
        data: parsedData,
        report_type: editForm.report_type,
      };

      if (userCorporation === "RestaLabs") {
        updates.corporation = editForm.corporation;
      } else {
        updates.corporation = editingReport.corporation;
      }

      const { data, error } = await supabase
        .from("Reports")
        .update(updates)
        .eq("id", editingReport.id)
        .select();

      if (error) throw error;

      await fetchReports();
      setIsEditDialogOpen(false);

      toast({
        title: "Успешно",
        description: "Отчет обновлен",
      });
    } catch (error) {
      console.error("Ошибка при обновлении отчета:", error);
      toast({
        title: "Ошибка",
        description:
          error instanceof Error ? error.message : "Не удалось обновить отчет",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center p-4">Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Настройка отчётов</h1>
        <AddReportDialog onSuccess={fetchReports} />
      </div>
      <div className="rounded-md border border-neutral-800">
        <ScrollArea className="w-full h-[600px]">
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
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        report.is_active
                          ? "bg-green-500/20 text-green-500"
                          : "bg-red-500/20 text-red-500"
                      }`}
                    >
                      {report.is_active ? "Активен" : "Неактивен"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(report.created_at).toLocaleDateString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(report)}
                    >
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
        </ScrollArea>
        {reports.length === 0 && (
          <div className="text-center p-4 text-neutral-500">
            Нет доступных отчетов
          </div>
        )}
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] bg-[#171717]">
          <DialogHeader>
            <DialogTitle>Редактировать отчет</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="corporation">Корпорация</label>
              <select
                id="corporation"
                value={editForm.corporation}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    corporation: e.target.value,
                  }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-[#171717] px-3 py-2 text-sm ring-offset-background"
                disabled={
                  session?.user?.user_metadata?.corporation !== "RestaLabs"
                }
              >
                {CORPORATIONS.map((corp) => (
                  <option key={corp} value={corp}>
                    {corp}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="report_type">Тип отчета</label>
              <select
                id="report_type"
                value={editForm.report_type}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    report_type: e.target.value,
                  }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-[#171717] px-3 py-2 text-sm ring-offset-background"
              >
                <option value="SALES">Продажи</option>
                <option value="DeliveryOrders">Доставка</option>
                <option value="TRANSACTIONS">Транзакции</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="tb_name">Название отчета</label>
              <Input
                id="tb_name"
                value={editForm.tb_name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, tb_name: e.target.value }))
                }
                className="bg-[#171717]"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="descript">Описание</label>
              <Input
                id="descript"
                value={editForm.descript}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, descript: e.target.value }))
                }
                className="bg-[#171717]"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="data">Данные</label>
              <div className="relative rounded-md border bg-[#1e1e1e]">
                <ScrollArea className="h-[200px] w-full overflow-hidden">
                  <textarea
                    id="data"
                    value={editForm.data}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, data: e.target.value }))
                    }
                    className="w-full h-full bg-transparent text-[#d4d4d4] font-mono text-sm leading-relaxed resize-none outline-none p-4"
                    style={{
                      fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                      whiteSpace: "pre",
                      msOverflowStyle: "none", // Скрываем скроллбар в IE
                      scrollbarWidth: "none", // Скрываем скроллбар в Firefox
                    }}
                    spellCheck="false"
                  />
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={handleEditSubmit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
