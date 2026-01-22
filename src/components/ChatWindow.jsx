import React, { useState, useEffect, useRef } from "react";
import { Send, Shield, Bot, User, Briefcase, FileText, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";

const ChatWindow = ({ activeTemplate, activeContract }) => {
    // Determine the initial message dynamically
    const getInitialMessage = () => {
        if (activeTemplate) return `I'm ready to help you build your **${activeTemplate.name}**. What information should we start with?`;
        if (activeContract) return `Reviewing **${activeContract.name}**. Ask me anything about this contract.`;

        // Contract Assistant Default Greeting
        if (activeContract !== undefined) return "I am your Contract Assistant. You can ask me about any contract in the repository, or select a file to auto-extract its key terms.";

        return "Welcome back. I'm ready to assist with your procurement tasks. I am your **Data Analyst**.";
    };

    const [messages, setMessages] = useState([{ role: "assistant", content: getInitialMessage() }]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // NEW: State to store extracted variables for the template
    const [templateData, setTemplateData] = useState({});

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    // Reset messages and data when context changes
    useEffect(() => {
        setMessages([{ role: "assistant", content: getInitialMessage() }]);
        setTemplateData({}); // Clear stored data when switching templates
    }, [activeTemplate, activeContract]);

    const handleSend = async () => {
        if (!input.trim()) return;

        // 1. SHOW USER MESSAGE IMMEDIATELY
        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);

        const currentInput = input;
        setInput(""); // Clear input box
        setIsLoading(true);

        try {
            // 2. DECIDE ENDPOINT
            let endpoint = "/chat";
            let payload = { message: currentInput };

            if (activeTemplate) {
                endpoint = "/template-chat";
                payload = { message: currentInput, filename: activeTemplate.name };
            } else if (activeContract !== undefined) {
                // Contract Mode (Specific or General)
                endpoint = "/contract-chat";
                payload = {
                    message: currentInput,
                    filename: activeContract ? activeContract.name : null
                };
            }

            // 3. SEND TO SERVER WITH TIMEOUT
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout

            console.log(`[ChatWindow] Sending request to ${endpoint}...`);
            const startTime = Date.now();

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const responseTime = Date.now() - startTime;
            console.log(`[ChatWindow] Response received in ${responseTime}ms`);

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();

            // 4. PROCESS RESPONSE
            // Robust check: handle if backend sends { response: ... } or just raw string
            let aiText = data?.response || data?.reply || (typeof data === 'string' ? data : "No response received.");

            // 2. CAPTURE DATA & FORMAT FOR DISPLAY
            // Use safe optional chaining and defaults
            const newVars = data?.extracted_data || {};

            if (newVars && typeof newVars === 'object' && Object.keys(newVars).length > 0) {

                // A. Save to state for the Download Button
                console.log("Updating Template Data:", newVars);
                setTemplateData(prev => ({ ...prev, ...newVars }));

                // B. VISUALIZE: Append a readable summary to the chat message
                const summaryList = Object.entries(newVars)
                    .map(([key, value]) => `- **${key}**: ${value}`)
                    .join("\n");

                // Append to the AI's text response
                aiText += `\n\n___\n**Extracted Information:**\n${summaryList}`;
            }

            // 5. SHOW AI RESPONSE
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: aiText },
            ]);
        } catch (error) {
            console.error("Chat Error:", error);

            let errorMessage = "Could not connect to the AI server.";
            if (error.name === 'AbortError') {
                errorMessage = "Request timed out after 90 seconds. The AI server may be experiencing high load. Please try again.";
            } else if (error.message) {
                errorMessage = error.message;
            }

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: `Error: ${errorMessage}` },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-lg">
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${activeTemplate ? "bg-indigo-100" : activeContract ? "bg-emerald-100" : "bg-blue-100"}`}>
                        {activeTemplate ? (
                            <Briefcase className="w-5 h-5 text-indigo-600" />
                        ) : activeContract ? (
                            <FileText className="w-5 h-5 text-emerald-600" />
                        ) : (
                            <Shield className="w-5 h-5 text-blue-600" />
                        )}
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-800">
                            {activeTemplate ? "Template Consultant" : activeContract ? "Contract Assistant" : "Data Analyst"}
                        </h2>
                        <p className="text-xs text-slate-500">
                            {activeTemplate ? `Drafting: ${activeTemplate.name}` : activeContract ? `Viewing: ${activeContract.name}` : "Enterprise Agent"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-slate-50 rounded-full border border-slate-200 flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-600 flex items-center gap-2">
                            <Shield className="w-3 h-3" /> Secure Environment
                        </span>
                    </div>
                    {/* DOWNLOAD BUTTON */}
                    {activeTemplate && (
                        <button
                            onClick={async () => {
                                try {
                                    const response = await fetch("/generate", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            filename: activeTemplate.name,
                                            answers: templateData // FIXED: Sending actual captured data
                                        }),
                                    });

                                    if (!response.ok) throw new Error("Generation failed");

                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `Filled_${activeTemplate.name}`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    window.URL.revokeObjectURL(url);
                                } catch (e) {
                                    console.error("Download error:", e);
                                    alert("Failed to generate document.");
                                }
                            }}
                            className="ml-4 flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <Download className="w-3 h-3" />
                            Download Document
                        </button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""
                            }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-slate-800" : "bg-white border border-slate-200"
                                }`}
                        >
                            {msg.role === "user" ? (
                                <User className="w-5 h-5 text-white" />
                            ) : (
                                <Bot className="w-5 h-5 text-indigo-600" />
                            )}
                        </div>
                        <div
                            className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === "user"
                                ? "bg-slate-800 text-white"
                                : "bg-white text-slate-700 border border-slate-100"
                                }`}
                        >
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-indigo-600 animate-pulse" />
                        </div>
                        <div className="bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 rounded-b-lg">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSend()}
                        placeholder={activeTemplate ? "Answer the consultant..." : activeContract ? "Ask about the contract..." : "Ask the analyst..."}
                        className="w-full pl-4 pr-12 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm text-slate-700 placeholder-slate-400"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-xs text-slate-400">
                        AI can make mistakes. Please verify important information.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;