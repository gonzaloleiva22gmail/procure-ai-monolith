import React, { useState } from 'react';
import { FileText, Download, MoreVertical, Search, Filter } from 'lucide-react';

const DocumentList = ({ title, type, onSelectTemplate }) => {
    const [docs, setDocs] = useState([]);

    React.useEffect(() => {
        if (type === 'templates') {
            fetch('/templates')
                .then(res => res.json())
                .then(data => {
                    const enriched = data.map(t => ({
                        ...t,
                        author: 'System'
                    }));
                    setDocs(enriched);
                })
                .catch(err => console.error("Failed to fetch templates", err));
        } else if (type === 'contracts') {
            fetch('/contracts')
                .then(res => res.json())
                .then(data => {
                    const enriched = data.map(c => ({
                        ...c,
                        author: 'System' // Or 'Contract' if preferred, but matching 'System' to keep it simple
                    }));
                    setDocs(enriched);
                })
                .catch(err => console.error("Failed to fetch contracts", err));
        } else {
            // Mock data for policies
            setDocs([
                { id: 1, name: 'Global Procurement Policy v2.0', date: 'Sep 10, 2024', size: '2.4 MB', author: 'Compliance' },
                { id: 2, name: 'Sustainable Sourcing Guidelines', date: 'Oct 01, 2024', size: '890 KB', author: 'ESG Team' },
                { id: 3, name: 'Vendor Onboarding Procedures', date: 'Nov 20, 2024', size: '1.5 MB', author: 'Ops' },
            ]);
        }
    }, [type]);

    const handleAutofill = (template) => {
        if (onSelectTemplate) onSelectTemplate(template);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50 p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                    <p className="text-slate-500 mt-1">Manage and access your key documents</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                    <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
                {docs.length === 0 && (type === 'templates' || type === 'contracts') ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                        <FileText size={48} className="text-slate-300 mb-4" />
                        <p className="text-lg font-medium">No documents found</p>
                        <p className="text-sm">Please add files to <code className="bg-slate-100 px-1 py-0.5 rounded">backend/{type === 'templates' ? 'templates' : 'Contracts'}</code></p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Document Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Last Updated</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Size</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Owner</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm tar">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {docs.map((doc) => (
                                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <FileText size={20} />
                                            </div>
                                            <span className="font-medium text-slate-800">{doc.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">{doc.date}</td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">{doc.size}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium border border-slate-200">
                                            {doc.author}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {type === 'templates' ? (
                                            <button
                                                onClick={() => handleAutofill(doc)}
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
                                            >
                                                Autofill Template
                                            </button>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Download">
                                                    <Download size={16} />
                                                </button>
                                                <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="More">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default DocumentList;
