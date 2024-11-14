"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"

interface AddReportDialogProps {
  onSuccess?: () => void;
}

interface Corporation {
  [key: string]: string | { id: string; name: string } | null;
}

export function AddReportDialog({ onSuccess }: AddReportDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    tb_name: "",
    descript: "",
    data: "{}",
    report_type: "SALES",
    is_active: true,
    corporation: ""
  })
  const [corporations, setCorporations] = useState<Corporation>({})

  useEffect(() => {
    const fetchCorporations = async () => {
      try {
        console.log('Fetching corporations...');
        const response = await fetch('https://nikitahub-gru-resta-back-f1fb.twc1.net/olap/get_corporations', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch corporations: ${response.status}`);
        }
        
        const { data } = await response.json();
        console.log('Corporations data received:', data);
        
        const formattedData = Object.entries(data).reduce((acc, [id, value]) => {
          if (value && typeof value === 'object' && 'name' in value) {
            acc[id] = (value as { name: string }).name;
          } else {
            acc[id] = String(value) || id;
          }
          return acc;
        }, {} as Record<string, string>);
        
        setCorporations(formattedData);
      } catch (error) {
        console.error('Error fetching corporations:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список корпораций",
          variant: "destructive",
        });
      }
    };

    fetchCorporations();
    
    if (open) {
      fetchCorporations();
    }
  }, [open]);

  useEffect(() => {
    console.log('Corporations state updated:', corporations);
  }, [corporations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const jsonData = typeof formData.data === 'object' 
        ? JSON.stringify(formData.data) 
        : formData.data;

      const { error } = await supabase
        .from('Reports')
        .insert([
          {
            ...formData,
            data: JSON.parse(jsonData),
          },
        ]);

      if (error) throw error;
      
      onSuccess?.();
      setOpen(false);
      
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white text-black">
          <PlusIcon className="h-4 w-4 mr-2" />
          Добавить отчёт
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Создать новый отчет</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="tb_name" className="text-sm font-medium">
              Название
            </label>
            <input
              id="tb_name"
              value={formData.tb_name}
              onChange={(e) => setFormData({ ...formData, tb_name: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="corporation" className="text-sm font-medium">
              Корпорация
            </label>
            <select
              id="corporation"
              value={formData.corporation}
              onChange={(e) => {
                console.log('Selected corporation:', e.target.value);
                setFormData({ ...formData, corporation: e.target.value });
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Выберите корпорацию</option>
              {Object.entries(corporations).length > 0 ? (
                Object.entries(corporations).map(([id, name]) => (
                  <option key={id} value={typeof name === 'string' ? name : ''}>
                    {typeof name === 'string' ? name : ''}
                  </option>
                ))
              ) : (
                <option value="" disabled>Загрузка корпораций...</option>
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="descript" className="text-sm font-medium">
              Описание
            </label>
            <textarea
              id="descript"
              value={formData.descript}
              onChange={(e) => setFormData({ ...formData, descript: e.target.value })}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="data" className="text-sm font-medium">
              JSON конфигурация
            </label>
            <textarea
              id="data"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="report_type" className="text-sm font-medium">
              Тип отчета
            </label>
            <select
              id="report_type"
              value={formData.report_type}
              onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="SALES">Продажи</option>
              <option value="DeliveryOrders">Доставка</option>
              <option value="TRANSACTIONS ">Транзакции</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-primary"
            />
            <label htmlFor="is_active" className="text-sm font-medium">
              Активен
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit">
              Создать
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 