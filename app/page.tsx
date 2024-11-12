"use client"

import { SidebarDemo } from "@/components/main/mailbar";
import Dashboard from "@/components/main/rightbar";

import { supabase } from '@/lib/supabaseClient';

const { data: { users }, error } = await supabase.auth.admin.listUsers()

export default function Home() {
  return (
    <div className="h-screen w-screen">
      <SidebarDemo>
        <Dashboard>
          <ul>
            {users?.map((user: any) => (
              <li key={user.id}>{user.email}</li>
            ))}
          </ul>
        </Dashboard>
      </SidebarDemo>
    </div>
  );
}
