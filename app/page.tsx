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
        <div className="flex justify-center items-center h-full">
          <h1 className="text-5xl font-bold">Hello</h1>
        </div>
        </Dashboard>
      </SidebarDemo>
    </div>
  );
}
