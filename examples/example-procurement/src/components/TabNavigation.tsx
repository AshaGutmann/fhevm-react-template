type Tab = 'create' | 'bid' | 'view' | 'manage' | 'history';

interface TabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'create' as Tab, label: 'Create Procurement' },
    { id: 'bid' as Tab, label: 'Submit Bid' },
    { id: 'view' as Tab, label: 'View Procurements' },
    { id: 'manage' as Tab, label: 'Manage Suppliers' },
    { id: 'history' as Tab, label: 'Transaction History' },
  ];

  return (
    <nav className="tab-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
