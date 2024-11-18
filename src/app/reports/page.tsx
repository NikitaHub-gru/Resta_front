"use client"

import { SidebarDemo } from "@/components/main/mailbar";
import { Dashboard } from "@/components/main/rightbar";
import  ReportTable  from "@/components/main/ReportTable";

export default function ReportsPage() {
  return (
    <div className="h-screen w-screen bg-neutral-950">
      <SidebarDemo>
        <Dashboard>
          <ReportTable />
        </Dashboard>
      </SidebarDemo>
    </div>
  )
}
