"use client"

import { SidebarDemo } from "@/components/main/mailbar";
import Dashboard from "@/components/main/rightbar";


export default function Home() {
  return (
    <div className="h-screen w-screen">
      <SidebarDemo>
        <Dashboard>
        <h1>Hello</h1>
        </Dashboard>
      </SidebarDemo>
    </div>
  );
}
