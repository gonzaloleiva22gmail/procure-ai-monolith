import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ChatWindow from './ChatWindow'; // Reuse generic chat if possible, or build specific

const AnalystDashboard = () => {
    const spendData = [
        { name: 'IT', amount: 4000 },
        { name: 'HR', amount: 3000 },
        { name: 'Marketing', amount: 2000 },
        { name: 'Ops', amount: 2780 },
        { name: 'Legal', amount: 1890 },
    ];

    const statusData = [
        { name: 'On Track', value: 400 },
        { name: 'At Risk', value: 30 },
        { name: 'Delayed', value: 50 },
    ];
    const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="flex h-full bg-slate-50/50">
            {/* Metrics Area */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">Procurement Analytics</h2>
                    <p className="text-slate-500 mt-1">Real-time spend analysis and performance metrics</p>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                    {/* Spend by Category */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-700 mb-6">Spend by Category (k)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={spendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Project Status */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-700 mb-6">Project Status</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-sm text-slate-500 font-medium">Total Spend YTD</p>
                        <p className="text-2xl font-bold text-slate-800 mt-2">$42.5M</p>
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">↑ 12% vs last year</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-sm text-slate-500 font-medium">Active Suppliers</p>
                        <p className="text-2xl font-bold text-slate-800 mt-2">1,240</p>
                        <p className="text-xs text-slate-500 mt-1">Total base</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-sm text-slate-500 font-medium">Savings Realized</p>
                        <p className="text-2xl font-bold text-slate-800 mt-2">$3.2M</p>
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">↑ 5% above target</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-sm text-slate-500 font-medium">Open PRs</p>
                        <p className="text-2xl font-bold text-slate-800 mt-2">145</p>
                        <p className="text-xs text-amber-600 mt-1">24 pending approval</p>
                    </div>
                </div>
            </div>

            {/* Side Chat */}
            <div className="w-[400px] border-l border-slate-200 bg-white">
                <ChatWindow />
                {/* We might need to adjust ChatWindow styling to fit perfectly without its own border/headers if we wanted, 
            but reusing it as-is is fine, it will just start with a header. 
            Maybe we can override the header text if we passed props, but 'Procurement Assistant' works here too. 
        */}
            </div>
        </div>
    );
};

export default AnalystDashboard;
