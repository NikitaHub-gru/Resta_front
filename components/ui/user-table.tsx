"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Pencil, Trash2, Terminal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import { CircleX } from "lucide-react";

interface User {
  id: string;
  corporation: string;
  email: string;
  first_name: string;
  name: string;
  role: string;
  created_at: string;
}

export function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/olap/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const { data } = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Ошибка при загрузке пользователей:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список пользователей",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.name?.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.corporation?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, "d MMMM yyyy HH:mm", { locale: ru });
    } catch {
      return dateString;
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      const response = await fetch(`http://localhost:8000/olap/delete_users/${user.id}`, {
        method: 'POST',
      });

      const result = await response.json();
      console.log('Server response:', result);

      if (result.toString() === "True") {
        toast({
          title: "",
          description: (
            <div>
            <Alert className="border-0 bg-transparent">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 ml-1 text-green-500" />
                <AlertTitle className="ml-2 text-green-500">Успешно</AlertTitle>
              </div>
              <AlertDescription className="ml-2 text-muted-foreground">
                Пользователь {user.email} был успешно удален
              </AlertDescription>
            </Alert>
          </div>
          ),
          variant: "default",
          duration: 4000,
          className: "slide-in-out",
        });

        await fetchUsers();
      } else {
        toast({
          title: "",
          description: (
            <div >
            <Alert className="border-0 bg-transparent">
              <div className="flex items-center">
                <CircleX className="h-4 w-4 ml-1 text-red-600" />
                <AlertTitle className="ml-2 text-red-600 text-[1.2rem]">Ошибка</AlertTitle>
              </div>
              <AlertDescription className="ml-2 text-muted-foreground">
                Не удалось удалить пользователя {user.email}
              </AlertDescription>
            </Alert>
            </div>
          ),
          variant: "default",
          duration: 4000,
          className: "slide-in-out",
        });
      }
    } catch (error) {
      console.error('Error during delete:', error);
    } finally {
      setUserToDelete(null);
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-2rem)] w-full">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск пользователей..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <ScrollArea className="h-[500px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ФИО</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Корпорация</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Дата создания</TableHead>
                  <TableHead className="w-[100px]">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {[user.first_name, user.name].filter(Boolean).join(' ') || 'Не указано'}
                      </TableCell>
                      <TableCell>{user.email || 'Не указано'}</TableCell>
                      <TableCell>{user.corporation || 'Не указано'}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10">
                          {user.role || 'Пользователь'}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              // Здесь будет логика редактирования
                              console.log('Edit user:', user.id);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive/90"
                            onClick={() => setUserToDelete(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {!loading && filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Пользователи не найдены
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
      <ScrollBar orientation="vertical" />

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Пользователь {userToDelete?.email} будет удален из системы.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => userToDelete && handleDeleteUser(userToDelete)}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScrollArea>
  );
}
