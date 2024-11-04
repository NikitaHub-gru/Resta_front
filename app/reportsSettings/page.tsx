"use client"

import { SidebarDemo } from "@/components/main/mailbar";
import Dashboard from "@/components/main/rightbar";
import { ReportsSettingsTable } from "@/components/main/ReportsSettingsTable";

export default function ReportsSettingsPage() {
  return (
    <div className="h-screen w-screen bg-neutral-950">
      <SidebarDemo>
        <Dashboard>
          <div className="p-6">
            <ReportsSettingsTable />
          </div>
        </Dashboard>
      </SidebarDemo>
    </div>
  );
}
