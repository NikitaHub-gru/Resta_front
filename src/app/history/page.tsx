"use client";

import { SidebarDemo } from "@/components/main/mailbar";
import { Dashboard } from "@/components/main/rightbar";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";

export default function ReportsSettingsPage() {
  const [rawData, setRawData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data...");
        const { data, error } = await supabase.from("saved_data").select("*");

        console.log("Raw response:", { data, error });

        if (error) {
          console.error("Error fetching data:", error);
          return;
        }

        if (data) {
          console.log("Setting data:", data);
          setRawData(data);
        } else {
          console.log("No data received");
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="h-screen w-screen bg-neutral-950">
      <SidebarDemo>
        <Dashboard>
          <div className="p-6 text-white">
            <h1 className="text-xl mb-4">Raw Data Debug View:</h1>
            <pre className="bg-gray-800 p-4 rounded overflow-auto max-h-[600px]">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </div>
        </Dashboard>
      </SidebarDemo>
    </div>
  );
}
