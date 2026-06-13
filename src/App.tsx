import { useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, QrCode, Receipt, TrendingUp } from 'lucide-react';
import { useStore } from './store/useStore';

// Lazy load pages later or import directly
import { KDSPage } from './pages/KDSPage';
import { InventoryPage } from './pages/InventoryPage';
import { QRPage } from './pages/QRPage';
import { TablesPage } from './pages/TablesPage';
import { SalesPage } from './pages/SalesPage';

const Sidebar = () => {
  const navItems = [
    { name: 'สรุปยอดขาย', path: '/sales', icon: TrendingUp },
    { name: 'กระดานครัว (KDS)', path: '/kds', icon: LayoutDashboard },
    { name: 'คลังสินค้า', path: '/inventory', icon: Package },
    { name: 'สร้างคิวอาร์โค้ด', path: '/qr', icon: QrCode },
    { name: 'จัดการโต๊ะ', path: '/tables', icon: Receipt },
  ];

  
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col shadow-sm">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary tracking-tight">Merchant</h1>
        <p className="text-sm text-text-muted mt-1">ระบบจัดการร้านค้า</p>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive
                  ? 'bg-beige text-primary shadow-sm'
                  : 'text-text-muted hover:bg-cream hover:text-primary'
              }`
            }
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

function App() {
  const connect = useStore((state) => state.connect);

  useEffect(() => {
    connect();
  }, [connect]);

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/kds" replace />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/kds" element={<KDSPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/qr" element={<QRPage />} />
          <Route path="/tables" element={<TablesPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
