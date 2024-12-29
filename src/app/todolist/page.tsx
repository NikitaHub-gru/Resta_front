"use client";

import { SidebarDemo } from "@/components/main/mailbar";
import { Dashboard } from "@/components/main/rightbar";
import { Input } from "@/components/ui/input";

export default function ReportsPage() {
  return (
    <div className="h-screen w-screen bg-neutral-950">
      <SidebarDemo>
        <Dashboard>
          <p>TODO</p>
        </Dashboard>
      </SidebarDemo>
    </div>
  );
}
