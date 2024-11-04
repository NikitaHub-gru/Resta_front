import { useMemo } from 'react'

interface JsonViewerProps {
  data: any
}

export function JsonViewer({ data }: JsonViewerProps) {
  const formattedJson = useMemo(() => {
    const jsonString = JSON.stringify(data, null, 2)
    return jsonString
      .split('\n')
      .map(line => 
        line
          .replace(/"([^"]+)":/g, '<span class="text-purple-400">"$1"</span>:')
          .replace(/"([^"]+)"/g, '<span class="text-green-400">"$1"</span>')
          .replace(/\b(true|false)\b/g, '<span class="text-yellow-400">$1</span>')
          .replace(/\b(\d+)\b/g, '<span class="text-blue-400">$1</span>')
          .replace(/\b(null)\b/g, '<span class="text-red-400">$1</span>')
      )
      .join('\n')
  }, [data])

  return (
    <pre className="text-sm font-mono">
      <code 
        className="text-neutral-200"
        dangerouslySetInnerHTML={{ __html: formattedJson }}
      />
    </pre>
  )
} 