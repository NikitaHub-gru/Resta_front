"use client"

import { useState } from "react";
import { SidebarDemo } from "@/components/main/mailbar";
import Dashboard from "@/components/main/rightbar";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { Mistral } from "@mistralai/mistralai";
import CodeComparison from "@/components/ui/code-comparison";

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
    
    const parseJsonResponse = (jsonString: string) => {
        return jsonString.replace(/```json|```/g, '').trim();
    };
    
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const client = new Mistral({ apiKey: apiKey });
        try {
            const result = await client.chat.stream({
                model: "mistral-small-latest",
                messages: [{ role: 'user', content: `\`\`\`\n${inputText}\n\`\`\`Проверь json и преобразуй и исправь ошибки что бы он воспринимался в API запросах postman , не добавляй комментарии и сделай форматирование ident=4 "from": start_date, "to": end_date, Замени на текущую дату не пиши описание проделанной работы, только исправленный json ` }],
            });

            let fullResponse = "";
            for await (const chunk of result) {
                const streamText = chunk.data.choices[0].delta.content;
                fullResponse += streamText;
            }
            setResponse(parseJsonResponse(fullResponse));
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
        <div className="min-h-screen flex flex-col items-center justify-center">
            <SidebarDemo>
                <Dashboard>
                    <div className="flex flex-col items-center justify-center w-full  h-full px-0 py-4">
                        <h2 className="mb-2 text-2xl font-bold text-center sm:text-4xl dark:text-white text-black">
                            Talk Data to Me
                        </h2>
                        <p className="text-center mb-2 text-gray-600">AI Response:</p>
                        {response && (
                            <div className="mt-0 p-0 w-full h-80 overflow-y-auto flex justify-center">
                                <pre className="whitespace-pre-wrap w-full">
                                    <CodeComparison
                                        beforeCode={inputText}
                                        afterCode={response}
                                        language="json"
                                        filename="json-api"
                                        lightTheme="github-light"
                                        darkTheme="github-dark"
                                    />
                                </pre>
                            </div>
                        )}
                        <p className="text-center mb-2 text-gray-600">Choose a prompt below or write your own to start chatting with Seam</p>
                        <div className="mt-0 p-0 w-full flex justify-center">
                            <PlaceholdersAndVanishInput
                                placeholders={placeholders}
                                onChange={handleChange}
                                onSubmit={onSubmit}
                            />
                        </div>
                    </div>
                </Dashboard>
            </SidebarDemo>
        </div>
    )
}
