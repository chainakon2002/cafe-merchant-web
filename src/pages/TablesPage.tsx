import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import { Receipt, CheckCircle, Clock, QrCode, X, Printer } from 'lucide-react';
import { useStore } from '../store/useStore';

export const TablesPage = () => {
  const activeSessions = useStore((state) => state.activeSessions);
  const closeSession = useStore((state) => state.closeSession);
  const orders = useStore((state) => state.orders);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);

  const CUSTOMER_APP_URL = import.meta.env.VITE_CUSTOMER_APP_URL || (import.meta.env.DEV ? 'http://localhost:5173' : 'https://cafe-customerm.vercel.app');

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">จัดการโต๊ะ (Tables & Billing)</h2>
          <p className="text-text-muted mt-1">เช็คบิลและปิดโต๊ะเมื่อลูกค้าทานเสร็จ</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-secondary/20 flex items-center gap-2">
          <span className="text-sm font-bold text-primary">โต๊ะที่กำลังเปิด:</span>
          <span className="bg-primary text-white px-2 py-0.5 rounded-md text-sm font-bold">{activeSessions?.length || 0}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        {!activeSessions || activeSessions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="text-secondary mb-4 opacity-50">
              <CheckCircle size={48} />
            </div>
            <p className="text-xl font-bold text-primary mb-2">ยังไม่มีโต๊ะที่เปิดอยู่</p>
            <p className="text-text-muted">คุณสามารถเปิดโต๊ะได้ที่เมนู "สร้างคิวอาร์โค้ด"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {activeSessions.map((session) => {
                const sessionOrders = orders.filter(o => o.sessionId === session.id && o.status !== 'cancelled');
                const totalAmount = sessionOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                const allItems = sessionOrders.flatMap(o => o.items || []);
                const totalItemsCount = allItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

                return (
                  <motion.div
                    key={session.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => setSelectedQR(session.id)}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-secondary/20 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group"
                  >
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-primary group-hover:text-secondary transition-colors">โต๊ะ {session.tableNumber}</h3>
                          <p className="text-xs text-text-muted mt-1 font-mono truncate max-w-[150px]">ID: {session.id}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-secondary bg-beige px-2 py-1 rounded-lg">
                          <Clock size={14} />
                          เปิดเมื่อ {dayjs(session.createdAt).format('HH:mm')}
                        </div>
                      </div>

                      {/* Orders Summary */}
                      {sessionOrders.length > 0 ? (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex-1 flex flex-col">
                          <div className="text-sm font-bold text-primary mb-2">รายการอาหาร ({totalItemsCount} รายการ)</div>
                          <ul className="text-sm text-text-muted space-y-1 mb-4">
                            {allItems.slice(0, 3).map((item, idx) => (
                              <li key={idx} className="flex justify-between">
                                <span className="truncate pr-2">{item.quantity}x {item.name}</span>
                                <span>{item.price * item.quantity}.-</span>
                              </li>
                            ))}
                            {allItems.length > 3 && (
                              <li className="text-xs text-gray-400 italic pt-1">และอีก {allItems.length - 3} รายการ...</li>
                            )}
                          </ul>
                          <div className="flex justify-between items-center bg-beige p-3 rounded-xl font-bold text-primary mt-auto">
                            <span>ยอดรวมทั้งสิ้น</span>
                            <span className="text-lg text-secondary">{totalAmount}.-</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-400 italic text-center py-4">
                          ยังไม่มีรายการสั่งอาหาร
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`ยืนยันการเช็คบิล โต๊ะ ${session.tableNumber} ยอดรวม ${totalAmount} บาท?`)) {
                          closeSession(session.id);
                        }
                      }}
                      className="w-full mt-6 bg-primary hover:bg-black text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm print:hidden"
                    >
                      <Receipt size={18} />
                      เช็คบิล / ปิดโต๊ะ
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {selectedQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0">
            <div 
              className="absolute inset-0 bg-black/60 print:hidden"
              onClick={() => setSelectedQR(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full z-10 print:shadow-none print:p-0 flex flex-col items-center"
            >
              <button 
                onClick={() => setSelectedQR(null)}
                className="absolute top-4 right-4 p-2 bg-gray-100 text-gray-500 hover:text-gray-800 rounded-full print:hidden"
              >
                <X size={20} />
              </button>
              
              {(() => {
                const session = activeSessions?.find(s => s.id === selectedQR);
                if (!session) return null;
                const qrValue = `${CUSTOMER_APP_URL}/${session.id}`;
                
                return (
                  <>
                    <h1 className="text-2xl font-bold text-primary mb-2">สแกนเพื่อสั่งอาหาร</h1>
                    <p className="text-text-muted mb-6 font-medium">โต๊ะ {session.tableNumber}</p>
                    
                    <div className="p-4 border-4 border-primary rounded-2xl bg-white">
                      <QRCodeSVG 
                        value={qrValue} 
                        size={200}
                        level="H"
                        fgColor="#3E2723"
                        imageSettings={{
                          src: "https://placehold.co/100x100/3E2723/FFF?text=Cafe",
                          x: undefined,
                          y: undefined,
                          height: 40,
                          width: 40,
                          excavate: true,
                        }}
                      />
                    </div>
                    
                    <p className="text-sm text-gray-400 mt-6 font-mono max-w-[200px] truncate print:hidden">{qrValue}</p>
                    
                    <button
                      onClick={() => window.print()}
                      className="w-full mt-8 bg-primary text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-sm print:hidden"
                    >
                      <Printer size={20} />
                      พิมพ์คิวอาร์โค้ด
                    </button>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


