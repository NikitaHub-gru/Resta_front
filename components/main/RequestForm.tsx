"use client";

import { Key, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface RequestFormProps {
  apiKey: string;
  url: string;
  method: string;
  body: string;
  loading: boolean;
  onApiKeyChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onMethodChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function RequestForm({
  apiKey,
  url,
  method,
  body,
  loading,
  onApiKeyChange,
  onUrlChange,
  onMethodChange,
  onBodyChange,
  onSubmit,
}: RequestFormProps) {
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleBodyChange = (value: string) => {
    try {
      if (value.trim() === "") {
        setJsonError(null);
        onBodyChange(value);
        return;
      }
      JSON.parse(value);
      setJsonError(null);
      onBodyChange(value);
    } catch (e) {
      setJsonError("Invalid JSON format");
      onBodyChange(value);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center space-x-2">
        <Key className="text-gray-400" />
        <Input
          type="password"
          placeholder="API Key"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          className="bg-transparent border-gray-700"
        />
      </div>

      <div className="flex space-x-2">
        <select
          value={method}
          onChange={(e) => onMethodChange(e.target.value)}
          className="bg-transparent border border-gray-700 rounded-md px-3 py-2 text-gray-200 appearance-none hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent [&>option]:bg-[#2E2E30] [&>option]:text-gray-200 [&>option:hover]:bg-gray-800 [&>option:checked]:bg-[#1A1A1D]"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>

        <Input
          type="url"
          placeholder="API URL"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          className="bg-transparent border-gray-700"
          required
        />

        <Button type="submit" disabled={loading} className="min-w-[100px]">
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Send className="mr-2" />
          )}
          {loading ? "Sending..." : "Send"}
        </Button>
      </div>

      {method !== "GET" && (
        <div className="space-y-2">
          <Textarea
            placeholder="Enter request body (JSON)"
            value={body}
            onChange={(e) => handleBodyChange(e.target.value)}
            className="font-mono text-sm min-h-[200px] bg-transparent border-gray-700"
          />
          {jsonError && <p className="text-red-500 text-sm">{jsonError}</p>}
        </div>
      )}
    </form>
  );
}
