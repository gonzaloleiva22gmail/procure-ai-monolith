import React, { useState, useEffect } from 'react';
import { FileText, Bot, Loader2, Calendar, DollarSign, Shield, Info, ChevronRight } from 'lucide-react';
import ChatWindow from './ChatWindow';

const ContractsLayout = () => {
    const [contracts, setContracts] = useState([]);
    const [selectedContract, setSelectedContract] = useState(null);
    const [extractedData, setExtractedData] = useState(null);
    const [isExtracting, setIsExtracting] = useState(false);

    // Fetch contracts list on mount
    useEffect(() => {
        fetch('http://localhost:8000/contracts')
            .then(res => res.json())
            .then(data => {
                const enriched = data.map(c => ({ ...c, author: 'System' }));
                setContracts(enriched);
            })
            .catch(err => console.error("Failed to fetch contracts", err));
    }, []);

    const handleSelectContract = async (contract) => {
        setSelectedContract(contract);
        setExtractedData(null); // Reset previous data
        setIsExtracting(true);

        try {
            const res = await fetch('http://localhost:8000/contracts/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: contract.name })
            });
            const data = await res.json();
            setExtractedData(data);
        } catch (error) {
            console.error("Extraction failed", error);
        } finally {
            setIsExtracting(false);
        }
    };

    return (
        <div className="flex h-full bg-slate-50/50">
            {/* LEFT COLUMN: Contracts Table (65%) */}
            <div className="flex-1 p-8 overflow-y-auto border-r border-slate-200">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">Contracts Repository</h2>
                    <p className="text-slate-500 mt-1">Select a contract to activate the assistant</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {contracts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                            <p>No contracts found in backend/Contracts</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Contract Name</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Date</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Size</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {contracts.map((doc) => (
                                    <tr
                                        key={doc.id}
                                        onClick={() => handleSelectContract(doc)}
                                        className={`cursor-pointer transition-colors ${selectedContract?.id === doc.id
                                                ? 'bg-blue-50 border-l-4 border-blue-500'
                                                : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <FileText size={20} className={selectedContract?.id === doc.id ? "text-blue-600" : "text-slate-400"} />
                                                <span className={`font-medium ${selectedContract?.id === doc.id ? "text-blue-700" : "text-slate-800"}`}>
                                                    {doc.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">{doc.date}</td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">{doc.size}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: Assistant & Chat (35%) */}
            <div className="w-[450px] bg-white flex flex-col h-full border-l border-slate-200 shadow-xl z-10 transition-transform">
                {!selectedContract ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                        <div className="p-4 bg-slate-100 rounded-full mb-4">
                            <Bot size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700">Contract Assistant</h3>
                        <p className="text-sm mt-2">Select a document from the left to extract insights and chat.</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <FileText size={16} className="text-blue-600" />
                                {selectedContract.name}
                            </h3>
                        </div>

                        {/* Extraction Panel */}
                        <div className="p-4 border-b border-slate-200 bg-slate-50/30 max-h-[40%] overflow-y-auto">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <Info size={14} /> Key Terms
                                </h4>
                                {isExtracting && <span className="text-xs text-blue-600 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Analyzing...</span>}
                            </div>

                            {extractedData ? (
                                <div className="space-y-3">
                                    {Object.entries(extractedData).map(([key, value]) => (
                                        <div key={key} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                            <p className="text-xs text-slate-500 font-medium mb-1">{key}</p>
                                            <p className="text-sm text-slate-800">{value || "N/A"}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                !isExtracting && <div className="text-sm text-slate-400 italic">No data extracted.</div>
                            )}
                        </div>

                        {/* Chat Interface */}
                        <div className="flex-1 overflow-hidden relative">
                            {/* Overlay ChatWindow but we need to trick it to act as contract chat */}
                            {/* We will pass a special 'activeTemplate' mock that tells ChatWindow to use contract mode? 
                                 Or better, we modify ChatWindow to accept 'activeContract' prop as planned. 
                             */}
                            <ChatWindow activeContract={selectedContract} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ContractsLayout;
