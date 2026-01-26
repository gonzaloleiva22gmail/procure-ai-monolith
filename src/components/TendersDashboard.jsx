import React from 'react';
import {
    BarChart3,
    TrendingUp,
    Users,
    AlertCircle,
    ChevronLeft,
    FileText,
    Clock,
    CheckCircle2,
    Calendar,
    DollarSign
} from 'lucide-react';

const TendersDashboard = ({ onViewChange }) => {
    const summarystats = [
        { label: 'Active Tenders', value: '8', change: '+2 this month', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Value', value: '$1.7M', change: 'In pipeline', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Avg. Submissions', value: '7.2', change: 'Per tender', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Pending Awards', value: '1', change: 'Action needed', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    const columns = [
        {
            id: 'draft',
            title: 'Draft',
            count: 2,
            color: 'bg-slate-500',
            icon: FileText,
            items: [
                { id: 1, title: 'Marketing Services RFP', budget: '$120,000', deadline: 'Feb 15, 2025' },
                { id: 2, title: 'Cloud Migration', budget: '$350,000', deadline: 'Mar 1, 2025' },
            ]
        },
        {
            id: 'published',
            title: 'Published',
            count: 3,
            color: 'bg-blue-500',
            icon: TrendingUp,
            items: [
                { id: 3, title: 'IT Infrastructure Upgrade', budget: '$250,000', deadline: 'Jan 15, 2025', submissions: 8, progress: 45, timeLeft: '22 days left' },
                { id: 4, title: 'Office Supplies Contract', budget: '$50,000', deadline: 'Jan 20, 2025', submissions: 12, progress: 30, timeLeft: '27 days left' },
                { id: 5, title: 'Consulting Services', budget: '$150,000', deadline: 'Feb 1, 2025', submissions: 4, progress: 15, timeLeft: '39 days left' },
            ]
        },
        {
            id: 'evaluation',
            title: 'Under Evaluation',
            count: 2,
            color: 'bg-amber-500',
            icon: Users,
            items: [
                { id: 6, title: 'Security Services', budget: '$200,000', deadline: 'Dec 30, 2024', submissions: 6 },
                { id: 7, title: 'Catering Services', budget: '$80,000', deadline: 'Dec 28, 2024', submissions: 9 },
            ]
        },
        {
            id: 'awaiting',
            title: 'Awaiting Contract Award',
            count: 1,
            color: 'bg-indigo-500',
            icon: Clock,
            items: [
                { id: 8, title: 'Fleet Management', budget: '$400,000', deadline: 'Dec 20, 2024', submissions: 6 },
            ]
        },
        {
            id: 'completed',
            title: 'Completed',
            count: 2,
            color: 'bg-emerald-500',
            icon: CheckCircle2,
            items: [
                { id: 9, title: 'Legal Services Panel', budget: '$180,000', deadline: 'Dec 1, 2024', submissions: 11 },
                { id: 10, title: 'Software Licenses', budget: '$95,000', deadline: 'Nov 15, 2024', submissions: 5 },
            ]
        }
    ];

    return (
        <div className="flex flex-col h-full bg-slate-50/50 overflow-hidden">
            {/* Navbar/Back to Chat */}
            <div className="px-8 py-4 bg-white border-b border-slate-200 flex items-center">
                <button
                    onClick={() => onViewChange('chat')}
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ChevronLeft size={18} />
                    Back to Chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {/* Header */}
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-slate-900">Tenders Pipeline</h2>
                    <p className="text-slate-500 mt-1">Track and manage active tenders through each stage</p>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {summarystats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <p className={`text-xs mt-2 font-semibold ${stat.color}`}>{stat.change}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pipeline Board */}
                <div className="flex gap-6 pb-6 overflow-x-auto min-h-[600px]">
                    {columns.map((col) => (
                        <div key={col.id} className="min-w-[320px] flex-1 flex flex-col">
                            {/* Column Header */}
                            <div className="flex items-center gap-3 mb-6 px-1">
                                <div className={`p-1.5 rounded-lg ${col.bg || 'bg-white shadow-sm border border-slate-200'}`}>
                                    <col.icon size={18} className={col.id === 'draft' ? 'text-slate-600' : col.id === 'published' ? 'text-blue-600' : col.id === 'evaluation' ? 'text-amber-600' : col.id === 'awaiting' ? 'text-indigo-600' : 'text-emerald-600'} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm whitespace-nowrap">{col.title}</h3>
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{col.count} tenders</p>
                                </div>
                            </div>

                            {/* Items Container */}
                            <div className="flex-1 space-y-4">
                                {col.items.map((item) => (
                                    <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group">
                                        <h4 className="font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors">{item.title}</h4>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-400 font-medium">Budget</span>
                                                <span className="text-slate-700 font-bold">{item.budget}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-400 font-medium">Deadline</span>
                                                <span className="text-slate-700 font-bold">{item.deadline}</span>
                                            </div>
                                            {item.submissions !== undefined && (
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-400 font-medium">Submissions</span>
                                                    <span className="text-slate-700 font-bold">{item.submissions}</span>
                                                </div>
                                            )}
                                        </div>

                                        {item.progress !== undefined && (
                                            <div className="mt-4 pt-4 border-t border-slate-50">
                                                <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-blue-600">
                                                    <Clock size={12} />
                                                    <span>{item.timeLeft}</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                    <div
                                                        className="bg-blue-600 h-1.5 rounded-full"
                                                        style={{ width: `${item.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TendersDashboard;

