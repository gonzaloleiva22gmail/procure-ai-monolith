import React, { useState, useEffect } from 'react';
import { FileText, Bot, Shield, Info } from 'lucide-react';
import ChatWindow from './ChatWindow';

const PoliciesLayout = () => {
    const [policies, setPolicies] = useState([]);
    const [selectedPolicy, setSelectedPolicy] = useState(null);

    // Fetch policies list on mount
    useEffect(() => {
        fetch('/policies')
            .then(res => res.json())
            .then(data => {
                setPolicies(data);
            })
            .catch(err => console.error("Failed to fetch policies", err));
    }, []);

    const handleSelectPolicy = (policy) => {
        setSelectedPolicy(policy);
    };

    return (
        <div className="flex h-full bg-slate-50/50">
            {/* LEFT COLUMN: Policies Table (65%) */}
            <div className="flex-1 p-8 overflow-y-auto border-r border-slate-200">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">Policies & Procedures</h2>
                    <p className="text-slate-500 mt-1">Browse organizational procurement policies</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {policies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                            <p>No policies found in knowledge_base/policies</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Policy Name</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Last Updated</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Size</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {policies.map((doc) => (
                                    <tr
                                        key={doc.id}
                                        onClick={() => handleSelectPolicy(doc)}
                                        className={`cursor-pointer transition-colors ${selectedPolicy?.id === doc.id
                                            ? 'bg-blue-50 border-l-4 border-blue-500'
                                            : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <FileText size={20} className={selectedPolicy?.id === doc.id ? "text-blue-600" : "text-slate-400"} />
                                                <span className={`font-medium ${selectedPolicy?.id === doc.id ? "text-blue-700" : "text-slate-800"}`}>
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
                {!selectedPolicy ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                        <div className="p-4 bg-slate-100 rounded-full mb-4">
                            <Shield size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700">Policy Assistant</h3>
                        <p className="text-sm mt-2">Select a policy from the left to review and ask questions.</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <FileText size={16} className="text-blue-600" />
                                {selectedPolicy.name}
                            </h3>
                        </div>

                        {/* Chat Interface */}
                        <div className="flex-1 overflow-hidden relative">
                            <ChatWindow activePolicy={selectedPolicy} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PoliciesLayout;
