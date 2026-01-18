import React from 'react';
import { MoreHorizontal, Calendar, DollarSign, Clock } from 'lucide-react';

const TendersDashboard = () => {
    const columns = [
        {
            id: 'upcoming',
            title: 'Upcoming',
            count: 4,
            color: 'bg-blue-500',
            items: [
                { id: 1, title: 'IT Infrastructure Refresh', budget: '$2.5M', due: 'Feb 15' },
                { id: 2, title: 'Office Supplies Global', budget: '$450k', due: 'Feb 28' },
                { id: 3, title: 'Logistics Partner - APAC', budget: '$1.2M', due: 'Mar 10' },
                { id: 7, title: 'Marketing Agency Retainer', budget: '$800k', due: 'Mar 15' },
            ]
        },
        {
            id: 'wip',
            title: 'Work In Progress',
            count: 3,
            color: 'bg-amber-500',
            items: [
                { id: 4, title: 'Cloud Migration Services', budget: '$5.0M', status: 'Evaluation', daysLeft: 12 },
                { id: 5, title: 'Facility Management', budget: '$1.8M', status: 'Negotiation', daysLeft: 5 },
                { id: 8, title: 'HRIS System Implementation', budget: '$3.2M', status: 'RFP Open', daysLeft: 20 },
            ]
        },
        {
            id: 'awaiting',
            title: 'Awaiting Award',
            count: 2,
            color: 'bg-emerald-500',
            items: [
                { id: 6, title: 'Fleet Maintenance', budget: '$600k', vendor: 'AutoFix Corp' },
                { id: 9, title: 'Security Services', budget: '$950k', vendor: 'SecureGuard' },
            ]
        }
    ];

    return (
        <div className="flex flex-col h-full bg-slate-50/50 p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Tenders Pipeline</h2>
                    <p className="text-slate-500 mt-1">Track procurement activities across stages</p>
                </div>
                <button className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors">
                    Create New Tender
                </button>
            </div>

            <div className="flex gap-6 h-full overflow-x-auto pb-4">
                {columns.map((col) => (
                    <div key={col.id} className="flex-1 min-w-[320px] flex flex-col bg-slate-100/50 rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${col.color}`}></div>
                                <h3 className="font-semibold text-slate-700">{col.title}</h3>
                                <span className="bg-white px-2 py-0.5 rounded-full text-xs font-semibold text-slate-500 border border-slate-200">
                                    {col.count}
                                </span>
                            </div>
                            <MoreHorizontal size={18} className="text-slate-400 cursor-pointer" />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                            {col.items.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-medium text-slate-800 leading-snug">{item.title}</h4>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                                        <div className="flex items-center gap-1">
                                            <DollarSign size={14} />
                                            <span>{item.budget}</span>
                                        </div>
                                        {item.due && (
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                <span>{item.due}</span>
                                            </div>
                                        )}
                                        {item.daysLeft && (
                                            <div className="flex items-center gap-1 text-amber-600">
                                                <Clock size={14} />
                                                <span>{item.daysLeft} days</span>
                                            </div>
                                        )}
                                    </div>

                                    {item.status && (
                                        <div className="inline-block px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded border border-amber-100">
                                            {item.status}
                                        </div>
                                    )}
                                    {item.vendor && (
                                        <div className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded border border-emerald-100">
                                            Winner: {item.vendor}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TendersDashboard;
