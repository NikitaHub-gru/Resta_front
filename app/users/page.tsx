"use client"

import { useState } from "react";
import { SidebarDemo } from "@/components/main/mailbar";
import Dashboard from "@/components/main/rightbar";
import { Users, PlusCircle } from "lucide-react";
import { UserTable } from "@/components/ui/user-table";
import { Button } from "@/components/ui/button";
import { EditUserDialog } from "@/components/ui/edit-user-dialog";
import { addUser, updateUser, CreateUserData, User } from "@/lib/supabaseDataBase";
import { useToast } from "@/hooks/use-toast";

export default function UsersPage() {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();

  const handleAddUser = async (userData: CreateUserData) => {
    try {
      const { data, error } = await addUser(userData);
      if (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to add user",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "User added successfully",
        });
        setIsAddingUser(false);
        // Обновляем список пользователей если необходимо
        if (data) {
          setUsers(prevUsers => [...prevUsers, data]);
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (userData: CreateUserData & { password?: string }) => {
    try {
      if (!selectedUser?.id) {
        throw new Error("No user selected for update");
      }

      console.log('Updating user with data:', userData);
      
      const { data, error } = await updateUser(selectedUser.id, userData);
      
      if (error) throw error;

      if (data) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === selectedUser.id ? { ...user, ...data } : user
          )
        );
        toast({
          title: "Success",
          description: "User updated successfully",
        });
      }
      
    } catch (error) {
      console.error('Update error details:', error);
      throw error;
    }
  };

  return (
    <div className="h-screen w-screen">
      <SidebarDemo>
        <Dashboard>
          <div className="min-h-screen bg-transparent">
            <div className="flex flex-col gap-8 p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    <h1 className="text-2xl font-bold tracking-tight">Users</h1>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Manage your team members and their account permissions here.
                  </p>
                </div>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => setIsAddingUser(true)}
                >
                  <PlusCircle className="h-4 w-4" />
                  Add User
                </Button>
              </div>
              <UserTable />
              {isAddingUser && (
                <EditUserDialog
                  isOpen={isAddingUser}
                  onClose={() => setIsAddingUser(false)}
                  onSave={handleAddUser}
                />
              )}
            </div>
          </div>  
        </Dashboard>
      </SidebarDemo>
    </div>
  );
}
