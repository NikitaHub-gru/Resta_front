"use client"

import { useState } from "react";
import { SidebarDemo } from "@/components/main/mailbar";
import Dashboard from "@/components/main/rightbar";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { Mistral } from "@mistralai/mistralai";

const apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY;

export default function ReportsPage() {
    const [response, setResponse] = useState<string>("");
    const [inputText, setInputText] = useState<string>("");

    const placeholders = [
        "Отправь мне JSON",
        "Я не буду отвечать на другие вопросы!",
        "Меня так запрограммировали...",
    ];
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
    };
    
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const client = new Mistral({ apiKey: apiKey });
        try {
            const result = await client.chat.stream({
                model: "mistral-small-latest",
                messages: [{ role: 'user', content: `\`\`\`json\n${inputText}\n\`\`\`Проверь json и преобразуй и исправь ошибки что бы он воспринимался в API запросах postman , добавь комментарии и сделай форматирование ident=4 "from": start_date, "to": end_date, Замени на текущую дату ` }],
            });

            let fullResponse = "";
            for await (const chunk of result) {
                const streamText = chunk.data.choices[0].delta.content;
                fullResponse += streamText;
            }
            setResponse(fullResponse);
        } catch (error) {
            console.error("Ошибка при получении ответа от AI:", error);
            setResponse("Ошибка при получении ответа от AI.");
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(response);
        alert("JSON скопирован в буфер обмена!");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <SidebarDemo>
                <Dashboard>
                    <div className="flex flex-col items-center px-4 py-8">
                        <h2 className="mb-6 text-2xl font-bold text-center sm:text-4xl dark:text-white text-black">
                            Talk Data to Me
                        </h2>
                        <p className="text-center mb-4 text-gray-600">AI Response:</p>
                        <div className="mt-4 p-4 bg-gray-900 text-green-500 rounded w-full max-w-lg">
                            <pre className="whitespace-pre-wrap overflow-y-auto h-40">
{`> ${response}`}
                            </pre>
                        </div>
                        <p className="text-center mb-4 text-gray-600">Choose a prompt below or write your own to start chatting with Seam</p>
                        <div className="flex flex-wrap justify-center mb-6">
                            <button className="m-2 p-2 bg-gray-200 rounded font-bold hover:bg-gray-300">Clean account fields</button>
                            <button className="m-2 p-2 bg-gray-200 rounded font-bold hover:bg-gray-300">Clean contact fields</button>
                            <button className="m-2 p-2 bg-gray-200 rounded font-bold hover:bg-gray-300">Create master 'People' list</button>
                            <button className="m-2 p-2 bg-gray-200 rounded font-bold hover:bg-gray-300">Account Fit Score</button>
                            <button className="m-2 p-2 bg-gray-200 rounded font-bold hover:bg-gray-300">Match leads to account</button>
                        </div>
                        <PlaceholdersAndVanishInput
                            placeholders={placeholders}
                            onChange={handleChange}
                            onSubmit={onSubmit}
                        />
                    </div>
                </Dashboard>
            </SidebarDemo>
        </div>
    )
}
