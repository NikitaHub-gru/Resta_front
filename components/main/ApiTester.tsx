"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import RequestForm from "./RequestForm";
import { CustomScrollArea } from "@/components/ui/custom-scroll-area";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
export default function ApiTester() {
  const [apiKey, setApiKey] = useState("");
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [history, setHistory] = useState<
    Array<{ url: string; method: string }>
  >([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare the request data to send to our API
      const requestData = {
        targetUrl: url,
        method: method,
        headers: {
          Authorization: apiKey ? apiKey : "",
          "Content-Type": "application/json",
        },
        body: method !== "GET" ? body.trim() : undefined
      };

      const response = await fetch('https://nikitahub-gru-resta-back-f1fb.twc1.net/request_api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      setResponse(data);
      setHistory((prev) => [...prev, { url, method }]);
      toast.success("Request successful");
    } catch (error) {
      toast.error("Request failed");
      setResponse({ error: "Failed to fetch data" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    toast.success("Copied to clipboard");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <Card className="glass-panel p-6">
          <RequestForm
            apiKey={apiKey}
            url={url}
            method={method}
            body={body}
            loading={loading}
            onApiKeyChange={setApiKey}
            onUrlChange={setUrl}
            onMethodChange={setMethod}
            onBodyChange={setBody}
            onSubmit={handleSubmit}
          />
        </Card>

        {history.length > 0 && (
          <Card className="glass-panel p-4">
            <div className="flex items-center space-x-2 mb-2">
              <History className="text-gray-400" />
              <h3 className="text-lg font-semibold">Request History</h3>
            </div>
            <div className="space-y-2">
              {history.slice(-5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-sm text-gray-400"
                >
                  <span className="font-mono">{item.method}</span>
                  <span className="truncate">{item.url}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {response && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Response</h3>
              <Button
                size="sm"
                onClick={copyToClipboard}
                className="text-xs"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
            <Card className="glass-panel p-4">
            <ScrollArea >
              <pre className="json-viewer overflow-auto">
                {JSON.stringify(response, null, 2)}
              </pre>
              <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </Card>
  
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
