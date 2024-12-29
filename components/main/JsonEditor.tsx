"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JsonEditor({ value, onChange }: JsonEditorProps) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (newValue: string) => {
    try {
      if (newValue.trim() === "") {
        setError(null);
        onChange(newValue);
        return;
      }
      JSON.parse(newValue);
      setError(null);
      onChange(newValue);
    } catch (e) {
      setError("Invalid JSON format");
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Enter JSON body (optional)"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="font-mono text-sm bg-transparent border-gray-700 min-h-[200px]"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
