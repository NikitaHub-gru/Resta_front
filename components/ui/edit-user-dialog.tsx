"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, CreateUserData } from "@/lib/supabaseDataBase";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { USER_ROLES, CORPORATIONS } from "@/lib/constants";
import { createUser} from "@/lib/newuser";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface EditUserDialogProps {
  user?: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: CreateUserData & { password?: string }) => Promise<void>;
}

async function updateUser(
  userId: string, 
  userData: {
    name: string;
    email: string;
    role: string;
    corporation: string;
    password?: string;
  }
) {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        corporations: [userData.corporation], // Преобразуем в массив для API
        ...(userData.password ? { password: userData.password } : {})
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update user');
    }

    return { data, error: null };
  } catch (error) {
    console.error('Update user error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('An unknown error occurred') 
    };
  }
}

export function EditUserDialog({ user, isOpen, onClose, onSave }: EditUserDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CreateUserData & { password?: string }>({
    name: user?.name || "",
    first_name: user?.first_name || "",
    email: user?.email || "",
    password: "",
    corporation: user?.corporation || "",
    role: user?.role || "",
  });
  const [passwordError, setPasswordError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.name || !formData.email || !formData.corporation || !formData.role) {
        toast({
          title: "Ошибка ва��идации",
          description: "Пожалуйста, заполните все обязательные поля",
          variant: "destructive",
        });
        return;
      }

      if (!user && (!formData.password || formData.password.length < 6)) {
        toast({
          title: "Ошибка валидации",
          description: "Пароль должен содержать минимум 6 символов",
          variant: "destructive",
        });
        return;
      }

      if (user) {
        const { error: updateError } = await updateUser(user.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          corporation: formData.corporation,
          ...(formData.password ? { password: formData.password } : {})
        });
        
        if (updateError) {
          throw new Error(updateError.message);
        }

        toast({
          title: "Успех",
          description: "Пользователь успешно обновлен",
        });
      } else {
        const { data: authData, error: authError } = await createUser({
          ...formData,
          password: formData.password || ''
        });
        
        if (authError) {
          throw new Error(authError.message);
        }

        toast({
          title: "Успех",
          description: "Пользователь успешно создан",
        });
      }

      if (user && !formData.password) {
        const { password, ...dataWithoutPassword } = formData;
        await onSave(dataWithoutPassword);
      } else {
        await onSave(formData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error details:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось сохранить пользователя",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    
    if (!user && newPassword.length > 0 && newPassword.length < 6) {
      setPasswordError("Пароль должен содержать минимум 6 символов");
    } else {
      setPasswordError("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handlePasswordChange}
                required
                placeholder="Enter password"
              />
              {passwordError && (
                <p className="text-sm text-red-500 mt-1">
                  {passwordError}
                </p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="corporation">Corporation *</Label>
            <select
              id="corporation"
              value={formData.corporation}
              onChange={(e) => setFormData({ ...formData, corporation: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="" disabled>Select corporation</option>
              {CORPORATIONS.map((corp) => (
                <option key={corp} value={corp}>
                  {corp}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="" disabled>Select role</option>
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
