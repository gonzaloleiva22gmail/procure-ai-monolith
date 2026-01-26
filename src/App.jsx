import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import DocumentList from './components/DocumentList';
import ContractsLayout from './components/ContractsLayout';
import TendersDashboard from './components/TendersDashboard';
import AnalystDashboard from './components/AnalystDashboard';

function App() {
  const [activeView, setActiveView] = useState('chat');
  const [activeTemplate, setActiveTemplate] = useState(null);

  const handleSelectTemplate = (template) => {
    setActiveTemplate(template);
    setActiveView('chat');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'chat':
        return <ChatWindow activeTemplate={activeTemplate} />;
      case 'templates':
        return (
          <DocumentList
            title="My Templates"
            type="templates"
            onSelectTemplate={handleSelectTemplate}
          />
        );
      case 'policies':
        return <DocumentList title="Policies & Procedures" type="policies" />;
      case 'tenders':
        return <TendersDashboard onViewChange={setActiveView} />;
      case 'analyst':
        return <AnalystDashboard />;

      case 'contracts':
        return <ContractsLayout />;
      case 'dashboards':
        return <AnalystDashboard />; // Default dashboard
      default:
        return <ChatWindow activeTemplate={activeTemplate} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onClearTemplate={() => setActiveTemplate(null)}
      />
      <main className="flex-1 h-full overflow-hidden relative">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
