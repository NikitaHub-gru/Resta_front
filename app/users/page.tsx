"use client"

import { useState } from "react";
import { SidebarDemo } from "@/components/main/mailbar";
import { Dashboard } from "@/components/main/rightbar";
import { Users } from "lucide-react";
import { UserTable } from "@/components/ui/user-table";

export default function UsersPage() {
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
              </div>
              <UserTable />
            </div>
          </div>  
        </Dashboard>
      </SidebarDemo>
    </div>
  );
}
