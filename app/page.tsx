"use client"

import { SidebarDemo } from "@/components/main/mailbar";
import Dashboard from "@/components/main/rightbar";
import { Navbar } from "@/components/main/navbar";
import { HeroSection } from "@/components/main/hero-section";
import { FeaturesSection } from "@/components/main/features-section";
import { supabase } from '@/lib/supabaseClient';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
const { data: { users }, error } = await supabase.auth.admin.listUsers()

export default function Home() {
  return (
    <div className="h-screen w-screen">
      <SidebarDemo>
        <Dashboard>
          <ScrollArea className="w-full h-full">
        <main className="min-h-screen">
        <ShootingStars />
        <StarsBackground />
          <Navbar />
          <HeroSection />
          <FeaturesSection />
        </main>
        <ScrollBar orientation="vertical" />
        </ScrollArea>
        </Dashboard>
      </SidebarDemo>

    </div>
  );
}
