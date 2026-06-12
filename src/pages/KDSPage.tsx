import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import { useStore } from '../store/useStore';
import type { Order } from '../store/useStore';
import { Clock, ChefHat, CheckCircle2 } from 'lucide-react';

const OrderCard = ({ order, onStatusChange }: { order: Order, onStatusChange: (status: Order['status']) => void }) => {
  const [duration, setDuration] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = dayjs();
      const created = dayjs(order.createdAt);
      const diffInSeconds = now.diff(created, 'second');
      const m = Math.floor(diffInSeconds / 60);
      const s = diffInSeconds % 60;
      setDuration(`${m}m ${s}s`);
    };

    updateTime();
    // Only update timer if not served or cancelled
    if (order.status !== 'served' && order.status !== 'cancelled') {
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [order.createdAt, order.status]);

  const getStatusColor = () => {
    switch (order.status) {
      case 'received': return 'bg-white text-primary border-secondary/30';
      case 'preparing': return 'bg-beige text-primary border-secondary/60';
      case 'served': return 'bg-secondary/30 text-text-muted border-secondary/20';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const isLongWait = order.status !== 'served' && dayjs().diff(dayjs(order.createdAt), 'minute') > 5;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`p-4 rounded-2xl border-2 bg-white shadow-sm ${getStatusColor()} ${isLongWait ? 'border-red-400' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="bg-white px-3 py-1 rounded-lg shadow-sm font-bold text-primary border border-secondary/20">
          โต๊ะ {order.tableId}
        </div>
        <div className={`flex items-center gap-1.5 text-sm font-medium ${isLongWait ? 'text-red-600' : ''}`}>
          <Clock size={16} />
          {duration}
        </div>
      </div>

      <div className="space-y-2 mb-4 bg-white/50 p-3 rounded-xl">
        {order.items.map((item, idx) => (
          <div key={idx} className="text-sm text-gray-800">
            <span className="font-bold">{item.quantity}x</span> {item.name}
            {item.options.type !== 'none' && <span className="text-gray-500 ml-1">({item.options.type})</span>}
            <div className="text-xs text-text-muted ml-5 mt-0.5">
              หวาน: {item.options.sweetness}%
              {item.options.toppings.length > 0 && ` • ${item.options.toppings.join(', ')}`}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {order.status === 'received' && (
          <button
            onClick={() => onStatusChange('preparing')}
            className="flex-1 bg-primary hover:bg-black text-white py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <ChefHat size={16} /> กำลังทำ
          </button>
        )}
        {order.status === 'preparing' && (
          <button
            onClick={() => onStatusChange('served')}
            className="flex-1 bg-secondary hover:bg-[#c2a27b] text-primary py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <CheckCircle2 size={16} /> เสิร์ฟแล้ว
          </button>
        )}
      </div>
    </motion.div>
  );
};

export const KDSPage = () => {
  const orders = useStore((state) => state.orders);
  const updateOrderStatus = useStore((state) => state.updateOrderStatus);

  const columns = [
    { id: 'received', title: 'ออเดอร์ใหม่', color: 'bg-white/50 border border-secondary/20 shadow-sm' },
    { id: 'preparing', title: 'กำลังทำ', color: 'bg-beige/40 border border-secondary/30 shadow-sm' },
    { id: 'served', title: 'เสิร์ฟแล้ว', color: 'bg-black/5 border border-gray-200' }
  ];

  return (
    <div className="h-full flex flex-col">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">กระดานครัว (KDS)</h2>
          <p className="text-text-muted mt-1">จัดการออเดอร์แบบเรียลไทม์</p>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-3 gap-6">
        {columns.map((col) => {
          const colOrders = orders
            .filter((o) => o.status === col.id)
            .sort((a, b) => {
              if (col.id === 'served') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              }
              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });
          
          return (
            <div key={col.id} className={`rounded-3xl p-4 flex flex-col h-[calc(100vh-140px)] ${col.color}`}>
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-bold text-primary text-lg">{col.title}</h3>
                <span className="bg-white text-primary px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-secondary/30">
                  {colOrders.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4 scrollbar-hide">
                <AnimatePresence mode="popLayout">
                  {colOrders.map((order) => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      onStatusChange={(status) => updateOrderStatus(order.id, status)} 
                    />
                  ))}
                  {colOrders.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="text-center text-text-muted mt-10 font-medium"
                    >
                      ไม่มีออเดอร์
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
