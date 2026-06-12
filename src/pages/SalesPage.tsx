import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { TrendingUp, Receipt, DollarSign, BarChart3 } from 'lucide-react';
import dayjs from 'dayjs';

export const SalesPage = () => {
  const orders = useStore((state) => state.orders);
  const [filter, setFilter] = useState<'today' | 'month' | 'all'>('today');

  // Calculate stats
  const stats = useMemo(() => {
    // Only count completed/served orders for actual sales? 
    // Or maybe any non-cancelled order is fine. Let's use all non-cancelled.
    let validOrders = orders.filter(o => o.status !== 'cancelled');
    
    const now = dayjs();
    if (filter === 'today') {
      validOrders = validOrders.filter(o => dayjs(o.createdAt).isSame(now, 'day'));
    } else if (filter === 'month') {
      validOrders = validOrders.filter(o => dayjs(o.createdAt).isSame(now, 'month'));
    }
    const totalSales = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = validOrders.length;
    
    // Popular items
    const itemCounts: Record<string, { name: string; quantity: number; revenue: number }> = {};
    validOrders.forEach(order => {
      order.items.forEach(item => {
        if (!itemCounts[item.menuId]) {
          itemCounts[item.menuId] = { name: item.name, quantity: 0, revenue: 0 };
        }
        itemCounts[item.menuId].quantity += item.quantity;
        itemCounts[item.menuId].revenue += item.price * item.quantity;
      });
    });

    const popularItems = Object.values(itemCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Recent orders to show
    const recentOrders = [...validOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return { totalSales, totalOrders, popularItems, recentOrders };
  }, [orders, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary">สรุปยอดขาย</h2>
          <p className="text-text-muted mt-1">ข้อมูลสถิติและยอดขาย</p>
        </div>
        
        <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'today' ? 'bg-primary text-white shadow' : 'text-text-muted hover:bg-gray-50'
            }`}
          >
            วันนี้
          </button>
          <button
            onClick={() => setFilter('month')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'month' ? 'bg-primary text-white shadow' : 'text-text-muted hover:bg-gray-50'
            }`}
          >
            เดือนนี้
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'all' ? 'bg-primary text-white shadow' : 'text-text-muted hover:bg-gray-50'
            }`}
          >
            ทั้งหมด
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-text-muted">ยอดขายรวม</p>
            <p className="text-3xl font-bold text-primary">฿{stats.totalSales.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <Receipt size={24} />
          </div>
          <div>
            <p className="text-sm text-text-muted">จำนวนออเดอร์ (ไม่รวมที่ยกเลิก)</p>
            <p className="text-3xl font-bold text-primary">{stats.totalOrders} ออเดอร์</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-orange-500" />
            เมนูขายดี 5 อันดับแรก
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-text-muted text-sm">
                  <th className="pb-3 font-medium">ชื่อเมนู</th>
                  <th className="pb-3 font-medium text-right">จำนวน</th>
                  <th className="pb-3 font-medium text-right">ยอดขาย</th>
                </tr>
              </thead>
              <tbody>
                {stats.popularItems.map((item, index) => (
                  <tr key={index} className="border-b border-gray-50 last:border-0 text-sm">
                    <td className="py-4 text-primary font-medium">{item.name}</td>
                    <td className="py-4 text-right">{item.quantity}</td>
                    <td className="py-4 text-right font-medium text-green-600">฿{item.revenue.toLocaleString()}</td>
                  </tr>
                ))}
                {stats.popularItems.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-text-muted">
                      ยังไม่มีข้อมูลการขาย
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-500" />
            ออเดอร์ล่าสุด
          </h3>
          <div className="space-y-4">
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="font-medium text-primary">ออเดอร์จากโต๊ะ {order.tableId}</p>
                  <p className="text-xs text-text-muted mt-1">{dayjs(order.createdAt).format('DD MMM YYYY, HH:mm')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">฿{order.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-text-muted mt-1">{order.items.length} รายการ</p>
                </div>
              </div>
            ))}
            {stats.recentOrders.length === 0 && (
              <div className="py-8 text-center text-text-muted">
                ยังไม่มีข้อมูลออเดอร์
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
