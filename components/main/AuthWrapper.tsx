"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Session } from "@supabase/supabase-js";
import Component from "@/components/main/loading-page";

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/home", "/"];

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleAuthStateChange = (session: Session | null) => {
    setSession(session);
    if (!session && !PUBLIC_ROUTES.includes(pathname)) {
      router.push("/login");
    }
  };

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setIsLoading(false);
        if (!session && !PUBLIC_ROUTES.includes(pathname)) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthStateChange(session);
    });

    return () => subscription.unsubscribe();
  }, []); // Remove router and pathname from dependencies

  // Separate effect for handling route changes
  useEffect(() => {
    if (!isLoading && !session && !PUBLIC_ROUTES.includes(pathname)) {
      router.push("/login");
    }
  }, [session, pathname, isLoading, router]);

  if (isLoading) {
    return <Component />;
  }

  return <>{children}</>;
}
