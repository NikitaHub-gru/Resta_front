"use client";

import DoccumentationPage from "@/components/main/DoccumentationP";
import { SidebarDemo } from "@/components/main/mailbar";
import { Dashboard } from "@/components/main/rightbar";

export default function ReportsPage() {
  return (
    <div className="h-screen w-screen bg-neutral-950">
      <SidebarDemo>
        <Dashboard>
          <DoccumentationPage />
        </Dashboard>
      </SidebarDemo>
    </div>
  );
}
