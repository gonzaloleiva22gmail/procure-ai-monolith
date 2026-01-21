import React from 'react';
import {
  FileText,
  ShieldCheck,
  Workflow,
  BarChart2,
  FileSignature,
  Settings,
  Bot
} from 'lucide-react';

const Sidebar = ({ activeView, onViewChange }) => {
  const [counts, setCounts] = React.useState({ templates: 0, contracts: 0, tenders: 5 });

  React.useEffect(() => {
    const fetchCounts = async () => {
      console.log("ANTIGRAVITY DEBUG: Sidebar loading... (Version 2.1)");
      try {
        // Fetch Templates Count
        console.log("ANTIGRAVITY DEBUG: Fetching /templates...");
        const templatesRes = await fetch('/templates');
        console.log("ANTIGRAVITY DEBUG: /templates status:", templatesRes.status);

        if (!templatesRes.ok) {
          const text = await templatesRes.text();
          console.error("ANTIGRAVITY DEBUG: /templates FAILED. Body:", text);
          throw new Error(`Templates API Error: ${templatesRes.status}`);
        }

        const templatesData = await templatesRes.json();
        console.log("ANTIGRAVITY DEBUG: /templates data:", templatesData);

        // Fetch Contracts Count
        const contractsRes = await fetch('/contracts');
        const contractsData = await contractsRes.json();

        setCounts(prev => ({
          ...prev,
          templates: Array.isArray(templatesData) ? templatesData.length : 0,
          contracts: Array.isArray(contractsData) ? contractsData.length : 0
        }));
      } catch (error) {
        console.error("ANTIGRAVITY DEBUG: Uncaught Sidebar Error:", error);
      }
    };

    fetchCounts();
  }, []);

  const menuItems = [
    {
      id: 'templates',
      label: 'My Templates',
      description: 'Access and manage your procurement doucments',
      icon: FileText,
      badge: `${counts.templates} templates`,
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'policies',
      label: 'Policies & Procedures',
      description: 'Browse organizational procurement policies',
      icon: ShieldCheck,
      badge: null
    },
    {
      id: 'tenders',
      label: 'Tenders Pipeline',
      description: 'View active tenders and their current status',
      icon: Workflow,
      badge: `${counts.tenders} active`,
      badgeColor: 'bg-sky-100 text-sky-700'
    },
    {
      id: 'analyst',
      label: 'Data Analyst',
      description: 'Get insights and analytics on procurement',
      icon: BarChart2,
      badge: null
    },
    {
      id: 'contracts',
      label: 'Contracts',
      description: 'Manage and review existing contracts',
      icon: FileSignature,
      badge: `${counts.contracts} contracts`,
      badgeColor: 'bg-indigo-100 text-indigo-700'
    },
  ];

  return (
    <div className="h-full w-80 bg-slate-50 border-r border-gray-200 flex flex-col font-sans" style={{ backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight">ProcureAI</h1>
            <p className="text-xs text-gray-500 font-medium">Procurement Assistant</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-6 mb-2 flex items-center gap-2 text-indigo-900 font-bold text-sm">
        <div className="text-indigo-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20" /></svg>
        </div>
        Quick Actions
      </div>
      <div className="px-6 mb-4 text-xs text-gray-400 font-medium">
        Click to start a conversation
      </div>

      <div className="px-4 flex-1 overflow-y-auto space-y-3 pb-6">
        {menuItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={activeView === item.id}
            onClick={() => onViewChange(item.id)}
          />
        ))}
      </div>

      {/* User Profile */}
      <div className="px-6 py-4 border-t border-gray-200 mt-auto bg-white" style={{ borderColor: '#e2e8f0' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
            JD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-gray-900 truncate">John Doe</p>
            <p className="text-xs text-gray-500 truncate">Senior Buyer</p>
          </div>
          <Settings size={18} className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ item, active, onClick }) => {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${active
        ? 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-50'
        : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100'
        }`}
    >
      {/* Top Row: Icon and Badge */}
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2 rounded-lg ${active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'} transition-colors`}>
          <Icon size={20} />
        </div>
        {item.badge && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.badgeColor || 'bg-gray-100 text-gray-600'}`}>
            {item.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div>
        <h3 className={`font-bold text-sm mb-1 ${active ? 'text-indigo-900' : 'text-slate-800'}`}>
          {item.label}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-[90%]">
          {item.description}
        </p>
      </div>
    </button>
  );
};

export default Sidebar;
