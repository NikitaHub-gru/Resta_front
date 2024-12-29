"use client";
import "./request.module.css";
import { SidebarDemo } from "@/components/main/mailbar";
import { Dashboard } from "@/components/main/rightbar";
import { Input } from "@/components/ui/input";
import ApiTester from "@/components/main/ApiTester";
import { Terminal } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function ReportsPage() {
  return (
    <div className="h-screen w-screen bg-neutral-950">
      <SidebarDemo>
        <ScrollArea className="w-full h-full">
          <main className="min-h-screen gradient-bg relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

            <div className="container mx-auto px-4 py-12 relative z-10">
              {/* Header section */}
              <div className="flex flex-col items-center justify-center mb-12 space-y-4">
                <div className="p-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-2">
                  <Terminal className="h-8 w-8 text-indigo-400" />
                </div>
                <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                  API Request Tester
                </h1>
                <p className="text-white/60 text-center max-w-md">
                  Test your API endpoints with a modern, intuitive interface
                </p>
              </div>

              {/* Main content */}
              <div className="max-w-5xl mx-auto">
                <ApiTester />
              </div>
            </div>
          </main>
          </ScrollArea>
      </SidebarDemo>
    </div>
  );
}
